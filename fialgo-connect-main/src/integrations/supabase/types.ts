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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      active_bots: {
        Row: {
          bot_name: string
          id: string
          risk_level: string | null
          status: string | null
          trading_pair: string
          user_id: string
        }
        Insert: {
          bot_name: string
          id?: string
          risk_level?: string | null
          status?: string | null
          trading_pair: string
          user_id: string
        }
        Update: {
          bot_name?: string
          id?: string
          risk_level?: string | null
          status?: string | null
          trading_pair?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_bots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_pings: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_coach_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_coach_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_coach_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_coach_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_coach_sessions: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          session_type: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          session_type?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          session_type?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_coach_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          period_end: string | null
          period_start: string | null
          plan: string
          status: string | null
          stripe_invoice_id: string | null
          stripe_payment_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          plan: string
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          plan?: string
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_members: {
        Row: {
          channel_id: string | null
          id: string
          is_muted: boolean | null
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_messages: {
        Row: {
          channel_id: string | null
          content: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          channel_type: string | null
          cover_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_official: boolean | null
          member_count: number | null
          message_count: number | null
          name: string
          rules: string | null
          slug: string
          tags: string[] | null
        }
        Insert: {
          channel_type?: string | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_official?: boolean | null
          member_count?: number | null
          message_count?: number | null
          name: string
          rules?: string | null
          slug: string
          tags?: string[] | null
        }
        Update: {
          channel_type?: string | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_official?: boolean | null
          member_count?: number | null
          message_count?: number | null
          name?: string
          rules?: string | null
          slug?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "channels_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_channels: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          is_verified: boolean | null
          member_count: number | null
          name: string
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          is_verified?: boolean | null
          member_count?: number | null
          name: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          is_verified?: boolean | null
          member_count?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_channels_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_entries: {
        Row: {
          competition_id: string | null
          current_pips: number | null
          current_roi: number | null
          current_winrate: number | null
          id: string
          is_disqualified: boolean | null
          joined_at: string | null
          mt5_account_id: string | null
          rank: number | null
          starting_balance: number | null
          trade_count: number | null
          user_id: string | null
        }
        Insert: {
          competition_id?: string | null
          current_pips?: number | null
          current_roi?: number | null
          current_winrate?: number | null
          id?: string
          is_disqualified?: boolean | null
          joined_at?: string | null
          mt5_account_id?: string | null
          rank?: number | null
          starting_balance?: number | null
          trade_count?: number | null
          user_id?: string | null
        }
        Update: {
          competition_id?: string | null
          current_pips?: number | null
          current_roi?: number | null
          current_winrate?: number | null
          id?: string
          is_disqualified?: boolean | null
          joined_at?: string | null
          mt5_account_id?: string | null
          rank?: number | null
          starting_balance?: number | null
          trade_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_entries_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_entries_mt5_account_id_fkey"
            columns: ["mt5_account_id"]
            isOneToOne: false
            referencedRelation: "mt5_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_leaderboard: {
        Row: {
          competition_id: string | null
          id: string
          rank: number
          score: number
          trade_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          competition_id?: string | null
          id?: string
          rank: number
          score: number
          trade_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          competition_id?: string | null
          id?: string
          rank?: number
          score?: number
          trade_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_leaderboard_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          max_contestants: number | null
          prize_pool: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          max_contestants?: number | null
          prize_pool?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          max_contestants?: number | null
          prize_pool?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_missions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          mission_type: string
          recurrence: string | null
          target_count: number | null
          title: string
          xp_reward: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          mission_type: string
          recurrence?: string | null
          target_count?: number | null
          title: string
          xp_reward: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          mission_type?: string
          recurrence?: string | null
          target_count?: number | null
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_deleted_by_receiver: boolean | null
          is_deleted_by_sender: boolean | null
          is_read: boolean | null
          media_url: string | null
          message_type: string | null
          receiver_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_deleted_by_receiver?: boolean | null
          is_deleted_by_sender?: boolean | null
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_deleted_by_receiver?: boolean | null
          is_deleted_by_sender?: boolean | null
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          last_message_id: string | null
          user1_id: string | null
          user1_unread_count: number | null
          user2_id: string | null
          user2_unread_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          user1_id?: string | null
          user1_unread_count?: number | null
          user2_id?: string | null
          user2_unread_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          user1_id?: string | null
          user1_unread_count?: number | null
          user2_id?: string | null
          user2_unread_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dm_conversations_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_conversations_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_conversations_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      economic_calendar: {
        Row: {
          actual: string | null
          created_at: string | null
          currency: string | null
          event_time: string
          event_title: string
          forecast: string | null
          id: string
          impact: string | null
          previous: string | null
          source: string | null
        }
        Insert: {
          actual?: string | null
          created_at?: string | null
          currency?: string | null
          event_time: string
          event_title: string
          forecast?: string | null
          id?: string
          impact?: string | null
          previous?: string | null
          source?: string | null
        }
        Update: {
          actual?: string | null
          created_at?: string | null
          currency?: string | null
          event_time?: string
          event_title?: string
          forecast?: string | null
          id?: string
          impact?: string | null
          previous?: string | null
          source?: string | null
        }
        Relationships: []
      }
      feed_watchlist: {
        Row: {
          created_at: string | null
          id: string
          is_pinned: boolean | null
          sort_order: number | null
          symbol: string
          symbol_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          sort_order?: number | null
          symbol: string
          symbol_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          sort_order?: number | null
          symbol?: string
          symbol_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          mood: string | null
          notes: string | null
          symbol: string | null
          tags: string[] | null
          title: string | null
          trade_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          symbol?: string | null
          tags?: string[] | null
          title?: string | null
          trade_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          symbol?: string | null
          tags?: string[] | null
          title?: string | null
          trade_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mt5_accounts: {
        Row: {
          account_number: string
          activation_key: string | null
          algo_status: boolean | null
          balance: number | null
          broker_name: string | null
          broker_server: string | null
          connection_purpose: string | null
          connection_status: string | null
          created_at: string | null
          currency: string | null
          equity: number | null
          id: string
          is_active: boolean | null
          is_connected: boolean | null
          leverage: number | null
          metaapi_account_id: string | null
          user_id: string
        }
        Insert: {
          account_number: string
          activation_key?: string | null
          algo_status?: boolean | null
          balance?: number | null
          broker_name?: string | null
          broker_server?: string | null
          connection_purpose?: string | null
          connection_status?: string | null
          created_at?: string | null
          currency?: string | null
          equity?: number | null
          id?: string
          is_active?: boolean | null
          is_connected?: boolean | null
          leverage?: number | null
          metaapi_account_id?: string | null
          user_id: string
        }
        Update: {
          account_number?: string
          activation_key?: string | null
          algo_status?: boolean | null
          balance?: number | null
          broker_name?: string | null
          broker_server?: string | null
          connection_purpose?: string | null
          connection_status?: string | null
          created_at?: string | null
          currency?: string | null
          equity?: number | null
          id?: string
          is_active?: boolean | null
          is_connected?: boolean | null
          leverage?: number | null
          metaapi_account_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mt5_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          method: string | null
          notes: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activation_key: string | null
          address: string | null
          avatar_url: string | null
          avg_rr: number | null
          banner_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          cover_url: string | null
          created_at: string | null
          current_xp: number | null
          date_of_birth: string | null
          display_name: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          has_chosen_username: boolean | null
          id: string
          instagram_id: string | null
          is_banned: boolean | null
          is_frozen: boolean | null
          is_locked_for_today: boolean | null
          is_pro: boolean | null
          is_verified: boolean | null
          last_login_at: string | null
          last_login_date: string | null
          last_name: string | null
          location: string | null
          max_daily_trades: number | null
          next_billing_at: string | null
          objective_amount: number | null
          phone: string | null
          plan_type: string | null
          preferred_market: string | null
          progress_percent: number | null
          recovery_email: string | null
          recovery_phone: string | null
          referral_code: string | null
          referred_by: string | null
          risk_appetite: string | null
          roi_all_time: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          show_portfolio: boolean | null
          show_roi: boolean | null
          show_streak: boolean | null
          show_trades: boolean | null
          show_winrate: boolean | null
          state: string | null
          streak_days: number | null
          subscription_status: string | null
          total_trades: number | null
          trades_today: number | null
          trading_style: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          username: string | null
          website: string | null
          win_rate: number | null
          xp_level: number | null
          xp_total: number | null
          zip_code: string | null
        }
        Insert: {
          activation_key?: string | null
          address?: string | null
          avatar_url?: string | null
          avg_rr?: number | null
          banner_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string | null
          current_xp?: number | null
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          has_chosen_username?: boolean | null
          id: string
          instagram_id?: string | null
          is_banned?: boolean | null
          is_frozen?: boolean | null
          is_locked_for_today?: boolean | null
          is_pro?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          last_login_date?: string | null
          last_name?: string | null
          location?: string | null
          max_daily_trades?: number | null
          next_billing_at?: string | null
          objective_amount?: number | null
          phone?: string | null
          plan_type?: string | null
          preferred_market?: string | null
          progress_percent?: number | null
          recovery_email?: string | null
          recovery_phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          risk_appetite?: string | null
          roi_all_time?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          show_portfolio?: boolean | null
          show_roi?: boolean | null
          show_streak?: boolean | null
          show_trades?: boolean | null
          show_winrate?: boolean | null
          state?: string | null
          streak_days?: number | null
          subscription_status?: string | null
          total_trades?: number | null
          trades_today?: number | null
          trading_style?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          win_rate?: number | null
          xp_level?: number | null
          xp_total?: number | null
          zip_code?: string | null
        }
        Update: {
          activation_key?: string | null
          address?: string | null
          avatar_url?: string | null
          avg_rr?: number | null
          banner_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string | null
          current_xp?: number | null
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          has_chosen_username?: boolean | null
          id?: string
          instagram_id?: string | null
          is_banned?: boolean | null
          is_frozen?: boolean | null
          is_locked_for_today?: boolean | null
          is_pro?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          last_login_date?: string | null
          last_name?: string | null
          location?: string | null
          max_daily_trades?: number | null
          next_billing_at?: string | null
          objective_amount?: number | null
          phone?: string | null
          plan_type?: string | null
          preferred_market?: string | null
          progress_percent?: number | null
          recovery_email?: string | null
          recovery_phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          risk_appetite?: string | null
          roi_all_time?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          show_portfolio?: boolean | null
          show_roi?: boolean | null
          show_streak?: boolean | null
          show_trades?: boolean | null
          show_winrate?: boolean | null
          state?: string | null
          streak_days?: number | null
          subscription_status?: string | null
          total_trades?: number | null
          trades_today?: number | null
          trading_style?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          win_rate?: number | null
          xp_level?: number | null
          xp_total?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_id: string | null
          referrer_id: string | null
          reward_tier: string | null
          status: string | null
          xp_rewarded: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_id?: string | null
          referrer_id?: string | null
          reward_tier?: string | null
          status?: string | null
          xp_rewarded?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string | null
          reward_tier?: string | null
          status?: string | null
          xp_rewarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_breach_logs: {
        Row: {
          actual_value: number | null
          breach_type: string
          created_at: string | null
          id: string
          resolved: boolean | null
          rule_value: number | null
          severity: string | null
          trade_id: string | null
          user_id: string
        }
        Insert: {
          actual_value?: number | null
          breach_type: string
          created_at?: string | null
          id?: string
          resolved?: boolean | null
          rule_value?: number | null
          severity?: string | null
          trade_id?: string | null
          user_id: string
        }
        Update: {
          actual_value?: number | null
          breach_type?: string
          created_at?: string | null
          id?: string
          resolved?: boolean | null
          rule_value?: number | null
          severity?: string | null
          trade_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_breach_logs_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_breach_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_follow_requests: {
        Row: {
          created_at: string
          requester_id: string
          target_id: string
          id: string
        }
        Insert: {
          created_at?: string
          requester_id: string
          target_id: string
          id?: string
        }
        Update: {
          created_at?: string
          requester_id?: string
          target_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_follow_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_follow_requests_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_post_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_post_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          like_count: number | null
          parent_comment_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "social_post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          bookmark_count: number | null
          comment_count: number | null
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          is_public: boolean | null
          like_count: number | null
          likes_count: number | null
          linked_trade_id: string | null
          media_type: string | null
          media_url: string | null
          media_urls: string[] | null
          post_type: string | null
          share_count: number | null
          symbol: string | null
          tags: string[] | null
          timeframe: string | null
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          bookmark_count?: number | null
          comment_count?: number | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          likes_count?: number | null
          linked_trade_id?: string | null
          media_type?: string | null
          media_url?: string | null
          media_urls?: string[] | null
          post_type?: string | null
          share_count?: number | null
          symbol?: string | null
          tags?: string[] | null
          timeframe?: string | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          bookmark_count?: number | null
          comment_count?: number | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          likes_count?: number | null
          linked_trade_id?: string | null
          media_type?: string | null
          media_url?: string | null
          media_urls?: string[] | null
          post_type?: string | null
          share_count?: number | null
          symbol?: string | null
          tags?: string[] | null
          timeframe?: string | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_linked_trade_id_fkey"
            columns: ["linked_trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          message: string
          ticket_id: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          ticket_id?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          bot_id: string | null
          close_price: number | null
          closed_at: string | null
          commission: number | null
          discipline_score: number | null
          emotion: string | null
          entry_price: number | null
          entry_reason: string | null
          exit_price: number | null
          exit_reason: string | null
          id: string
          is_pending: boolean | null
          lot_size: number
          max_drawdown: number | null
          notes: string | null
          open_price: number | null
          opened_at: string | null
          pips: number | null
          profit: number
          risk_percent: number | null
          risk_reward_ratio: number | null
          screenshot_url: string | null
          setup: string | null
          source: string | null
          status: string | null
          stop_loss: number | null
          swap: number | null
          symbol: string
          tags: string[] | null
          take_profit: number | null
          ticket: string
          trade_type: string
          user_id: string
        }
        Insert: {
          bot_id?: string | null
          close_price?: number | null
          closed_at?: string | null
          commission?: number | null
          discipline_score?: number | null
          emotion?: string | null
          entry_price?: number | null
          entry_reason?: string | null
          exit_price?: number | null
          exit_reason?: string | null
          id?: string
          is_pending?: boolean | null
          lot_size: number
          max_drawdown?: number | null
          notes?: string | null
          open_price?: number | null
          opened_at?: string | null
          pips?: number | null
          profit: number
          risk_percent?: number | null
          risk_reward_ratio?: number | null
          screenshot_url?: string | null
          setup?: string | null
          source?: string | null
          status?: string | null
          stop_loss?: number | null
          swap?: number | null
          symbol: string
          tags?: string[] | null
          take_profit?: number | null
          ticket: string
          trade_type: string
          user_id: string
        }
        Update: {
          bot_id?: string | null
          close_price?: number | null
          closed_at?: string | null
          commission?: number | null
          discipline_score?: number | null
          emotion?: string | null
          entry_price?: number | null
          entry_reason?: string | null
          exit_price?: number | null
          exit_reason?: string | null
          id?: string
          is_pending?: boolean | null
          lot_size?: number
          max_drawdown?: number | null
          notes?: string | null
          open_price?: number | null
          opened_at?: string | null
          pips?: number | null
          profit?: number
          risk_percent?: number | null
          risk_reward_ratio?: number | null
          screenshot_url?: string | null
          setup?: string | null
          source?: string | null
          status?: string | null
          stop_loss?: number | null
          swap?: number | null
          symbol?: string
          tags?: string[] | null
          take_profit?: number | null
          ticket?: string
          trade_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "active_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          status: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_icon: string | null
          achievement_id: string
          achievement_name: string
          id: string
          unlocked_at: string | null
          user_id: string | null
          xp_rewarded: number | null
        }
        Insert: {
          achievement_icon?: string | null
          achievement_id: string
          achievement_name: string
          id?: string
          unlocked_at?: string | null
          user_id?: string | null
          xp_rewarded?: number | null
        }
        Update: {
          achievement_icon?: string | null
          achievement_id?: string
          achievement_name?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string | null
          xp_rewarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          created_at: string | null
          description: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          performance_rating: number | null
          rating: number | null
          setup_rating: number | null
          trust_rating: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          performance_rating?: number | null
          rating?: number | null
          setup_rating?: number | null
          trust_rating?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          performance_rating?: number | null
          rating?: number | null
          setup_rating?: number | null
          trust_rating?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mission_progress: {
        Row: {
          completed_at: string | null
          date: string | null
          id: string
          is_complete: boolean | null
          mission_id: string | null
          progress_count: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          date?: string | null
          id?: string
          is_complete?: boolean | null
          mission_id?: string | null
          progress_count?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          date?: string | null
          id?: string
          is_complete?: boolean | null
          mission_id?: string | null
          progress_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "daily_missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_mission_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_risk_configs: {
        Row: {
          alert_on_breach: boolean | null
          alert_on_warning: boolean | null
          created_at: string | null
          id: string
          is_prop_firm_mode: boolean | null
          max_correlation_trades: number | null
          max_daily_loss_percent: number | null
          max_lot_size: number | null
          max_open_trades: number | null
          max_overall_drawdown_percent: number | null
          prop_firm_daily_loss: number | null
          prop_firm_max_drawdown: number | null
          prop_firm_name: string | null
          risk_per_trade_percent: number | null
          target_capital: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_on_breach?: boolean | null
          alert_on_warning?: boolean | null
          created_at?: string | null
          id?: string
          is_prop_firm_mode?: boolean | null
          max_correlation_trades?: number | null
          max_daily_loss_percent?: number | null
          max_lot_size?: number | null
          max_open_trades?: number | null
          max_overall_drawdown_percent?: number | null
          prop_firm_daily_loss?: number | null
          prop_firm_max_drawdown?: number | null
          prop_firm_name?: string | null
          risk_per_trade_percent?: number | null
          target_capital?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_on_breach?: boolean | null
          alert_on_warning?: boolean | null
          created_at?: string | null
          id?: string
          is_prop_firm_mode?: boolean | null
          max_correlation_trades?: number | null
          max_daily_loss_percent?: number | null
          max_lot_size?: number | null
          max_open_trades?: number | null
          max_overall_drawdown_percent?: number | null
          prop_firm_daily_loss?: number | null
          prop_firm_max_drawdown?: number | null
          prop_firm_name?: string | null
          risk_per_trade_percent?: number | null
          target_capital?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_risk_configs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp_ledger: {
        Row: {
          created_at: string | null
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
          source_page: string | null
          user_id: string | null
          xp_amount: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          source_page?: string | null
          user_id?: string | null
          xp_amount: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          source_page?: string | null
          user_id?: string | null
          xp_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_xp_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string | null
          feedback: string | null
          id: string
          name: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          feedback?: string | null
          id?: string
          name: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          feedback?: string | null
          id?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      weekly_streak_checkins: {
        Row: {
          checkin_date: string
          created_at: string | null
          id: string
          streak_day: number
          user_id: string | null
          xp_awarded: number | null
        }
        Insert: {
          checkin_date?: string
          created_at?: string | null
          id?: string
          streak_day: number
          user_id?: string | null
          xp_awarded?: number | null
        }
        Update: {
          checkin_date?: string
          created_at?: string | null
          id?: string
          streak_day?: number
          user_id?: string | null
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_streak_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_reward_redemptions: {
        Row: {
          id: string
          redeemed_at: string | null
          reward_id: string
          reward_name: string
          status: string | null
          user_id: string | null
          xp_cost: number
        }
        Insert: {
          id?: string
          redeemed_at?: string | null
          reward_id: string
          reward_name: string
          status?: string | null
          user_id?: string | null
          xp_cost: number
        }
        Update: {
          id?: string
          redeemed_at?: string | null
          reward_id?: string
          reward_name?: string
          status?: string | null
          user_id?: string | null
          xp_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_reward_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      connection_status: "pending" | "deployed" | "failed"
      user_role: "user" | "super_admin" | "support_agent" | "finance_admin"
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
    Enums: {
      connection_status: ["pending", "deployed", "failed"],
      user_role: ["user", "super_admin", "support_agent", "finance_admin"],
    },
  },
} as const
