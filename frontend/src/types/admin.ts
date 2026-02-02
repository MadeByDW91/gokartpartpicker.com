/**
 * Admin-specific types for GoKartPartPicker
 * Extended types with full database fields for admin CRUD
 */

import type { ShaftType, PartCategory, ElectricMotor } from './database';

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

// Full electric motor type matching database schema (for admin)
export interface AdminElectricMotor extends ElectricMotor {
  // All fields from ElectricMotor are already included
}

// Form input for creating/updating electric motors
export interface MotorFormInput {
  slug: string;
  name: string;
  brand: string;
  model?: string | null;
  variant?: string | null;
  voltage: number;
  power_kw: number;
  peak_power_kw?: number | null;
  horsepower: number;
  torque_lbft: number;
  rpm_max?: number | null;
  rpm_rated?: number | null;
  efficiency?: number | null;
  shaft_diameter?: number | null;
  shaft_length?: number | null;
  shaft_type: ShaftType;
  mount_type?: string | null;
  controller_required: boolean;
  cooling_type?: string | null;
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

// ============================================================================
// Product Ingestion Types
// ============================================================================

// Import Job
export interface ImportJob {
  id: string;
  name: string;
  source_type: string;
  source_file: string | null;
  status: 'ingesting' | 'completed' | 'failed' | 'cancelled';
  total_rows: number;
  processed_rows: number;
  created_by: string;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
  created_by_profile?: {
    username: string | null;
    email: string | null;
  };
}

// Import Raw Record
export interface ImportRawRecord {
  id: string;
  import_job_id: string;
  row_number: number;
  raw_data: Record<string, unknown>;
  status: 'pending' | 'processed' | 'error';
  error_message: string | null;
  created_at: string;
}

// Part Proposal
export interface PartProposal {
  id: string;
  import_job_id: string;
  raw_record_id: string;
  proposed_part_id: string | null;
  status: 'proposed' | 'approved' | 'rejected' | 'published';
  proposed_data: Record<string, unknown>;
  match_confidence: number | null;
  match_reason: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  created_at: string;
}

// Compatibility Proposal
export interface CompatibilityProposal {
  id: string;
  part_proposal_id: string;
  engine_id: string;
  compatibility_level: 'direct_fit' | 'requires_modification' | 'adapter_required';
  notes: string | null;
  status: 'proposed' | 'approved' | 'rejected';
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  engines?: {
    id: string;
    name: string;
    brand: string;
    slug: string;
  };
}

// Link Candidate
export interface LinkCandidate {
  id: string;
  part_proposal_id: string | null;
  part_id: string | null;
  link_type: 'amazon_affiliate' | 'ebay_affiliate' | 'other_affiliate' | 'non_affiliate';
  url: string;
  vendor_name: string | null;
  price: number | null;
  in_stock: boolean | null;
  status: 'candidate' | 'approved' | 'rejected';
  generated_by: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// Review Queue Item
export interface ReviewQueueItem extends PartProposal {
  import_jobs?: {
    name: string;
    source_type: string;
    created_at: string;
  };
  raw_records?: {
    row_number: number;
  }[];
}

// Ingestion Result
export interface IngestionResult {
  totalRows: number;
  processedRows: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

// Import Job Details
export interface ImportJobDetails extends ImportJob {
  created_by_profile?: AdminProfile;
  raw_records?: ImportRawRecord[];
  part_proposals?: PartProposal[];
}

// Part Proposal Detail
export interface PartProposalDetail extends PartProposal {
  import_jobs?: ImportJob;
  raw_records?: ImportRawRecord;
  proposed_part?: AdminPart;
  compatibility_proposals?: CompatibilityProposal[];
  link_candidates?: LinkCandidate[];
}

// Bulk Publish Result
export interface BulkPublishResult {
  published: Array<{
    proposalId: string;
    partId: string;
  }>;
  failed: Array<{
    proposalId: string;
    error: string;
  }>;
}
