/* ─────────────────────────────────────────
 * Supabase 클라이언트 (브라우저용)
 * 비유: 프론트엔드에서 DB와 대화하기 위한 "전화기"
 * 브라우저에서만 사용 — 서버에서는 server.ts 사용
 * ───────────────────────────────────────── */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)가 설정되지 않았습니다')
  }

  return createBrowserClient(url, anonKey)
}
