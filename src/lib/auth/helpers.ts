/* ─────────────────────────────────────────
 * 인증 헬퍼 함수
 * 비유: "출입 카드 리더기" — 로그인/로그아웃/세션 확인을 한곳에서 관리
 *
 * 브라우저에서만 사용 (서버에서는 supabase/server.ts 사용)
 * ───────────────────────────────────────── */

import { createClient } from '@/lib/supabase/client'

/**
 * Google OAuth 로그인 — 팝업 없이 리다이렉트 방식
 * 비유: "Google 문으로 들어가기" — Google 로그인 페이지로 이동 후 돌아옴
 */
export async function signInWithGoogle(locale: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback?locale=${locale}`,
    },
  })

  if (error) {
    console.error('Google 로그인 에러:', error.message)
    throw error
  }
}

/** 로그아웃 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('로그아웃 에러:', error.message)
    throw error
  }
}

/** 현재 세션 가져오기 */
export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/** 현재 유저 가져오기 */
export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
