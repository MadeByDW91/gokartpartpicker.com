/**
 * Database types for GoKartPartPicker
 * Based on db-query-contract.md
 */

// Part categories - Must match database enum `part_category`
// See: supabase/migrations/20260116000001_initial_schema.sql
export const PART_CATEGORIES = [
  // Drive train
  'clutch',
  'torque_converter',
  'chain',
  'sprocket',
  // Chassis
  'axle',
  'wheel',
  'tire',
  'tire_front',
  'tire_rear',
  'brake',
  'throttle',
  'pedals',
  'frame',
  // Engine performance
  'carburetor',
  'exhaust',
  'air_filter',
  'camshaft',
  'valve_spring',
  'flywheel',
  'ignition',
  'connecting_rod',
  'piston',
  'crankshaft',
  'oil_system',
  'header',
  'fuel_system',
  'gasket',
  'hardware',
  'other',
  // EV-specific categories
  'battery',
  'motor_controller',
  'bms',
  'charger',
  'throttle_controller',
  'voltage_converter',
  'battery_mount',
  'wiring_harness',
  'fuse_kill_switch',
] as const;

export type PartCategory = (typeof PART_CATEGORIES)[number];

// Shaft types
export const SHAFT_TYPES = ['straight', 'tapered', 'threaded'] as const;
export type ShaftType = (typeof SHAFT_TYPES)[number];

// Power source types
export type PowerSourceType = 'gas' | 'electric';

