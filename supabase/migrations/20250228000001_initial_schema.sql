-- =============================================
-- FateWeaver 초기 DB 스키마
-- SPEC.md 3-3절의 테이블 정의
-- =============================================

-- 유저 프로필 (사주/별자리 기본 정보)
CREATE TABLE user_profiles (
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
CREATE TABLE tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  spread_type TEXT NOT NULL,          -- 'daily_3card', 'love', 'career', 'celtic_cross'
  question TEXT,                      -- 유저가 물어본 질문
  cards JSONB NOT NULL,               -- [{position, card_id, is_reversed}]
  interpretation TEXT NOT NULL,       -- AI가 생성한 해석
  reading_type TEXT DEFAULT 'free',   -- 'free' | 'premium'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사주 분석 기록
CREATE TABLE saju_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  reading_type TEXT NOT NULL,         -- 'basic', 'yearly', 'deep', 'compatibility'
  target_year INTEGER,                -- 연도별 분석일 경우
  partner_birth_date DATE,            -- 궁합일 경우
  partner_birth_time TIME,
  analysis TEXT NOT NULL,             -- AI가 생성한 분석
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 일일 운세 (캐싱용 - 같은 날 같은 유저 재요청 시 재사용)
CREATE TABLE daily_fortunes (
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

-- =============================================
-- RLS 정책: 모든 테이블에 "자기 데이터만 접근"
-- =============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saju_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_fortunes ENABLE ROW LEVEL SECURITY;

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

-- tarot_readings: 본인 리딩만 접근
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
