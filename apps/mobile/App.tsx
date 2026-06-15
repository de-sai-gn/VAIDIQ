import "react-native-url-polyfill/auto";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { APP_NAME, theme, USER_ROLES } from "@vaidiq/config";
import type { UserRole } from "@vaidiq/db";

// Consumes the same @vaidiq/config tokens as the web app (single source of
// truth) and the @vaidiq/db types — proving the shared layer resolves under
// Metro. The Supabase mobile client lives at "@vaidiq/db/mobile" and is wired
// in once auth screens exist (it reads EXPO_PUBLIC_* env at construction).
export default function App() {
  const roles: readonly UserRole[] = USER_ROLES;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{APP_NAME}</Text>
        </View>
        <Text style={styles.title}>Monorepo foundation is live</Text>
        <Text style={styles.subtitle}>
          Shared tokens + typed Supabase layer, wired for Expo.
        </Text>
        <View style={styles.rolesRow}>
          {roles.map((role) => (
            <Text key={role} style={styles.roleChip}>
              {role}
            </Text>
          ))}
        </View>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 24,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.button,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: { color: theme.colors.white, fontWeight: "600" },
  title: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.sidebar,
  },
  subtitle: { marginTop: 8, color: theme.colors.muted },
  rolesRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: theme.colors.muted,
    fontSize: 12,
  },
});
