export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'student' | 'admin' | 'curador';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          specialty_target: string | null;
          college: string | null;
          graduation_year: number | null;
          daily_goal: number;
          phone: string | null;
          state: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: UserRole;
          specialty_target?: string | null;
          college?: string | null;
          graduation_year?: number | null;
          daily_goal?: number;
          phone?: string | null;
          state?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: UserRole;
          specialty_target?: string | null;
          college?: string | null;
          graduation_year?: number | null;
          daily_goal?: number;
          phone?: string | null;
          state?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      study_materials: {
        Row: {
          id: string;
          focus_id: string | null;
          title: string;
          specialty: string;
          theme: string;
          focus: string;
          read_time_minutes: number;
          last_updated_year: number;
          guideline_badge: string;
          summary_snippet: string | null;
          markdown_content: string;
          key_points: Json;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          focus_id?: string | null;
          title: string;
          specialty: string;
          theme: string;
          focus: string;
          read_time_minutes?: number;
          last_updated_year?: number;
          guideline_badge?: string;
          summary_snippet?: string | null;
          markdown_content: string;
          key_points?: Json;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          focus_id?: string | null;
          title?: string;
          specialty?: string;
          theme?: string;
          focus?: string;
          read_time_minutes?: number;
          last_updated_year?: number;
          guideline_badge?: string;
          summary_snippet?: string | null;
          markdown_content?: string;
          key_points?: Json;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      question_reports: {
        Row: {
          id: string;
          user_id: string | null;
          user_email: string;
          question_id: string;
          reason: string;
          details: string;
          status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_email: string;
          question_id: string;
          reason: string;
          details: string;
          status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_email?: string;
          question_id?: string;
          reason?: string;
          details?: string;
          status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_question_history: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          selected_option: string;
          is_correct: boolean;
          time_spent_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          selected_option: string;
          is_correct: boolean;
          time_spent_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          selected_option?: string;
          is_correct?: boolean;
          time_spent_seconds?: number | null;
          created_at?: string;
        };
      };
      user_bookmarked_questions: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          created_at?: string;
        };
      };
      user_study_folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_custom_lists: {
        Row: {
          id: string;
          user_id: string;
          folder_id: string | null;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          folder_id?: string | null;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          folder_id?: string | null;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_orders: {
        Row: {
          id: string;
          user_id: string;
          payment_id: string | null;
          status: string;
          amount: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          payment_id?: string | null;
          status: string;
          amount: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          payment_id?: string | null;
          status?: string;
          amount?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ambassador_profiles: {
        Row: {
          id: string;
          user_id: string;
          referral_code: string;
          commission_percentage: number;
          pix_key: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          referral_code: string;
          commission_percentage?: number;
          pix_key?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          referral_code?: string;
          commission_percentage?: number;
          pix_key?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
    };
  };
}

