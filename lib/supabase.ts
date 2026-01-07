import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          meta_currency: number;
          best_round: number;
          total_playtime: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nickname: string;
          meta_currency?: number;
          best_round?: number;
          total_playtime?: number;
        };
        Update: {
          nickname?: string;
          meta_currency?: number;
          best_round?: number;
          total_playtime?: number;
        };
      };
      global_items: {
        Row: {
          id: string;
          item_type: string;
          rarity: string;
          unlock_cost: number;
          unlock_condition: Record<string, unknown> | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
      };
      user_unlocks: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          unlocked_at: string;
        };
        Insert: {
          user_id: string;
          item_id: string;
        };
      };
      leaderboard: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          round_reached: number;
          deck_snapshot: Record<string, unknown> | null;
          played_at: string;
        };
        Insert: {
          user_id: string;
          score: number;
          round_reached: number;
          deck_snapshot?: Record<string, unknown>;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          current_debt: number;
          deadline_turn: number;
          paid_amount: number;
          game_state: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          current_debt: number;
          deadline_turn: number;
          paid_amount?: number;
          game_state?: Record<string, unknown>;
        };
        Update: {
          current_debt?: number;
          deadline_turn?: number;
          paid_amount?: number;
          game_state?: Record<string, unknown>;
        };
      };
    };
  };
};