// Engine type
export interface Engine {
  id: string;
  slug: string;
  name: string;
  brand: string;
  displacement_cc: number;
  horsepower: number;
  torque: number;
  shaft_diameter: number;
  shaft_length: number;
  shaft_type: ShaftType;
  mount_type: string;
  weight_lbs: number | null;
  price: number | null;
  image_url: string | null;
  schematic_url: string | null;
  manual_url: string | null;
  affiliate_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Electric Motor type
export interface ElectricMotor {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string | null;
  variant: string | null;
  voltage: number; // 12, 24, 36, 48, 72, 96 (volts)
  power_kw: number; // Continuous power in kW
  peak_power_kw: number | null; // Peak/burst power in kW
  horsepower: number; // Calculated/converted for display
  torque_lbft: number; // Torque in lb-ft (imperial)
  rpm_max: number | null; // Maximum RPM
  rpm_rated: number | null; // Rated/continuous RPM
  efficiency: number | null; // 0.85 = 85% efficiency
  shaft_diameter: number | null; // inches (for chain drive motors)
  shaft_length: number | null; // inches
  shaft_type: ShaftType; // straight, tapered, threaded (NO 'direct_drive' in Phase 1)
  mount_type: string | null;
  controller_required: boolean;
  cooling_type: string | null; // 'air', 'liquid', 'passive'
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

// Part type
export interface Part {
  id: string;
  slug: string;
  name: string;
  category: PartCategory;
  brand: string | null;
  specifications: Record<string, unknown> | null;
  price: number | null;
  image_url: string | null;
  affiliate_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Build type
export interface Build {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  engine_id: string | null;
  motor_id: string | null; // For electric builds
  power_source_type: PowerSourceType; // 'gas' or 'electric'
  parts: { [category: string]: string };
  total_price: number;
  is_public: boolean;
  likes_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  engine?: Engine;
  motor?: ElectricMotor; // For electric builds
  profile?: Profile;
}

// Template goal types
export const TEMPLATE_GOALS = ['speed', 'torque', 'budget', 'beginner', 'competition', 'kids', 'offroad', 'onroad', 'racing'] as const;
export type TemplateGoal = (typeof TEMPLATE_GOALS)[number];

// Template approval status
export type TemplateApprovalStatus = 'pending' | 'approved' | 'rejected';

// Build Template type
export interface BuildTemplate {
  id: string;
  name: string;
  description: string | null;
  goal: TemplateGoal;
  engine_id: string | null;
  parts: { [category: string]: string };
  total_price: number | null;
  estimated_hp: number | null;
  estimated_torque: number | null;
  is_public: boolean;
  is_active: boolean;
  approval_status: TemplateApprovalStatus;
  created_by: string | null;
  submitted_by: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  engine?: Engine;
  profile?: Profile;
  submitter?: Profile;
}

// Profile type
export interface Profile {
  id: string;
  username: string;
  email?: string;
  avatar_url: string | null;
  role?: 'user' | 'admin' | 'super_admin';
  bio?: string | null;
  location?: string | null;
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  build_goals?: string[];
  budget_range?: 'under-500' | '500-1000' | '1000-2000' | '2000-5000' | '5000-plus' | null;
  primary_use_case?: 'racing' | 'recreation' | 'kids' | 'work' | 'competition' | 'other' | null;
  interested_categories?: string[];
  newsletter_subscribed?: boolean;
  email_notifications?: boolean;
  public_profile?: boolean;
  show_builds_publicly?: boolean;
  referral_source?: string | null;
  last_active_at?: string | null;
  created_at: string;
  updated_at?: string;
}

// Compatibility Warning type
export type CompatibilityType = 'error' | 'warning' | 'info';

export interface CompatibilityWarning {
  type: CompatibilityType;
  source: string;
  target: string;
  message: string;
}

// Compatibility Rule type
export interface CompatibilityRule {
  id: string;
  rule_type: string;
  source_category: string;
  target_category: string;
  condition: Record<string, unknown>;
  warning_message: string;
  severity: CompatibilityType;
  is_active: boolean;
}

// Build parts selection
export type BuildParts = Partial<Record<PartCategory, string>>;

// Merchant type (for price comparison)
export interface Merchant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Product Price type (for price comparison)
export interface ProductPrice {
  id: string;
  part_id: string;
  merchant_id: string;
  price: number;
  shipping_cost: number;
  total_price: number; // Generated column (price + shipping_cost)
  availability_status: 'in_stock' | 'out_of_stock';
  product_url: string;
  affiliate_url: string | null;
  last_updated_at: string;
  created_at: string;
  // Joined data
  merchant?: Merchant;
  part?: Part;
}

// Filter types
export interface EngineFilters {
  brand?: string;
  min_hp?: number;
  max_hp?: number;
  min_cc?: number;
  max_cc?: number;
  shaft_type?: ShaftType;
  sort?: 'price' | 'horsepower' | 'displacement_cc';
  order?: 'asc' | 'desc';
}

export interface MotorFilters {
  brand?: string;
  voltage?: number;
  min_hp?: number;
  max_hp?: number;
  min_power_kw?: number;
  max_power_kw?: number;
  sort?: 'price' | 'horsepower' | 'power_kw' | 'voltage';
  order?: 'asc' | 'desc';
}

export interface PartFilters {
  category?: PartCategory;
  brand?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Video categories - Must match database CHECK constraint
export const VIDEO_CATEGORIES = [
  'unboxing',
  'installation',
  'maintenance',
  'modification',
  'troubleshooting',
  'tutorial',
  'review',
  'tips',
] as const;

export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

// Video type
export interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  category: VideoCategory;
  engine_id: string | null;
  part_id: string | null;
  channel_name: string | null;
  channel_url: string | null;
  view_count: number;
  like_count: number;
  published_date: string | null;
  language: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  engine?: Engine;
  part?: Part;
}

// Create video input
export interface CreateVideoInput {
  title: string;
  description?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  category: VideoCategory;
  engine_id?: string | null;
  part_id?: string | null;
  channel_name?: string | null;
  channel_url?: string | null;
  published_date?: string | null;
  language?: string;
  is_featured?: boolean;
  display_order?: number;
  is_active?: boolean;
}

// Video filters
export interface VideoFilters {
  engine_id?: string;
  part_id?: string;
  category?: VideoCategory;
  is_featured?: boolean;
  is_active?: boolean;
}

// ============================================================================
// Forum Types
// ============================================================================

// Forum Category type
export interface ForumCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  requires_auth: boolean;
  created_at: string;
  updated_at: string;
}

// Forum Topic type
export interface ForumTopic {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  slug: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_archived: boolean;
  views_count: number;
  replies_count: number;
  last_reply_at: string | null;
  last_reply_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: Profile;
  category?: ForumCategory;
  last_reply_user?: Profile;
}

// Forum Post type
export interface ForumPost {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  edited_at: string | null;
  likes_count: number;
  is_solution: boolean;
  parent_post_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: Profile;
  topic?: ForumTopic;
  parent_post?: ForumPost;
}
