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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          receipt_url?: string | null
          recurring_frequency?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          {
            foreignKeyName: "business_revenue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_revenue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_categories: {
        Row: {
          category: string
          connection_user_id: string
          created_at: string
          id: string
          space_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          connection_user_id: string
          created_at?: string
          id?: string
          space_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          connection_user_id?: string
          created_at?: string
          id?: string
          space_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_categories_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_categories_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "content_catalog_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_catalog_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "content_expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "content_income_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_income_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          platform_name?: string
          total_comments?: number | null
          total_likes?: number | null
          total_posts?: number | null
          total_shares?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_platforms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_platforms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          revenue_cents?: number | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          quantity?: number
          symbol?: string
          total_invested_cents?: number
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crypto_portfolio_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crypto_portfolio_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_watchlist: {
        Row: {
          created_at: string
          currency: string
          current_price_cents: number | null
          id: string
          market_cap_cents: number | null
          name: string
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          price_change_24h?: number | null
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_watchlist_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crypto_watchlist_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          person_id?: string | null
          probability?: number | null
          stage?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          recurring_frequency?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      file_metadata: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          organization_id: string
          shared_with_users: string[] | null
          tags: string[] | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          organization_id: string
          shared_with_users?: string[] | null
          tags?: string[] | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          organization_id?: string
          shared_with_users?: string[] | null
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_goals: {
        Row: {
          created_at: string
          current_value: number | null
          description: string | null
          goal_type: string
          id: string
          is_active: boolean
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          target_date?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fitness_goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fitness_goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          reps?: number | null
          sets?: number | null
          updated_at?: string
          user_id?: string
          weight_lbs?: number | null
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "fitness_workouts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fitness_workouts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      health_metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          metric_type: string
          notes: string | null
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          updated_at?: string
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          recurring_frequency?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          channel: string | null
          created_at: string | null
          follow_up_date: string | null
          id: string
          module: string
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          person_id?: string | null
          sentiment?: string | null
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          quantity?: number
          sku?: string | null
          supplier?: string | null
          unit_price_cents?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "livestream_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestream_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
          taken_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage_taken?: string | null
          id?: string
          medication_id: string
          notes?: string | null
          organization_id?: string | null
          taken_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage_taken?: string | null
          id?: string
          medication_id?: string
          notes?: string | null
          organization_id?: string | null
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
          {
            foreignKeyName: "medication_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_inbox: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message_id: string
          read_at: string | null
          recipient_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_id: string
          read_at?: string | null
          recipient_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_id?: string
          read_at?: string | null
          recipient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_inbox_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "user_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      module_permissions: {
        Row: {
          can_admin: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string
          id: string
          is_enabled: boolean
          is_shared: boolean | null
          module_name: string
          organization_id: string
          settings: Json | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          can_admin?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          is_shared?: boolean | null
          module_name: string
          organization_id: string
          settings?: Json | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          can_admin?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          is_shared?: boolean | null
          module_name?: string
          organization_id?: string
          settings?: Json | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          published_date?: string
          sentiment?: string | null
          source?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_feed_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_feed_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          module: string
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          person_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          id: string
          invitation_accepted_at: string | null
          invited_at: string | null
          is_active: boolean
          joined_at: string
          organization_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitation_accepted_at?: string | null
          invited_at?: string | null
          is_active?: boolean
          joined_at?: string
          organization_id: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invitation_accepted_at?: string | null
          invited_at?: string | null
          is_active?: boolean
          joined_at?: string
          organization_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          discoverable: boolean
          id: string
          join_approval_required: boolean
          logo_url: string | null
          name: string
          settings: Json | null
          type: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discoverable?: boolean
          id?: string
          join_approval_required?: boolean
          logo_url?: string | null
          name: string
          settings?: Json | null
          type?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discoverable?: boolean
          id?: string
          join_approval_required?: boolean
          logo_url?: string | null
          name?: string
          settings?: Json | null
          type?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: []
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          pay_date?: string
          pay_frequency?: string
          pay_period_end?: string
          pay_period_start?: string
          pay_rate_cents?: number
          taxes_cents?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          phone?: string | null
          position?: string | null
          social_media_links?: Json | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          mentioned_users: string[] | null
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentioned_users?: string[] | null
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentioned_users?: string[] | null
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "space_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "space_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          organization_id: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pto_requests: {
        Row: {
          created_at: string
          end_date: string
          hours_requested: number | null
          id: string
          notes: string | null
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          pto_type?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pto_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pto_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
          person_id: string
          user_id: string
        }
        Insert: {
          cadence_days: number
          created_at?: string | null
          id?: string
          next_nudge_date?: string | null
          organization_id?: string | null
          person_id: string
          user_id: string
        }
        Update: {
          cadence_days?: number
          created_at?: string | null
          id?: string
          next_nudge_date?: string | null
          organization_id?: string | null
          person_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_rules_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      space_join_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          space_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          space_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          space_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_join_requests_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_join_requests_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      space_posts: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          mentioned_users: string[] | null
          organization_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          mentioned_users?: string[] | null
          organization_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          mentioned_users?: string[] | null
          organization_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          quantity?: number
          sector?: string | null
          symbol?: string
          total_invested_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stocks_portfolio_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stocks_portfolio_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      task_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          purpose?: string | null
          start_date?: string
          title?: string
          transportation?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_contexts: {
        Row: {
          created_at: string
          group_id: string
          id: string
          is_active: boolean
          last_accessed: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          is_active?: boolean
          last_accessed?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          is_active?: boolean
          last_accessed?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_contexts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_contexts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      user_messages: {
        Row: {
          attached_files: string[] | null
          content: string
          created_at: string | null
          id: string
          is_all_mention: boolean | null
          organization_id: string | null
          recipients: string[]
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          attached_files?: string[] | null
          content: string
          created_at?: string | null
          id?: string
          is_all_mention?: boolean | null
          organization_id?: string | null
          recipients?: string[]
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          attached_files?: string[] | null
          content?: string
          created_at?: string | null
          id?: string
          is_all_mention?: boolean | null
          organization_id?: string | null
          recipients?: string[]
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      work_schedules: {
        Row: {
          created_at: string
          daily_rate_cents: number | null
          end_time: string
          hourly_rate_cents: number | null
          id: string
          is_recurring: boolean
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          recurrence_pattern?: string | null
          salary_weekly_cents?: number | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      group_memberships: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string | null
          is_active: boolean | null
          joined_at: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          logo_url: string | null
          name: string | null
          settings: Json | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          settings?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          settings?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      module_settings: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string | null
          is_enabled: boolean | null
          is_shared: boolean | null
          module_name: string | null
          settings: Json | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string | null
          is_enabled?: boolean | null
          is_shared?: boolean | null
          module_name?: string | null
          settings?: Json | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string | null
          is_enabled?: boolean | null
          is_shared?: boolean | null
          module_name?: string | null
          settings?: Json | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_permissions_organization_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_permissions_organization_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_organization_invitation: {
        Args: { invitation_id: string }
        Returns: boolean
      }
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
      get_organization_members: {
        Args: { org_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          user_id: string
        }[]
      }
      get_user_active_context: {
        Args: { user_uuid?: string }
        Returns: string
      }
      get_user_connections_by_category: {
        Args: { user_uuid?: string }
        Returns: {
          category: string
          count: number
        }[]
      }
      get_user_connections_count: {
        Args: { user_uuid?: string }
        Returns: number
      }
      get_user_contexts: {
        Args: { user_uuid?: string }
        Returns: {
          group_id: string
          group_name: string
          group_type: string
          role: string
        }[]
      }
      get_user_organization_id: {
        Args: { user_uuid?: string }
        Returns: string
      }
      get_user_organization_role: {
        Args: { user_uuid?: string }
        Returns: string
      }
      get_user_pending_invitations: {
        Args: { user_uuid?: string }
        Returns: {
          created_at: string
          expires_at: string
          id: string
          invited_by_name: string
          organization_id: string
          organization_name: string
          organization_type: string
          role: string
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      log_audit: {
        Args:
          | {
              p_ip_address?: string
              p_new_data?: Json
              p_old_data?: Json
              p_operation: string
              p_table_name: string
              p_user_agent?: string
            }
          | {
              p_ip_address?: string
              p_new_data?: Json
              p_old_data?: Json
              p_operation: string
              p_table_name: string
              p_user_agent?: string
              p_user_id?: string
            }
        Returns: string
      }
      process_join_request: {
        Args: { approve: boolean; request_id: string }
        Returns: boolean
      }
      switch_user_context: {
        Args: { new_context_id: string; user_uuid?: string }
        Returns: boolean
      }
      user_can_access_organization: {
        Args: { org_id: string; user_uuid?: string }
        Returns: boolean
      }
      user_has_context_module_access: {
        Args:
          | {
              context_id?: string
              module_name: string
              permission_type?: string
              user_uuid?: string
            }
          | { context_id?: string; module_name: string; user_uuid?: string }
        Returns: boolean
      }
      user_has_module_access: {
        Args: { module_name: string; user_uuid?: string }
        Returns: boolean
      }
      user_is_org_admin: {
        Args: { org_id: string; user_uuid?: string }
        Returns: boolean
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
