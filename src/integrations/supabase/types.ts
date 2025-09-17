export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          operation: string
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      beta_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      business_expenses: {
        Row: {
          amount_cents: number
          category: string
          created_at: string
          currency: string
          date: string
          description: string
          id: string
          is_recurring: boolean
          receipt_url: string | null
          recurring_frequency: string | null
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount_cents: number
          category: string
          created_at?: string
          currency?: string
          date: string
          description: string
          id?: string
          is_recurring?: boolean
          receipt_url?: string | null
          recurring_frequency?: string | null
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount_cents?: number
          category?: string
          created_at?: string
          currency?: string
          date?: string
          description?: string
          id?: string
          is_recurring?: boolean
          receipt_url?: string | null
          recurring_frequency?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: []
      }
      business_revenue: {
        Row: {
          amount_cents: number
          client_id: string | null
          created_at: string
          currency: string
          date: string
          description: string
          id: string
          is_recurring: boolean
          recurring_frequency: string | null
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          client_id?: string | null
          created_at?: string
          currency?: string
          date: string
          description: string
          id?: string
          is_recurring?: boolean
          recurring_frequency?: string | null
          source: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          date?: string
          description?: string
          id?: string
          is_recurring?: boolean
          recurring_frequency?: string | null
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_revenue_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      content_catalog: {
        Row: {
          ad_spend_cents: number | null
          comment_count: number | null
          content_type: string
          content_url: string | null
          created_at: string
          currency: string | null
          description: string | null
          duration_seconds: number | null
          engagement_rate: number | null
          file_size_mb: number | null
          hashtags: string[] | null
          id: string
          like_count: number | null
          notes: string | null
          platform_id: string | null
          published_date: string | null
          revenue_generated_cents: number | null
          scheduled_date: string | null
          share_count: number | null
          status: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          ad_spend_cents?: number | null
          comment_count?: number | null
          content_type: string
          content_url?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          duration_seconds?: number | null
          engagement_rate?: number | null
          file_size_mb?: number | null
          hashtags?: string[] | null
          id?: string
          like_count?: number | null
          notes?: string | null
          platform_id?: string | null
          published_date?: string | null
          revenue_generated_cents?: number | null
          scheduled_date?: string | null
          share_count?: number | null
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          ad_spend_cents?: number | null
          comment_count?: number | null
          content_type?: string
          content_url?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          duration_seconds?: number | null
          engagement_rate?: number | null
          file_size_mb?: number | null
          hashtags?: string[] | null
          id?: string
          like_count?: number | null
          notes?: string | null
          platform_id?: string | null
          published_date?: string | null
          revenue_generated_cents?: number | null
          scheduled_date?: string | null
          share_count?: number | null
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_catalog_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "content_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      content_expenses: {
        Row: {
          amount_cents: number
          content_id: string | null
          created_at: string
          currency: string
          date: string
          description: string
          expense_category: string
          id: string
          is_recurring: boolean
          platform_id: string | null
          receipt_url: string | null
          recurring_frequency: string | null
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount_cents: number
          content_id?: string | null
          created_at?: string
          currency?: string
          date: string
          description: string
          expense_category: string
          id?: string
          is_recurring?: boolean
          platform_id?: string | null
          receipt_url?: string | null
          recurring_frequency?: string | null
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount_cents?: number
          content_id?: string | null
          created_at?: string
          currency?: string
          date?: string
          description?: string
          expense_category?: string
          id?: string
          is_recurring?: boolean
          platform_id?: string | null
          receipt_url?: string | null
          recurring_frequency?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_expenses_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_expenses_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "content_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      content_income: {
        Row: {
          amount_cents: number
          content_id: string | null
          created_at: string
          currency: string
          date: string
          description: string
          id: string
          income_source: string
          is_recurring: boolean
          payment_status: string | null
          platform_id: string | null
          recurring_frequency: string | null
          tax_deductible: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          content_id?: string | null
          created_at?: string
          currency?: string
          date: string
          description: string
          id?: string
          income_source: string
          is_recurring?: boolean
          payment_status?: string | null
          platform_id?: string | null
          recurring_frequency?: string | null
          tax_deductible?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          content_id?: string | null
          created_at?: string
          currency?: string
          date?: string
          description?: string
          id?: string
          income_source?: string
          is_recurring?: boolean
          payment_status?: string | null
          platform_id?: string | null
          recurring_frequency?: string | null
          tax_deductible?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_income_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_income_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "content_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      content_platforms: {
        Row: {
          account_display_name: string | null
          account_handle: string
          account_url: string | null
          ad_spend_cents: number | null
          created_at: string
          followers_count: number | null
          following_count: number | null
          id: string
          is_active: boolean
          platform_name: string
          total_comments: number | null
          total_likes: number | null
          total_posts: number | null
          total_shares: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_display_name?: string | null
          account_handle: string
          account_url?: string | null
          ad_spend_cents?: number | null
          created_at?: string
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_active?: boolean
          platform_name: string
          total_comments?: number | null
          total_likes?: number | null
          total_posts?: number | null
          total_shares?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_display_name?: string | null
          account_handle?: string
          account_url?: string | null
          ad_spend_cents?: number | null
          created_at?: string
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_active?: boolean
          platform_name?: string
          total_comments?: number | null
          total_likes?: number | null
          total_posts?: number | null
          total_shares?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_events: {
        Row: {
          attendees: string[] | null
          content_opportunities: string[] | null
          cost_cents: number | null
          created_at: string
          currency: string | null
          description: string | null
          end_time: string | null
          event_type: string
          id: string
          location: string | null
          notes: string | null
          revenue_cents: number | null
          start_time: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: string[] | null
          content_opportunities?: string[] | null
          cost_cents?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          end_time?: string | null
          event_type: string
          id?: string
          location?: string | null
          notes?: string | null
          revenue_cents?: number | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: string[] | null
          content_opportunities?: string[] | null
          cost_cents?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          revenue_cents?: number | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crypto_portfolio: {
        Row: {
          average_buy_price_cents: number
          created_at: string
          currency: string
          current_price_cents: number | null
          exchange: string | null
          id: string
          name: string
          notes: string | null
          quantity: number
          symbol: string
          total_invested_cents: number
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          average_buy_price_cents?: number
          created_at?: string
          currency?: string
          current_price_cents?: number | null
          exchange?: string | null
          id?: string
          name: string
          notes?: string | null
          quantity?: number
          symbol: string
          total_invested_cents?: number
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          average_buy_price_cents?: number
          created_at?: string
          currency?: string
          current_price_cents?: number | null
          exchange?: string | null
          id?: string
          name?: string
          notes?: string | null
          quantity?: number
          symbol?: string
          total_invested_cents?: number
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      crypto_watchlist: {
        Row: {
          created_at: string
          currency: string
          current_price_cents: number | null
          id: string
          market_cap_cents: number | null
          name: string
          price_change_24h: number | null
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          current_price_cents?: number | null
          id?: string
          market_cap_cents?: number | null
          name: string
          price_change_24h?: number | null
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          current_price_cents?: number | null
          id?: string
          market_cap_cents?: number | null
          name?: string
          price_change_24h?: number | null
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          actual_revenue_cents: number | null
          amount_cents: number | null
          close_date: string | null
          created_at: string | null
          currency: string | null
          id: string
          notes: string | null
          person_id: string | null
          probability: number | null
          stage: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_revenue_cents?: number | null
          amount_cents?: number | null
          close_date?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          person_id?: string | null
          probability?: number | null
          stage?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_revenue_cents?: number | null
          amount_cents?: number | null
          close_date?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          person_id?: string | null
          probability?: number | null
          stage?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          google_calendar_id: string | null
          google_event_id: string | null
          id: string
          is_synced_with_google: boolean
          location: string | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          is_synced_with_google?: boolean
          location?: string | null
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          is_synced_with_google?: boolean
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          is_recurring: boolean
          recurring_frequency: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description: string
          id?: string
          is_recurring?: boolean
          recurring_frequency?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_recurring?: boolean
          recurring_frequency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      failed_auth_attempts: {
        Row: {
          attempt_type: string
          attempted_email: string | null
          created_at: string
          id: string
          ip_address: string
        }
        Insert: {
          attempt_type: string
          attempted_email?: string | null
          created_at?: string
          id?: string
          ip_address: string
        }
        Update: {
          attempt_type?: string
          attempted_email?: string | null
          created_at?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      fitness_goals: {
        Row: {
          created_at: string
          current_value: number | null
          description: string | null
          goal_type: string
          id: string
          is_active: boolean
          target_date: string | null
          target_value: number | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type: string
          id?: string
          is_active?: boolean
          target_date?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean
          target_date?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fitness_workouts: {
        Row: {
          calories_burned: number | null
          created_at: string
          distance_miles: number | null
          duration_minutes: number | null
          exercise_name: string
          exercise_type: string
          id: string
          notes: string | null
          reps: number | null
          sets: number | null
          updated_at: string
          user_id: string
          weight_lbs: number | null
          workout_date: string
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          distance_miles?: number | null
          duration_minutes?: number | null
          exercise_name: string
          exercise_type: string
          id?: string
          notes?: string | null
          reps?: number | null
          sets?: number | null
          updated_at?: string
          user_id: string
          weight_lbs?: number | null
          workout_date?: string
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          distance_miles?: number | null
          duration_minutes?: number | null
          exercise_name?: string
          exercise_type?: string
          id?: string
          notes?: string | null
          reps?: number | null
          sets?: number | null
          updated_at?: string
          user_id?: string
          weight_lbs?: number | null
          workout_date?: string
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          metric_type: string
          notes: string | null
          updated_at: string
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          metric_type: string
          notes?: string | null
          updated_at?: string
          user_id: string
          value: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metric_type?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      income: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          is_recurring: boolean
          recurring_frequency: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description: string
          id?: string
          is_recurring?: boolean
          recurring_frequency?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_recurring?: boolean
          recurring_frequency?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          channel: string | null
          created_at: string | null
          follow_up_date: string | null
          id: string
          module: string
          person_id: string | null
          sentiment: string | null
          summary: string
          user_id: string
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          follow_up_date?: string | null
          id?: string
          module: string
          person_id?: string | null
          sentiment?: string | null
          summary: string
          user_id: string
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          follow_up_date?: string | null
          id?: string
          module?: string
          person_id?: string | null
          sentiment?: string | null
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          quantity: number
          sku: string | null
          supplier: string | null
          unit_price_cents: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          quantity?: number
          sku?: string | null
          supplier?: string | null
          unit_price_cents?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          quantity?: number
          sku?: string | null
          supplier?: string | null
          unit_price_cents?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      key_dates: {
        Row: {
          created_at: string | null
          date_value: string
          id: string
          person_id: string | null
          recurrence: string | null
          reminder_days: number | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_value: string
          id?: string
          person_id?: string | null
          recurrence?: string | null
          reminder_days?: number | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_value?: string
          id?: string
          person_id?: string | null
          recurrence?: string | null
          reminder_days?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_dates_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      livestream_schedules: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          average_viewers: number | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          max_viewers: number | null
          notes: string | null
          platform_id: string | null
          revenue_generated_cents: number | null
          scheduled_end: string | null
          scheduled_start: string
          status: string | null
          stream_key: string | null
          stream_url: string | null
          tags: string[] | null
          title: string
          total_followers_gained: number | null
          total_messages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          average_viewers?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          max_viewers?: number | null
          notes?: string | null
          platform_id?: string | null
          revenue_generated_cents?: number | null
          scheduled_end?: string | null
          scheduled_start: string
          status?: string | null
          stream_key?: string | null
          stream_url?: string | null
          tags?: string[] | null
          title: string
          total_followers_gained?: number | null
          total_messages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          average_viewers?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          max_viewers?: number | null
          notes?: string | null
          platform_id?: string | null
          revenue_generated_cents?: number | null
          scheduled_end?: string | null
          scheduled_start?: string
          status?: string | null
          stream_key?: string | null
          stream_url?: string | null
          tags?: string[] | null
          title?: string
          total_followers_gained?: number | null
          total_messages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "livestream_schedules_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "content_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          created_at: string
          dosage_taken: string | null
          id: string
          medication_id: string
          notes: string | null
          taken_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage_taken?: string | null
          id?: string
          medication_id: string
          notes?: string | null
          taken_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage_taken?: string | null
          id?: string
          medication_id?: string
          notes?: string | null
          taken_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          medication_type: string
          name: string
          notes: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean
          medication_type: string
          name: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          medication_type?: string
          name?: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      news_feed: {
        Row: {
          category: string
          content: string | null
          created_at: string
          id: string
          is_bookmarked: boolean
          is_read: boolean
          keywords: string[] | null
          published_date: string
          sentiment: string | null
          source: string
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          id?: string
          is_bookmarked?: boolean
          is_read?: boolean
          keywords?: string[] | null
          published_date: string
          sentiment?: string | null
          source: string
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          is_bookmarked?: boolean
          is_read?: boolean
          keywords?: string[] | null
          published_date?: string
          sentiment?: string | null
          source?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          module: string
          person_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          module: string
          person_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          module?: string
          person_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          created_at: string
          currency: string
          deductions_cents: number | null
          employee_email: string | null
          employee_name: string
          gross_pay_cents: number
          hours_worked: number | null
          id: string
          net_pay_cents: number
          notes: string | null
          pay_date: string
          pay_frequency: string
          pay_period_end: string
          pay_period_start: string
          pay_rate_cents: number
          taxes_cents: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          deductions_cents?: number | null
          employee_email?: string | null
          employee_name: string
          gross_pay_cents: number
          hours_worked?: number | null
          id?: string
          net_pay_cents: number
          notes?: string | null
          pay_date: string
          pay_frequency: string
          pay_period_end: string
          pay_period_start: string
          pay_rate_cents: number
          taxes_cents?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          deductions_cents?: number | null
          employee_email?: string | null
          employee_name?: string
          gross_pay_cents?: number
          hours_worked?: number | null
          id?: string
          net_pay_cents?: number
          notes?: string | null
          pay_date?: string
          pay_frequency?: string
          pay_period_end?: string
          pay_period_start?: string
          pay_rate_cents?: number
          taxes_cents?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          address: string | null
          birthday: string | null
          company: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          last_interaction_at: string | null
          notes: string | null
          phone: string | null
          position: string | null
          social_media_links: Json | null
          tags: string[] | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          birthday?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          last_interaction_at?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          social_media_links?: Json | null
          tags?: string[] | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          birthday?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          last_interaction_at?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          social_media_links?: Json | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pto_requests: {
        Row: {
          created_at: string
          end_date: string
          hours_requested: number | null
          id: string
          notes: string | null
          pto_type: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          hours_requested?: number | null
          id?: string
          notes?: string | null
          pto_type: string
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          hours_requested?: number | null
          id?: string
          notes?: string | null
          pto_type?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: string | null
          request_count: number
          user_id: string | null
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: string | null
          request_count?: number
          user_id?: string | null
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string | null
          request_count?: number
          user_id?: string | null
          window_start?: string
        }
        Relationships: []
      }
      relationship_rules: {
        Row: {
          cadence_days: number
          created_at: string | null
          id: string
          next_nudge_date: string | null
          person_id: string
          user_id: string
        }
        Insert: {
          cadence_days: number
          created_at?: string | null
          id?: string
          next_nudge_date?: string | null
          person_id: string
          user_id: string
        }
        Update: {
          cadence_days?: number
          created_at?: string | null
          id?: string
          next_nudge_date?: string | null
          person_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_rules_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      stocks_portfolio: {
        Row: {
          average_buy_price_cents: number
          company_name: string
          created_at: string
          currency: string
          current_price_cents: number | null
          dividend_yield: number | null
          id: string
          market: string | null
          notes: string | null
          quantity: number
          sector: string | null
          symbol: string
          total_invested_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_buy_price_cents?: number
          company_name: string
          created_at?: string
          currency?: string
          current_price_cents?: number | null
          dividend_yield?: number | null
          id?: string
          market?: string | null
          notes?: string | null
          quantity?: number
          sector?: string | null
          symbol: string
          total_invested_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_buy_price_cents?: number
          company_name?: string
          created_at?: string
          currency?: string
          current_price_cents?: number | null
          dividend_yield?: number | null
          id?: string
          market?: string | null
          notes?: string | null
          quantity?: number
          sector?: string | null
          symbol?: string
          total_invested_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          activated_at: string | null
          category_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_schedules: {
        Row: {
          accommodation: string | null
          actual_cost_cents: number | null
          budget_cents: number | null
          collaborators: string[] | null
          content_planned: string[] | null
          created_at: string
          currency: string | null
          destination: string
          end_date: string
          id: string
          notes: string | null
          purpose: string | null
          start_date: string
          title: string
          transportation: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accommodation?: string | null
          actual_cost_cents?: number | null
          budget_cents?: number | null
          collaborators?: string[] | null
          content_planned?: string[] | null
          created_at?: string
          currency?: string | null
          destination: string
          end_date: string
          id?: string
          notes?: string | null
          purpose?: string | null
          start_date: string
          title: string
          transportation?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accommodation?: string | null
          actual_cost_cents?: number | null
          budget_cents?: number | null
          collaborators?: string[] | null
          content_planned?: string[] | null
          created_at?: string
          currency?: string | null
          destination?: string
          end_date?: string
          id?: string
          notes?: string | null
          purpose?: string | null
          start_date?: string
          title?: string
          transportation?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_google_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string | null
          scope: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token?: string | null
          scope: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string | null
          scope?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_schedules: {
        Row: {
          created_at: string
          daily_rate_cents: number | null
          end_time: string
          hourly_rate_cents: number | null
          id: string
          is_recurring: boolean
          recurrence_pattern: string | null
          salary_weekly_cents: number | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
          work_type: string | null
        }
        Insert: {
          created_at?: string
          daily_rate_cents?: number | null
          end_time: string
          hourly_rate_cents?: number | null
          id?: string
          is_recurring?: boolean
          recurrence_pattern?: string | null
          salary_weekly_cents?: number | null
          start_time: string
          title?: string
          updated_at?: string
          user_id: string
          work_type?: string | null
        }
        Update: {
          created_at?: string
          daily_rate_cents?: number | null
          end_time?: string
          hourly_rate_cents?: number | null
          id?: string
          is_recurring?: boolean
          recurrence_pattern?: string | null
          salary_weekly_cents?: number | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
          work_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_limit?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_security_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      log_audit: {
        Args: {
          p_ip_address?: string
          p_new_data?: Json
          p_old_data?: Json
          p_operation: string
          p_table_name: string
          p_user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
