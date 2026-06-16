import { AppState } from "react-native";
import { supabaseMobile } from "@vaidiq/db/mobile";

/**
 * Pause/resume Supabase token auto-refresh with the app's foreground state, per
 * Supabase's React Native guidance. Refreshing only while active avoids wasted
 * network churn and stale-token races on resume.
 *
 * Call once from the root component AFTER EXPO_PUBLIC_SUPABASE_* are configured
 * (importing supabaseMobile constructs the client, which requires those env vars):
 *
 *   useEffect(() => registerAuthRefresh(), []);
 *
 * Returns an unsubscribe function.
 */
export function registerAuthRefresh(): () => void {
  supabaseMobile.auth.startAutoRefresh();

  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabaseMobile.auth.startAutoRefresh();
    } else {
      supabaseMobile.auth.stopAutoRefresh();
    }
  });

  return () => subscription.remove();
}
