/* ─────────────────────────────────────────
 * Supabase 클라이언트 (서버용)
 * 비유: 서버 뒷방에서 DB와 대화하기 위한 "내선 전화"
 * API Route나 Server Component에서 사용
 * ───────────────────────────────────────── */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서 호출 시 쿠키 설정 불가 — 무시해도 안전
          }
        },
      },
    }
  )
}
