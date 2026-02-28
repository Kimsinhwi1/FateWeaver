-- =============================================
-- FateWeaver 통합 시드 SQL
-- Supabase 대시보드 SQL 에디터에서 한번에 실행할 수 있는 통합 파일
--
-- Phase 1 MVP: Auth 없이도 타로 리딩 가능
--   - user_id는 nullable → 비로그인 상태에서도 리딩 저장 가능
--   - 익명 사용자를 위한 RLS 정책 추가
-- =============================================

-- ─────────────────────────────────────────
-- 1. 테이블 생성
-- ─────────────────────────────────────────

-- 유저 프로필 (Phase 2에서 Auth 연동 시 사용)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  birth_time TIME,                    -- 시간 모르면 NULL
  birth_timezone TEXT DEFAULT 'UTC',  -- 태어난 곳 시간대
  gender TEXT,                        -- 사주 해석에 영향
  zodiac_sign TEXT,                   -- 자동 계산된 별자리
  saju_data JSONB,                    -- 사주팔자 계산 결과 캐싱
  locale TEXT DEFAULT 'en',
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 타로 리딩 기록
-- Phase 1: user_id를 nullable로 설정하여 비로그인 리딩 허용
CREATE TABLE IF NOT EXISTS tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,  -- Phase 1에서는 NULL 가능
  spread_type TEXT NOT NULL,          -- 'daily_3card', 'love', 'career', 'celtic_cross'
  question TEXT,                      -- 유저가 물어본 질문
  cards JSONB NOT NULL,               -- [{position, card_id, is_reversed}]
  saju_data JSONB,                    -- 사주 계산 결과 (Phase 1 추가)
  interpretation TEXT NOT NULL,       -- AI가 생성한 해석
  reading_type TEXT DEFAULT 'free',   -- 'free' | 'premium'
  locale TEXT DEFAULT 'en',           -- 리딩 언어
  birth_date DATE,                    -- 비로그인 시 생년월일 저장
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사주 분석 기록 (Phase 2+)
CREATE TABLE IF NOT EXISTS saju_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  reading_type TEXT NOT NULL,         -- 'basic', 'yearly', 'deep', 'compatibility'
  target_year INTEGER,                -- 연도별 분석일 경우
  partner_birth_date DATE,            -- 궁합일 경우
  partner_birth_time TIME,
  analysis TEXT NOT NULL,             -- AI가 생성한 분석
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 일일 운세 (Phase 2+)
CREATE TABLE IF NOT EXISTS daily_fortunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  fortune_date DATE NOT NULL,
  content TEXT NOT NULL,
  lucky_color TEXT,
  lucky_number INTEGER,
  mood_score INTEGER,                 -- 1-10
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, fortune_date)       -- 하루에 하나만
);

-- ─────────────────────────────────────────
-- 2. RLS (Row Level Security) 활성화
-- ─────────────────────────────────────────

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saju_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_fortunes ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- 3. RLS 정책 — 인증된 사용자용
-- ─────────────────────────────────────────

-- user_profiles: 본인 데이터만 조회/수정
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- tarot_readings: 인증된 사용자 — 본인 리딩 접근
CREATE POLICY "Users can view own tarot readings"
  ON tarot_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tarot readings"
  ON tarot_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- saju_readings: 본인 분석만 접근
CREATE POLICY "Users can view own saju readings"
  ON saju_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saju readings"
  ON saju_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- daily_fortunes: 본인 운세만 접근
CREATE POLICY "Users can view own daily fortunes"
  ON daily_fortunes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily fortunes"
  ON daily_fortunes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 4. Phase 1 MVP — 익명 사용자 정책
--    비로그인 상태에서도 타로 리딩이 가능하도록
-- ─────────────────────────────────────────

-- 익명 사용자도 타로 리딩 생성 가능 (user_id = NULL)
CREATE POLICY "Anonymous can insert tarot readings"
  ON tarot_readings FOR INSERT
  WITH CHECK (user_id IS NULL);

-- 익명 사용자도 본인이 생성한 리딩을 ID로 조회 가능
CREATE POLICY "Anyone can view tarot reading by id"
  ON tarot_readings FOR SELECT
  USING (user_id IS NULL);

-- ─────────────────────────────────────────
-- 5. 인덱스 — 성능 최적화
-- ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_tarot_readings_user_id ON tarot_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_tarot_readings_created_at ON tarot_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_fortunes_user_date ON daily_fortunes(user_id, fortune_date);
