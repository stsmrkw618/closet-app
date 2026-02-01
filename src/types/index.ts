export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  category: CategoryId;
  color: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface WearRecord {
  id: string;
  user_id: string;
  clothing_id: string;
  date: string; // YYYY-MM-DD
  created_at: string;
}

export interface RefreshRecord {
  id: string;
  user_id: string;
  clothing_id: string;
  refreshed_at: string; // ISO datetime
  created_at: string;
}

export type CategoryId = 
  | 'tshirt' 
  | 'shirt' 
  | 'sweater' 
  | 'jacket' 
  | 'pants' 
  | 'shorts' 
  | 'shoes'
  | 'other';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
}

export type ViewType = 'closet' | 'history' | 'add' | 'detail';

export type SortType = 'lastWorn' | 'name' | 'wearCount';

export interface User {
  id: string;
  email?: string;
}

// フレッシュネス（鮮度）のレベル
export type FreshnessLevel = 'fresh' | 'moderate' | 'stale' | 'hidden';
