-- ============================================================
-- ForgeItUp Initial Schema Migration
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  display_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'team')),
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  stripe_customer_id TEXT UNIQUE,
  generations_this_month INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Generations table
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  platform TEXT NOT NULL CHECK (platform IN ('java', 'bedrock')),
  type TEXT NOT NULL CHECK (type IN ('mod', 'datapack', 'addon')),
  loader TEXT NOT NULL,
  mc_version TEXT NOT NULL,
  loader_version TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('ai', 'manual')),
  prompt TEXT,
  config_json JSONB,
  output_files JSONB,
  storage_path TEXT,
  ai_model_used TEXT,
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Generation features table
CREATE TABLE IF NOT EXISTS generation_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  feature_config JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_features ENABLE ROW LEVEL SECURITY;

-- Users: only see own profile
CREATE POLICY "users_own_data" ON users
  USING (auth.uid()::text = id::text);

-- Generations: only see own generations
CREATE POLICY "generations_own_data" ON generations
  USING (auth.uid()::text = user_id::text);

-- Subscriptions: only see own subscriptions
CREATE POLICY "subscriptions_own_data" ON subscriptions
  USING (auth.uid()::text = user_id::text);

-- Generation features: only see own features
CREATE POLICY "generation_features_own_data" ON generation_features
  USING (
    EXISTS (
      SELECT 1 FROM generations g
      WHERE g.id = generation_id
      AND auth.uid()::text = g.user_id::text
    )
  );

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Monthly generation counter reset function
-- ============================================================

CREATE OR REPLACE FUNCTION reset_monthly_generations()
RETURNS void AS $$
BEGIN
  UPDATE users SET generations_this_month = 0;
END;
$$ LANGUAGE plpgsql;
