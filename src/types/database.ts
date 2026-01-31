export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type CategoryId = 
  | 'tshirt' 
  | 'shirt' 
  | 'sweater' 
  | 'jacket' 
  | 'pants' 
  | 'shorts' 
  | 'shoes'
  | 'other';

export interface Database {
  public: {
    Tables: {
      clothes: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          color: string | null
          image_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          color?: string | null
          image_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          color?: string | null
          image_url?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      wear_history: {
        Row: {
          id: string
          user_id: string
          clothing_id: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          clothing_id: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          clothing_id?: string
          date?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}