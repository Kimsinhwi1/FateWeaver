/* ─────────────────────────────────────────
 * Supabase 클라이언트 (브라우저용)
 * 비유: 프론트엔드에서 DB와 대화하기 위한 "전화기"
 * 브라우저에서만 사용 — 서버에서는 server.ts 사용
 * ───────────────────────────────────────── */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
