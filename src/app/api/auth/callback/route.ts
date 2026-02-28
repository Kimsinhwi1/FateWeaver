/* ─────────────────────────────────────────
 * OAuth 콜백 라우트
 * 비유: "공항 입국 게이트" — Google 로그인 후 돌아온 유저를 맞이하고
 *       세션 쿠키를 발급한 뒤 원래 있던 페이지로 안내한다
 *
 * Google 로그인 → Google → 이 콜백 → 세션 설정 → 리다이렉트
 * ───────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const locale = searchParams.get('locale') ?? 'en'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('OAuth 코드 교환 에러:', error.message)
      return NextResponse.redirect(`${origin}/${locale}?auth_error=true`)
    }
  }

  // 로그인 성공 → 원래 locale 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/${locale}`)
}
