/* ─────────────────────────────────────────
 * 체크아웃 URL 생성 API
 * 비유: "주문서 발급 창구" — 유저의 결제 요청을 받아
 *       Lemon Squeezy 체크아웃 URL을 생성해 반환한다
 *
 * POST /api/payments/checkout
 * Body: { planId: 'premium_monthly' | 'premium_yearly' | 'deep_reading', locale: 'en' | 'ko' }
 *
 * 로그인 유저만 사용 가능 — 비로그인 시 401
 * ───────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server'
import { getPaymentProvider } from '@/lib/payment'
import type { PlanId } from '@/lib/payment/types'

const VALID_PLANS: PlanId[] = ['deep_reading', 'premium_monthly', 'premium_yearly']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, locale = 'en' } = body as { planId?: string; locale?: string }

    // 플랜 ID 유효성 검사
    if (!planId || !VALID_PLANS.includes(planId as PlanId)) {
      return NextResponse.json(
        { error: 'Invalid planId. Must be: deep_reading, premium_monthly, or premium_yearly' },
        { status: 400 }
      )
    }

    // 로그인 확인
    let userId: string | null = null

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Login required to purchase' },
        { status: 401 }
      )
    }

    // 체크아웃 URL 생성
    const provider = getPaymentProvider()
    const checkoutUrl = await provider.createCheckout(planId, userId, locale)

    return NextResponse.json({ checkoutUrl })
  } catch (error) {
    console.error('체크아웃 생성 에러:', error)
    const message = error instanceof Error ? error.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
