/* ─────────────────────────────────────────
 * Supabase 관리자 클라이언트 (서비스 역할용)
 * 비유: "마스터키" — RLS를 우회하여 직접 DB를 조작할 수 있는 관리자 전용 키
 *
 * 사용 장소:
 *   - 웹훅 핸들러 (유저 세션 없이 DB 업데이트 필요)
 *   - 서버 내부 작업 (크론, 배치 등)
 *
 * ⚠️ 주의: 이 클라이언트는 RLS를 완전히 우회하므로
 *          클라이언트 사이드에서 절대 사용하지 말 것
 * ───────────────────────────────────────── */

import { createClient } from '@supabase/supabase-js'

/** 서비스 역할 Supabase 클라이언트 생성 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase 관리자 환경변수(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      // 서비스 역할은 세션/쿠키 관리 불필요
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
