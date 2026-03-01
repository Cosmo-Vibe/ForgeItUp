import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          subscription_tier: 'free' | 'starter' | 'pro' | 'team';
          subscription_status: 'active' | 'inactive' | 'cancelled';
          stripe_customer_id: string | null;
          generations_this_month: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'processing' | 'done' | 'failed';
          platform: 'java' | 'bedrock';
          type: 'mod' | 'datapack' | 'addon';
          loader: string;
          mc_version: string;
          loader_version: string;
          mode: 'ai' | 'manual';
          prompt: string | null;
          config_json: Record<string, unknown> | null;
          output_files: Record<string, unknown> | null;
          storage_path: string | null;
          ai_model_used: string | null;
          tokens_used: number | null;
          generation_time_ms: number | null;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['generations']['Row'],
          'created_at' | 'completed_at'
        >;
        Update: Partial<Database['public']['Tables']['generations']['Insert']>;
      };
    };
  };
};
