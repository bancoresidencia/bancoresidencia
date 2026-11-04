export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'student' | 'admin' | 'curador' | 'curator' | 'superadmin';

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
          target_exam_name: string | null;
          target_exam_date: string | null;
          preferences: Json | null;
          subscription_plan: 'free' | 'pro' | 'premium';
          subscription_status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive' | 'refunded';
          subscription_duration: 'monthly' | 'semiannual' | 'annual' | 'biennial' | null;
          subscription_started_at: string | null;
          subscription_expires_at: string | null;
          guarantee_expires_at: string | null;
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
          target_exam_name?: string | null;
          target_exam_date?: string | null;
          preferences?: Json | null;
          subscription_plan?: 'free' | 'pro' | 'premium';
          subscription_status?: 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive' | 'refunded';
          subscription_duration?: 'monthly' | 'semiannual' | 'annual' | 'biennial' | null;
          subscription_started_at?: string | null;
          subscription_expires_at?: string | null;
          guarantee_expires_at?: string | null;
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
          target_exam_name?: string | null;
          target_exam_date?: string | null;
          preferences?: Json | null;
          subscription_plan?: 'free' | 'pro' | 'premium';
          subscription_status?: 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive' | 'refunded';
          subscription_duration?: 'monthly' | 'semiannual' | 'annual' | 'biennial' | null;
          subscription_started_at?: string | null;
          subscription_expires_at?: string | null;
          guarantee_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_answers: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          selected_option: string;
          is_correct: boolean;
          time_spent_seconds: number;
          answered_at: string;
          specialty: string | null;
          tema: string | null;
          foco: string | null;
          subfoco: string | null;
          difficulty: string | null;
          banca: string | null;
          year: number | null;
          error_reason: string | null;
          student_notes: string | null;
          status_retrial: 'pendente' | 'recuperado' | null;
          attempts: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          selected_option: string;
          is_correct?: boolean;
          time_spent_seconds?: number;
          answered_at?: string;
          specialty?: string | null;
          tema?: string | null;
          foco?: string | null;
          subfoco?: string | null;
          difficulty?: string | null;
          banca?: string | null;
          year?: number | null;
          error_reason?: string | null;
          student_notes?: string | null;
          status_retrial?: 'pendente' | 'recuperado' | null;
          attempts?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          selected_option?: string;
          is_correct?: boolean;
          time_spent_seconds?: number;
          answered_at?: string;
          specialty?: string | null;
          tema?: string | null;
          foco?: string | null;
          subfoco?: string | null;
          difficulty?: string | null;
          banca?: string | null;
          year?: number | null;
          error_reason?: string | null;
          student_notes?: string | null;
          status_retrial?: 'pendente' | 'recuperado' | null;
          attempts?: Json;
        };
      };
      user_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          bookmarked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          bookmarked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          bookmarked_at?: string;
        };
      };
      user_folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          parent_id: string | null;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          name: string;
          parent_id?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          parent_id?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_lists: {
        Row: {
          id: string;
          user_id: string;
          folder_id: string | null;
          title: string;
          question_ids: string[];
          total_questions: number;
          completed_questions: number;
          last_studied_at: string | null;
          in_progress: boolean;
          progress_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          folder_id?: string | null;
          title: string;
          question_ids?: string[];
          total_questions?: number;
          completed_questions?: number;
          last_studied_at?: string | null;
          in_progress?: boolean;
          progress_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          folder_id?: string | null;
          title?: string;
          question_ids?: string[];
          total_questions?: number;
          completed_questions?: number;
          last_studied_at?: string | null;
          in_progress?: boolean;
          progress_percentage?: number;
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
      user_study_progress: {
        Row: {
          user_id: string;
          material_id: string;
          last_read_at: string;
          read_time_minutes: number;
          is_completed: boolean;
          notes: string | null;
        };
        Insert: {
          user_id: string;
          material_id: string;
          last_read_at?: string;
          read_time_minutes?: number;
          is_completed?: boolean;
          notes?: string | null;
        };
        Update: {
          user_id?: string;
          material_id?: string;
          last_read_at?: string;
          read_time_minutes?: number;
          is_completed?: boolean;
          notes?: string | null;
        };
      };
      user_flashcard_progress: {
        Row: {
          user_id: string;
          card_id: string;
          state: 'new' | 'learning' | 'review' | 'relearning';
          repetitions: number;
          interval_days: number;
          ease_factor: number;
          stability: number;
          difficulty: number;
          retrievability: number;
          next_review_date: string;
          lapses: number;
          last_reviewed_at: string | null;
        };
        Insert: {
          user_id: string;
          card_id: string;
          state?: 'new' | 'learning' | 'review' | 'relearning';
          repetitions?: number;
          interval_days?: number;
          ease_factor?: number;
          stability?: number;
          difficulty?: number;
          retrievability?: number;
          next_review_date?: string;
          lapses?: number;
          last_reviewed_at?: string | null;
        };
        Update: {
          user_id?: string;
          card_id?: string;
          state?: 'new' | 'learning' | 'review' | 'relearning';
          repetitions?: number;
          interval_days?: number;
          ease_factor?: number;
          stability?: number;
          difficulty?: number;
          retrievability?: number;
          next_review_date?: string;
          lapses?: number;
          last_reviewed_at?: string | null;
        };
      };
      user_flashcard_decks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          card_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          title: string;
          description?: string | null;
          card_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          card_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      user_created_flashcards: {
        Row: {
          id: string;
          user_id: string;
          front: string;
          back: string;
          specialty: string | null;
          theme: string | null;
          focus: string | null;
          comment: string | null;
          priority: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          front: string;
          back: string;
          specialty?: string | null;
          theme?: string | null;
          focus?: string | null;
          comment?: string | null;
          priority?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          front?: string;
          back?: string;
          specialty?: string | null;
          theme?: string | null;
          focus?: string | null;
          comment?: string | null;
          priority?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          mp_order_id: string | null;
          mp_payment_id: string | null;
          plan_id: string;
          plan_name: string;
          amount: number;
          currency: string;
          installments: number;
          payment_method: string | null;
          status: string;
          qr_code: string | null;
          qr_code_base64: string | null;
          ticket_url: string | null;
          refund_id: string | null;
          refund_requested_at: string | null;
          refunded_at: string | null;
          guarantee_expires_at: string | null;
          raw_data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mp_order_id?: string | null;
          mp_payment_id?: string | null;
          plan_id: string;
          plan_name: string;
          amount: number;
          currency?: string;
          installments?: number;
          payment_method?: string | null;
          status?: string;
          qr_code?: string | null;
          qr_code_base64?: string | null;
          ticket_url?: string | null;
          refund_id?: string | null;
          refund_requested_at?: string | null;
          refunded_at?: string | null;
          guarantee_expires_at?: string | null;
          raw_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mp_order_id?: string | null;
          mp_payment_id?: string | null;
          plan_id?: string;
          plan_name?: string;
          amount?: number;
          currency?: string;
          installments?: number;
          payment_method?: string | null;
          status?: string;
          qr_code?: string | null;
          qr_code_base64?: string | null;
          ticket_url?: string | null;
          refund_id?: string | null;
          refund_requested_at?: string | null;
          refunded_at?: string | null;
          guarantee_expires_at?: string | null;
          raw_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      question_reports: {
        Row: {
          id: string;
          user_id: string | null;
          user_name: string | null;
          user_email: string | null;
          question_id: string;
          reason: string;
          details: string | null;
          status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
          admin_notes: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_name?: string | null;
          user_email?: string | null;
          question_id: string;
          reason?: string;
          details?: string | null;
          status?: 'pending' | 'in_review' | 'resolved' | 'dismissed';
          admin_notes?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_name?: string | null;
          user_email?: string | null;
          question_id?: string;
          reason?: string;
          details?: string | null;
          status?: 'pending' | 'in_review' | 'resolved' | 'dismissed';
          admin_notes?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          code: string | null;
          institution: string | null;
          banca: string | null;
          year: number | null;
          tipo_prova: string | null;
          modalidade: string | null;
          especialidade: string | null;
          tema: string | null;
          foco: string | null;
          subfoco: string | null;
          difficulty: string | null;
          type: string | null;
          is_anulada: boolean;
          statement: string;
          options: Json;
          images: string[] | null;
          correct_answer?: string | null;
          commentary?: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code?: string | null;
          institution?: string | null;
          banca?: string | null;
          year?: number | null;
          tipo_prova?: string | null;
          modalidade?: string | null;
          especialidade?: string | null;
          tema?: string | null;
          foco?: string | null;
          subfoco?: string | null;
          difficulty?: string | null;
          type?: string | null;
          is_anulada?: boolean;
          statement: string;
          options: Json;
          images?: string[] | null;
          correct_answer?: string | null;
          commentary?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string | null;
          institution?: string | null;
          banca?: string | null;
          year?: number | null;
          tipo_prova?: string | null;
          modalidade?: string | null;
          especialidade?: string | null;
          tema?: string | null;
          foco?: string | null;
          subfoco?: string | null;
          difficulty?: string | null;
          type?: string | null;
          is_anulada?: boolean;
          statement?: string;
          options?: Json;
          images?: string[] | null;
          correct_answer?: string | null;
          commentary?: string | null;
          created_at?: string;
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
      get_questions_stats: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
    };
    Enums: {
      user_role: UserRole;
    };
  };
}
