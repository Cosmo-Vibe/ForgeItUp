-- ============================================================
-- Migration 002: Security hardening & API keys
-- ============================================================

-- Add brute-force lockout fields to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_locked_until TIMESTAMPTZ;

-- ============================================================
-- API Keys table
-- ============================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,       -- SHA-256 hex of the raw key (never store raw)
  key_prefix TEXT NOT NULL,            -- first 12 chars of raw key for display e.g. "fig_a1b2c3d4"
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  requests_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(user_id, is_active);

-- RLS for api_keys: users only see their own keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys_own_data" ON api_keys
  USING (auth.uid()::text = user_id::text);

-- ============================================================
-- RPC: atomically increment api_key request counter
-- Called server-side (service role bypasses RLS)
-- ============================================================

CREATE OR REPLACE FUNCTION increment_api_key_requests(p_key_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE api_keys
  SET requests_count = requests_count + 1,
      last_used_at = NOW()
  WHERE id = p_key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
