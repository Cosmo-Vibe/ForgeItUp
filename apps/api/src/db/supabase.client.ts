import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY ?? '';

if (!supabaseUrl || !supabaseServiceKey) {
  logger.warn('Supabase credentials not configured — DB operations will fail');
}

// Service role client — bypasses RLS, only for server-side use
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
