/* ─────────────────────────────────────────
 * Lemon Squeezy 결제 프로바이더
 * 비유: 실제 "충전기" — Lemon Squeezy 승인 후 이 파일만 채우면 끝
 *
 * TODO: Lemon Squeezy 계정 승인 후 구현
 * 필요 환경변수:
 *   - LEMONSQUEEZY_API_KEY
 *   - LEMONSQUEEZY_STORE_ID
 *   - LEMONSQUEEZY_WEBHOOK_SECRET
 * ───────────────────────────────────────── */

import type { PaymentProvider, Subscription } from './types'

export class LemonSqueezyProvider implements PaymentProvider {
  async createCheckout(
    _priceId: string,
    _userId: string,
    _locale: string
  ): Promise<string> {
    // TODO: Lemon Squeezy Checkout API 호출
    // https://docs.lemonsqueezy.com/api/checkouts
    throw new Error('Lemon Squeezy 연동 전입니다. 승인 후 구현 예정.')
  }

  async verifySubscription(_userId: string): Promise<Subscription | null> {
    // TODO: Lemon Squeezy Subscriptions API로 구독 상태 확인
    // https://docs.lemonsqueezy.com/api/subscriptions
    throw new Error('Lemon Squeezy 연동 전입니다.')
  }

  async handleWebhook(_payload: unknown, _signature: string): Promise<void> {
    // TODO: Lemon Squeezy 웹훅 시그니처 검증 + 이벤트 처리
    // 이벤트: subscription_created, subscription_updated, subscription_cancelled
    throw new Error('Lemon Squeezy 연동 전입니다.')
  }

  async cancelSubscription(_subscriptionId: string): Promise<void> {
    // TODO: Lemon Squeezy 구독 취소 API 호출
    throw new Error('Lemon Squeezy 연동 전입니다.')
  }
}
