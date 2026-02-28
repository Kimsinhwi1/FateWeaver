-- =============================================
-- 피드백 테이블 — 사용자 의견/버그신고/기능제안
-- 비유: "건의함" — 누구나 의견을 넣을 수 있고, 본인 것만 볼 수 있다
--
-- user_id nullable: 비로그인 사용자도 피드백 가능
-- RLS: INSERT는 누구나 가능, SELECT는 본인만
-- =============================================

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('bug', 'feature', 'general', 'other')),
  email TEXT,
  message TEXT NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 2000),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 누구나 피드백 작성 가능 (비로그인 포함 — API Route에서만 호출되므로 안전)
CREATE POLICY "Anyone can insert feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

-- 본인 피드백만 조회 가능
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

-- 인덱스: 날짜순 조회 최적화
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- 인덱스: 카테고리별 필터링
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
