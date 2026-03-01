-- ─────────────────────────────────────────
-- usage_tracking 테이블 — 서버사이드 일일 사용량 추적
-- 비유: "출석부" — 누가 어떤 기능을 오늘 몇 번 썼는지 기록
--
-- identifier: 로그인 유저는 user_id, 비로그인은 IP
-- feature: tarot, daily, compatibility, decade, monthly, yearly
-- usage_date: 날짜별 카운트 (매일 리셋)
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usage_tracking (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  identifier TEXT NOT NULL,            -- user_id 또는 IP 주소
  feature TEXT NOT NULL,               -- 기능 키 (tarot, daily, ...)
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 복합 유니크 인덱스: 같은 식별자 + 기능 + 날짜 조합은 하나만 존재
-- 원자적 upsert(INSERT ... ON CONFLICT)의 기반이 된다
CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_tracking_unique
  ON usage_tracking (identifier, feature, usage_date);

-- 날짜 기반 조회/정리 최적화 (일반 인덱스)
-- 오래된 데이터 정리는 별도 크론으로 수행:
--   DELETE FROM usage_tracking WHERE usage_date < CURRENT_DATE - INTERVAL '7 days';
-- 주의: partial index에 CURRENT_DATE 같은 volatile 함수를 쓰면
--       PostgreSQL에서 생성 실패하므로 일반 인덱스를 사용한다
CREATE INDEX IF NOT EXISTS idx_usage_tracking_date
  ON usage_tracking (usage_date);

-- RLS 활성화 — 서비스 역할 키로만 접근 가능 (일반 유저 접근 차단)
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- 서비스 역할만 CRUD 가능 (admin client 전용)
-- anon/authenticated 유저는 직접 이 테이블에 접근 불가
CREATE POLICY "Service role only" ON usage_tracking
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ─────────────────────────────────────────
-- increment_usage RPC — 원자적 사용량 증가 함수
-- 비유: "셀프 계산대" — 한 번의 동작으로 카운트를 확인하고 증가시킨다
--
-- 왜 RPC인가?
--   select → check → insert/update 2단계는 동시 요청 시 레이스 컨디션 발생.
--   INSERT ... ON CONFLICT DO UPDATE SET count = count + 1 은
--   PostgreSQL 행 잠금(row lock)으로 원자적 처리를 보장한다.
--   두 요청이 동시에 들어와도 정확히 +1, +1 = +2 가 된다.
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_usage(
  p_identifier TEXT,
  p_feature TEXT,
  p_usage_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE sql
AS $$
  INSERT INTO usage_tracking (identifier, feature, usage_date, count)
  VALUES (p_identifier, p_feature, p_usage_date, 1)
  ON CONFLICT (identifier, feature, usage_date)
  DO UPDATE SET
    count = usage_tracking.count + 1,
    updated_at = NOW()
  RETURNING count;
$$;
