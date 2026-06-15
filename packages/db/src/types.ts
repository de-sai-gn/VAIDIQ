/**
 * Typed database schema for VaidIQ.
 *
 * This mirrors the shape that `supabase gen types typescript` produces. Until the
 * Supabase CLI is wired (see package.json `gen:types`), this is the hand-authored
 * source of truth that keeps both clients fully typed. Regenerate after any
 * migration with: `pnpm --filter @vaidiq/db gen:types`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Mirrors the Postgres `user_role` enum (00001_init.sql). */
export type UserRole = "Owner" | "Doctor" | "Receptionist" | "Accountant";

export interface Database {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string;
          name: string;
          subscription_plan: string;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          subscription_plan?: string;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          subscription_plan?: string;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          tenant_id: string;
          role: UserRole;
          full_name: string;
          phone_number: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          role: UserRole;
          full_name: string;
          phone_number?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          role?: UserRole;
          full_name?: string;
          phone_number?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
        ];
      };
      patients: {
        Row: {
          id: string;
          tenant_id: string;
          abha_id: string | null;
          first_name: string;
          last_name: string | null;
          phone: string | null;
          dob: string | null;
          tags: string[];
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          abha_id?: string | null;
          first_name: string;
          last_name?: string | null;
          phone?: string | null;
          dob?: string | null;
          tags?: string[];
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          abha_id?: string | null;
          first_name?: string;
          last_name?: string | null;
          phone?: string | null;
          dob?: string | null;
          tags?: string[];
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "patients_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      get_auth_tenant_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      bootstrap_clinic: {
        Args: {
          clinic_name: string;
          owner_full_name: string;
          owner_phone?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: { [_ in never]: never };
  };
}

/** Convenience row aliases for app code. */
export type ClinicRow = Database["public"]["Tables"]["clinics"]["Row"];
export type UserProfileRow = Database["public"]["Tables"]["users"]["Row"];
export type PatientRow = Database["public"]["Tables"]["patients"]["Row"];
