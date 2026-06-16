import "react-native-url-polyfill/auto";
import { StatusBar } from "expo-status-bar";
import { TamaguiProvider, XStack, YStack, Text } from "tamagui";
import { APP_NAME, theme, USER_ROLES } from "@vaidiq/config";
import type { UserRole } from "@vaidiq/db";
import { tamaguiConfig } from "./tamagui.config";

// Renders with Tamagui (TamaguiProvider + Stacks), themed by the same
// @vaidiq/config tokens the web app uses — single source of truth across
// platforms. The Supabase mobile client lives at "@vaidiq/db/mobile" and the
// AppState auto-refresh helper at src/lib/auth-refresh.ts (wired once
// EXPO_PUBLIC_SUPABASE_* are set).
export default function App() {
  const roles: readonly UserRole[] = USER_ROLES;

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding={24}
        backgroundColor={theme.colors.surface}
      >
        <YStack
          width="100%"
          maxWidth={420}
          padding={24}
          gap={12}
          borderRadius={theme.radius.card}
          borderWidth={1}
          borderColor={theme.colors.border}
          backgroundColor={theme.colors.white}
        >
          <XStack
            alignSelf="flex-start"
            backgroundColor={theme.colors.primary}
            borderRadius={theme.radius.button}
            paddingHorizontal={12}
            paddingVertical={4}
          >
            <Text color={theme.colors.white} fontWeight="600">
              {APP_NAME}
            </Text>
          </XStack>

          <Text fontSize={20} fontWeight="600" color={theme.colors.sidebar}>
            Monorepo foundation is live
          </Text>
          <Text color={theme.colors.muted}>
            Shared tokens + Tamagui + the typed Supabase layer, wired for Expo.
          </Text>

          <XStack flexWrap="wrap" gap={8}>
            {roles.map((role) => (
              <Text
                key={role}
                fontSize={12}
                color={theme.colors.muted}
                borderWidth={1}
                borderColor={theme.colors.border}
                borderRadius={theme.radius.button}
                paddingHorizontal={8}
                paddingVertical={4}
              >
                {role}
              </Text>
            ))}
          </XStack>
        </YStack>
        <StatusBar style="dark" />
      </YStack>
    </TamaguiProvider>
  );
}
