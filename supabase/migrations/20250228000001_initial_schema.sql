-- =============================================
-- FateWeaver 초기 DB 스키마 (v2 — 수정판)
-- 비유: "건물 설계도" — 모든 데이터 테이블의 구조 정의
--
-- 변경사항 (v1 대비):
--   1. user_profiles.birth_date → nullable (가입 시 없을 수 있음)
--   2. user_profiles에 구독 컬럼 추가 (결제 웹훅용)
--   3. handle_new_user 트리거 추가 (가입 시 자동 프로필 생성)
--   4. FK 참조: user_profiles(id) → auth.users(id) (프로필 없어도 저장 가능)
--   5. daily_fortunes: birth_date/zodiac_sign 컬럼 추가, UNIQUE 변경
--   6. daily_fortunes RLS: 캐시 테이블이므로 공개 접근 허용
-- =============================================

-- 기존 오브젝트 정리 (데이터 없는 초기 설정 전제)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS daily_fortunes;
DROP TABLE IF EXISTS saju_readings;
DROP TABLE IF EXISTS tarot_readings;
DROP TABLE IF EXISTS user_profiles;

-- =============================================
-- 1. 유저 프로필 (사주/별자리 + 구독 상태)
-- 비유: "회원증" — 기본 신상 + 프리미엄 멤버십 정보
-- =============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE,                    -- 가입 시 없을 수 있으므로 nullable
  birth_time TIME,                    -- 시간 모르면 NULL
  birth_timezone TEXT DEFAULT 'UTC',  -- 태어난 곳 시간대
  gender TEXT,                        -- 사주 해석에 영향
  zodiac_sign TEXT,                   -- 자동 계산된 별자리
  saju_data JSONB,                    -- 사주팔자 계산 결과 캐싱
  locale TEXT DEFAULT 'en',
  is_premium BOOLEAN DEFAULT FALSE,
  -- 구독 관련 (Lemon Squeezy 웹훅으로 갱신)
  subscription_status TEXT,           -- 'active' | 'cancelled' | 'past_due' | 'expired'
  subscription_id TEXT,               -- Lemon Squeezy 구독 ID
  subscription_plan TEXT,             -- 'premium_monthly' | 'premium_yearly' | 'deep_reading'
  subscription_expires_at TIMESTAMPTZ, -- 구독 만료일
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 자동 프로필 생성 트리거
-- 비유: "회원증 자동 발급" — 가입 즉시 빈 프로필 행 생성
--       이 행이 있어야 다른 테이블(타로 기록 등)의 FK가 작동
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. 타로 리딩 기록
-- 비유: "타로 일기장" — 과거 리딩을 다시 볼 수 있는 기록
-- =============================================
CREATE TABLE tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  spread_type TEXT NOT NULL DEFAULT 'daily_3card',  -- 'daily_3card', 'love', 'career'
  question TEXT,                      -- 유저가 물어본 질문
  cards JSONB NOT NULL,               -- [{position, card_id, is_reversed, card: {...}}]
  interpretation TEXT NOT NULL,       -- AI가 생성한 해석
  reading_type TEXT DEFAULT 'free',   -- 'free' | 'premium'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. 사주 분석 기록
-- =============================================
CREATE TABLE saju_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_type TEXT NOT NULL,         -- 'basic', 'yearly', 'deep', 'compatibility'
  target_year INTEGER,                -- 연도별 분석일 경우
  partner_birth_date DATE,            -- 궁합일 경우
  partner_birth_time TIME,
  analysis TEXT NOT NULL,             -- AI가 생성한 분석
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. 일일 운세 (캐싱 + 히스토리)
-- 비유: "운세 우편함" — birth_date + fortune_date로 캐시
--       같은 생일의 요청은 캐시 히트하여 API 비용 절감
--
-- 핵심 변경:
--   - birth_date 컬럼 추가 (캐시 키)
--   - zodiac_sign 컬럼 추가
--   - user_id nullable (비로그인 사용자도 캐시 가능)
--   - UNIQUE(birth_date, fortune_date) — 생일+날짜 기반 캐시
-- =============================================
CREATE TABLE daily_fortunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable: 비로그인 캐시
  birth_date DATE NOT NULL,           -- 캐시 키 (생년월일)
  fortune_date DATE NOT NULL,         -- 운세 날짜
  content TEXT NOT NULL,              -- 운세 텍스트
  lucky_color TEXT,
  lucky_number INTEGER,
  mood_score INTEGER,                 -- 1-10
  zodiac_sign TEXT,                   -- 별자리
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(birth_date, fortune_date)    -- 같은 생일 + 같은 날짜 = 하나만
);

-- =============================================
-- RLS 정책
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

-- daily_fortunes: 캐시 테이블 — 공개 접근 허용
-- 비유: "공개 게시판" — 운세 내용은 개인정보가 아니므로
--       비로그인 사용자도 캐시 읽기/쓰기 가능 (서버 API Route에서만 호출)
CREATE POLICY "Public cache read"
  ON daily_fortunes FOR SELECT
  USING (true);

CREATE POLICY "Server can insert cache"
  ON daily_fortunes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Server can update cache"
  ON daily_fortunes FOR UPDATE
  USING (true);
