export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          bio: string | null
          business_focus: string | null
          scripture: string | null
          total_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_focus?: string | null
          scripture?: string | null
          total_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_focus?: string | null
          scripture?: string | null
          total_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      quests: {
        Row: {
          id: string
          title: string
          description: string
          points_value: number
          category: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          points_value?: number
          category?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          points_value?: number
          category?: string
          is_active?: boolean
          created_at?: string
        }
      }
      quest_completions: {
        Row: {
          id: string
          quest_id: string
          user_id: string
          completed_at: string
        }
        Insert: {
          id?: string
          quest_id: string
          user_id: string
          completed_at?: string
        }
        Update: {
          id?: string
          quest_id?: string
          user_id?: string
          completed_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Quest = Database['public']['Tables']['quests']['Row']
export type QuestCompletion = Database['public']['Tables']['quest_completions']['Row']