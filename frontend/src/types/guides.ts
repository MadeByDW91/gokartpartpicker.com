/**
 * Guide types for installation guides system
 */

export interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  content_type: 'guide';
  category: string | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  estimated_time_minutes: number | null;
  featured_image_url: string | null;
  related_engine_id: string | null;
  related_part_id: string | null;
  tags: string[];
  views_count: number;
  helpful_count: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuideStep {
  id: string;
  guide_id: string;
  step_number: number;
  title: string;
  description: string | null;
  instructions: string;
  image_url: string | null;
  video_url: string | null;
  warning: string | null;
  tips: string | null;
  sort_order: number;
}

export interface GuideWithSteps extends Guide {
  steps: GuideStep[];
}
