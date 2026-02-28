/* ─────────────────────────────────────────
 * Lemon Squeezy 결제 프로바이더
 * 비유: 실제 "충전기" — Lemon Squeezy API를 통해 결제/구독을 처리한다
 *
 * 필요 환경변수:
 *   - LEMONSQUEEZY_API_KEY         — API 키
 *   - LEMONSQUEEZY_STORE_ID        — 스토어 ID
 *   - LEMONSQUEEZY_WEBHOOK_SECRET  — 웹훅 서명 검증 비밀키
 *   - LEMONSQUEEZY_MONTHLY_VARIANT_ID  — 월간 구독 variant
 *   - LEMONSQUEEZY_YEARLY_VARIANT_ID   — 연간 구독 variant
 *   - LEMONSQUEEZY_ONETIME_VARIANT_ID  — 1회 심층 리딩 variant
 * ───────────────────────────────────────── */

import {
  lemonSqueezySetup,
  createCheckout as lsCreateCheckout,
  cancelSubscription as lsCancelSubscription,
} from '@lemonsqueezy/lemonsqueezy.js'
import type { PaymentProvider, Subscription, PlanId } from './types'
import crypto from 'crypto'

/** SDK 초기화 — 한 번만 실행 */
function initSDK() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) throw new Error('LEMONSQUEEZY_API_KEY 환경변수가 필요합니다.')
  lemonSqueezySetup({ apiKey })
}

/** planId → variant ID 매핑 */
function getVariantId(planId: string): string {
  const map: Record<string, string | undefined> = {
    deep_reading: process.env.LEMONSQUEEZY_ONETIME_VARIANT_ID,
    premium_monthly: process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID,
    premium_yearly: process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID,
  }
  const variantId = map[planId]
  if (!variantId) throw new Error(`알 수 없는 planId이거나 variant ID 미설정: ${planId}`)
  return variantId
}

/** variant ID → planId 역매핑 */
function getPlanIdFromVariant(variantId: string): PlanId {
  if (variantId === process.env.LEMONSQUEEZY_ONETIME_VARIANT_ID) return 'deep_reading'
  if (variantId === process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID) return 'premium_monthly'
  if (variantId === process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID) return 'premium_yearly'
  return 'premium_monthly' // 폴백
}

export class LemonSqueezyProvider implements PaymentProvider {
  /**
   * 체크아웃 URL 생성
   * 비유: "주문서 작성" — 유저를 Lemon Squeezy 결제 페이지로 안내
   */
  async createCheckout(
    planId: string,
    userId: string,
    locale: string
  ): Promise<string> {
    initSDK()

    const storeId = process.env.LEMONSQUEEZY_STORE_ID
    if (!storeId) throw new Error('LEMONSQUEEZY_STORE_ID 환경변수가 필요합니다.')

    const variantId = getVariantId(planId)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fateweaver.vercel.app'

    const { data, error } = await lsCreateCheckout(storeId, variantId, {
      checkoutData: {
        custom: {
          user_id: userId,
        },
      },
      checkoutOptions: {
        embed: false,
        media: false,
      },
      productOptions: {
        redirectUrl: `${baseUrl}/${locale}/pricing?success=true`,
      },
    })

    if (error) {
      throw new Error(`체크아웃 생성 실패: ${JSON.stringify(error)}`)
    }

    // 체크아웃 URL 반환
    const checkoutUrl = data?.data?.attributes?.url
    if (!checkoutUrl) throw new Error('체크아웃 URL을 받지 못했습니다.')

    return checkoutUrl
  }

  /**
   * 구독 상태 확인
   * 비유: "회원증 유효 확인" — DB에서 구독 정보를 조회
   *
   * 참고: 실제 Lemon Squeezy API를 직접 호출하지 않고
   * 웹훅으로 동기화된 Supabase DB를 조회하는 것이 효율적
   * (API 호출 제한 회피 + 응답 속도)
   */
  async verifySubscription(userId: string): Promise<Subscription | null> {
    // Supabase에서 구독 상태 조회 (웹훅으로 동기화된 데이터)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null
    }

    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      const { data } = await supabase
        .from('user_profiles')
        .select('subscription_status, subscription_id, subscription_plan, subscription_expires_at')
        .eq('id', userId)
        .single()

