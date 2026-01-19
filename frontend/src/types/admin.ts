/**
 * Admin-specific types for GoKartPartPicker
 * Extended types with full database fields for admin CRUD
 */

import type { ShaftType, PartCategory } from './database';

// User roles - matches database enum
export const USER_ROLES = ['user', 'admin', 'super_admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Profile with role for admin access
export interface AdminProfile {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Full engine type matching database schema
export interface AdminEngine {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string | null;
  variant: string | null;
  displacement_cc: number;
  horsepower: number;
  torque: number | null;
  shaft_diameter: number;
  shaft_length: number | null;
  shaft_type: ShaftType;
  shaft_keyway: number | null;
  mount_type: string | null;
  oil_capacity_oz: number | null;
  fuel_tank_oz: number | null;
  weight_lbs: number | null;
  price: number | null;
  image_url: string | null;
  affiliate_url: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Form input for creating/updating engines
export interface EngineFormInput {
  slug: string;
  name: string;
  brand: string;
  model?: string | null;
  variant?: string | null;
  displacement_cc: number;
  horsepower: number;
  torque?: number | null;
  shaft_diameter: number;
  shaft_length?: number | null;
  shaft_type: ShaftType;
  shaft_keyway?: number | null;
  mount_type?: string | null;
  oil_capacity_oz?: number | null;
  fuel_tank_oz?: number | null;
  weight_lbs?: number | null;
  price?: number | null;
  image_url?: string | null;
  affiliate_url?: string | null;
  is_active?: boolean;
  notes?: string | null;
}

// Full part type matching database schema
export interface AdminPart {
  id: string;
  slug: string;
  name: string;
  category: PartCategory;
  category_id: string | null;
  brand: string | null;
  specifications: Record<string, unknown>;
  price: number | null;
  image_url: string | null;
  affiliate_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: 'create' | 'update' | 'delete';
  table_name: string;
  record_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  // Joined
  profile?: AdminProfile;
}

// Admin dashboard stats
export interface AdminStats {
  engines_count: number;
  parts_count: number;
  builds_count: number;
  users_count: number;
  recent_activity: AuditLogEntry[];
}

// Action result type for server actions
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
