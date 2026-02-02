/**
 * Build Template types
 */

import type { Engine } from './database';
import type { Part } from './database';

export const TEMPLATE_GOALS = [
  'speed',
  'torque',
  'budget',
  'beginner',
  'competition',
  'kids',
  'offroad',
  'onroad',
  'racing',
] as const;

export type TemplateGoal = (typeof TEMPLATE_GOALS)[number];

export interface BuildTemplate {
  id: string;
  name: string;
  description: string | null;
  goal: TemplateGoal;
  engine_id: string | null;
  parts: Record<string, string>; // {category: part_id}
  total_price: number | null;
  estimated_hp: number | null;
  estimated_torque: number | null;
  is_public: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  engine?: Engine;
}

export interface TemplateFormInput {
  name: string;
  description?: string | null;
  goal: TemplateGoal;
  engine_id?: string | null;
  parts: Record<string, string>;
  total_price?: number | null;
  estimated_hp?: number | null;
  estimated_torque?: number | null;
  is_public?: boolean;
  is_active?: boolean;
}