      if (!data || !data.subscription_status || data.subscription_status === 'expired') {
        return null
      }

      return {
        userId,
        planId: (data.subscription_plan as PlanId) ?? 'premium_monthly',
        status: data.subscription_status as Subscription['status'],
        currentPeriodEnd: data.subscription_expires_at,
        externalSubscriptionId: data.subscription_id ?? '',
      }
    } catch {
      return null
    }
  }

  /**
   * 웹훅 처리
   * 비유: "택배 도착 알림" — Lemon Squeezy가 결제 이벤트를 알려주면 DB 업데이트
   *
   * 지원 이벤트:
   *   - subscription_created: 새 구독 시작
   *   - subscription_updated: 구독 갱신/변경
   *   - subscription_cancelled: 구독 취소
   *   - order_created: 1회 결제 완료 (심층 리딩)
   */
  async handleWebhook(payload: unknown, signature: string): Promise<void> {
    // 1. 시그니처 검증 — "택배 기사 신분증 확인"
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    if (!secret) throw new Error('LEMONSQUEEZY_WEBHOOK_SECRET 환경변수가 필요합니다.')

    const rawBody = typeof payload === 'string' ? payload : JSON.stringify(payload)
    const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

    if (hmac !== signature) {
      throw new Error('웹훅 서명 검증 실패')
    }

    // 2. 이벤트 파싱
    const body = typeof payload === 'string' ? JSON.parse(payload) : payload
    const event = (body as { meta?: { event_name?: string } })?.meta?.event_name
    const data = (body as { data?: { attributes?: Record<string, unknown>; id?: string } })?.data
    const attrs = data?.attributes ?? {}
    const customData = (body as { meta?: { custom_data?: { user_id?: string } } })?.meta?.custom_data
    const userId = customData?.user_id

    if (!userId) {
      throw new Error('웹훅에 user_id가 없습니다.')
    }

    // 3. Supabase 업데이트 — 서비스 역할 클라이언트 사용 (RLS 우회)
    //    웹훅은 유저 세션 없이 외부에서 호출되므로 admin 권한 필요
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return // 개발 환경에서는 스킵
    }

    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    switch (event) {
      case 'subscription_created':
      case 'subscription_updated': {
        const status = attrs.status as string
        const variantId = String(attrs.variant_id ?? '')
        const endsAt = attrs.ends_at as string | null
        const renewsAt = attrs.renews_at as string | null

        await supabase
          .from('user_profiles')
          .update({
            subscription_status: status === 'active' ? 'active' : status === 'past_due' ? 'past_due' : 'cancelled',
            subscription_id: String(data?.id ?? ''),
            subscription_plan: getPlanIdFromVariant(variantId),
            subscription_expires_at: endsAt ?? renewsAt,
            is_premium: status === 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
        break
      }

      case 'subscription_cancelled': {
        const endsAt = attrs.ends_at as string | null
        await supabase
          .from('user_profiles')
          .update({
            subscription_status: 'cancelled',
            subscription_expires_at: endsAt,
            // 만료일까지는 프리미엄 유지
            is_premium: endsAt ? new Date(endsAt) > new Date() : false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
        break
      }

      case 'order_created': {
        // 1회 결제 (심층 리딩) — 프리미엄 표시 없이 별도 처리 가능
        // 현재는 간단히 로깅만
        break
      }
    }
  }

  /**
   * 구독 취소
   * 비유: "해지 신청서" — Lemon Squeezy API로 구독 해지
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    initSDK()

    const { error } = await lsCancelSubscription(subscriptionId)
    if (error) {
      throw new Error(`구독 취소 실패: ${JSON.stringify(error)}`)
    }
  }
}
