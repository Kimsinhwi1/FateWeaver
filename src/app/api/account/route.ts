/* ─────────────────────────────────────────
 * 계정 삭제 API — DELETE /api/account
 * 비유: "회원탈퇴 창구" — 유저의 모든 데이터를 정리하고 계정을 삭제
 *
 * 삭제 순서:
 *   1. 현재 로그인 유저 확인
 *   2. Lemon Squeezy 구독 활성 상태면 → 취소 시도
 *   3. Supabase 테이블 데이터 삭제 (saju_readings, tarot_readings, daily_fortunes, user_profiles)
 *   4. Supabase Auth에서 유저 삭제 (admin.auth.deleteUser)
 *   5. 세션 로그아웃
 *
 * ⚠️ 비가역적 작업 — 삭제된 데이터는 복구 불가
 * ───────────────────────────────────────── */

import { NextResponse } from 'next/server'

export async function DELETE() {
  try {
    /* Supabase 미설정 → 목업 모드: 성공 응답만 반환 */
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ success: true, mock: true })
    }

    /* 1. 현재 로그인 유저 확인 */
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    /* 2. Lemon Squeezy 구독 취소 시도 */
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('subscription_id, subscription_status')
        .eq('id', userId)
        .single()

      if (profile?.subscription_id && profile?.subscription_status === 'active') {
        /* Lemon Squeezy API로 구독 취소 */
        const lsApiKey = process.env.LEMON_SQUEEZY_API_KEY
        if (lsApiKey) {
          await fetch(
            `https://api.lemonsqueezy.com/v1/subscriptions/${profile.subscription_id}`,
            {
              method: 'DELETE',
              headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${lsApiKey}`,
              },
            }
          ).catch(() => {
            /* 구독 취소 실패해도 계정 삭제는 계속 진행 */
            console.warn('Lemon Squeezy 구독 취소 실패 — 계정 삭제는 계속 진행')
          })
        }
      }
    } catch {
      /* 프로필 조회 실패해도 삭제 계속 진행 */
    }

    /* 3. Supabase 테이블 데이터 삭제
     *    CASCADE가 설정되어 있지만, 명시적으로 삭제하여 확실히 처리
     *    daily_fortunes는 user_id가 nullable이라 SET NULL로 처리됨 */
    await Promise.all([
      supabase.from('saju_readings').delete().eq('user_id', userId),
      supabase.from('tarot_readings').delete().eq('user_id', userId),
    ])

    /* user_profiles 삭제 (FK CASCADE로 인해 auth.users 삭제 시 자동 처리되지만 명시적으로) */
    await supabase.from('user_profiles').delete().eq('id', userId)

    /* 4. Supabase Auth에서 유저 삭제 — 서비스 역할 키 필요 */
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const adminClient = createAdminClient()

      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
      if (deleteError) {
        console.error('Auth 유저 삭제 에러:', deleteError.message)
        /* Auth 삭제 실패해도 데이터는 이미 삭제됨 — 부분 성공으로 처리 */
      }
    }

    /* 5. 현재 세션 로그아웃 */
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('계정 삭제 API 에러:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
