import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { ENV_KEYS, requireEnv } from "@vaidiq/config";
import type { Database } from "./types";
import { ExpoSecureStoreAdapter } from "./secure-store-adapter";

/**
 * Supabase client for the Expo / React Native app.
 *
 * Session tokens are persisted via `ExpoSecureStoreAdapter`, which encrypts them
 * in the iOS Keychain / Android Keystore (and chunks large sessions past
 * SecureStore's ~2 KB limit) — avoiding the AsyncStorage vulnerability of leaving
 * tokens in plaintext app storage.
 *
 * `detectSessionInUrl` is off because there is no URL-based auth callback on native.
 *
 * TIP (wire in Step 5): drive `supabaseMobile.auth.startAutoRefresh()` /
 * `stopAutoRefresh()` from React Native's `AppState` so token refresh pauses in
 * the background.
 */
export const supabaseMobile = createClient<Database>(
  requireEnv(ENV_KEYS.mobile.supabaseUrl, process.env.EXPO_PUBLIC_SUPABASE_URL),
  requireEnv(ENV_KEYS.mobile.supabaseAnonKey, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
