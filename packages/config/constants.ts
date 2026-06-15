/**
 * App-wide constants shared by every workspace.
 *
 * NOTE: `USER_ROLES` and `SUBSCRIPTION_PLANS` intentionally mirror the Postgres
 * enums/columns defined in `supabase/migrations/00001_init.sql`. Keep them in sync —
 * the database is the ultimate source of truth, this is the typed mirror for clients.
 */
export const APP_NAME = "VaidIQ" as const;

/** Mirrors the Postgres `user_role` enum. */
export const USER_ROLES = ["Owner", "Doctor", "Receptionist", "Accountant"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Mirrors allowed values for `clinics.subscription_plan`. */
export const SUBSCRIPTION_PLANS = ["Starter", "Growth", "Scale"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const DEFAULT_SUBSCRIPTION_PLAN: SubscriptionPlan = "Starter";
