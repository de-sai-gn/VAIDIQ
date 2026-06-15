import * as SecureStore from "expo-secure-store";

/**
 * Hardened storage adapter for Supabase auth on React Native / Expo.
 *
 * Why not the naïve adapter: `expo-secure-store` warns (and on Android can fail)
 * for values larger than ~2 KB. A Supabase session (access + refresh JWT + user
 * metadata) frequently exceeds that, so a one-line `getItemAsync`/`setItemAsync`
 * adapter silently loses sessions on real devices.
 *
 * This adapter transparently chunks large values across multiple SecureStore
 * entries and reassembles them on read, while still storing small values inline.
 * Tokens remain encrypted at rest in the iOS Keychain / Android Keystore.
 */

// Conservative per-chunk ceiling (chars). SecureStore's documented limit is ~2048
// bytes; Supabase JWTs are ASCII (base64url), so chars ≈ bytes. Headroom for any
// multibyte metadata.
const CHUNK_SIZE = 1800;

// Sentinel written to the primary key when a value was split. The suffix is the
// chunk count, e.g. "__vaidiq.chunks__:4".
const MANIFEST_PREFIX = "__vaidiq.chunks__:";

const partKey = (key: string, index: number): string => `${key}.part.${index}`;

// SecureStore only persists tokens once the device has been unlocked at least
// once after boot — required for background `autoRefreshToken`.
const SET_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

async function clearExistingChunks(key: string, manifest: string | null): Promise<void> {
  if (manifest === null || !manifest.startsWith(MANIFEST_PREFIX)) return;
  const count = Number.parseInt(manifest.slice(MANIFEST_PREFIX.length), 10);
  if (!Number.isInteger(count)) return;
  for (let i = 0; i < count; i += 1) {
    await SecureStore.deleteItemAsync(partKey(key, i));
  }
}

export const ExpoSecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const head = await SecureStore.getItemAsync(key);
    if (head === null) return null;

    // Small value stored inline.
    if (!head.startsWith(MANIFEST_PREFIX)) return head;

    const count = Number.parseInt(head.slice(MANIFEST_PREFIX.length), 10);
    if (!Number.isInteger(count) || count <= 0) return null;

    const parts: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const part = await SecureStore.getItemAsync(partKey(key, i));
      // A missing part means the record is corrupt/partial — treat as no session.
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join("");
  },

  async setItem(key: string, value: string): Promise<void> {
    // Always clear any previously-written chunks so we never leave stale parts
    // behind when a value shrinks from chunked to inline (or to fewer chunks).
    const previous = await SecureStore.getItemAsync(key);
    await clearExistingChunks(key, previous);

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value, SET_OPTIONS);
      return;
    }

    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i += 1) {
      const slice = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await SecureStore.setItemAsync(partKey(key, i), slice, SET_OPTIONS);
    }
    await SecureStore.setItemAsync(key, `${MANIFEST_PREFIX}${count}`, SET_OPTIONS);
  },

  async removeItem(key: string): Promise<void> {
    const head = await SecureStore.getItemAsync(key);
    await clearExistingChunks(key, head);
    await SecureStore.deleteItemAsync(key);
  },
};
