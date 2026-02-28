/* ─────────────────────────────────────────
 * 목업 결제 프로바이더
 * 비유: 연습용 "가짜 돈" — 개발/테스트 시 실제 결제 없이 플로우 확인
 *
 * 사용 시점: 결제사 연동 전 또는 로컬 개발 환경
 * ───────────────────────────────────────── */

import type { PaymentProvider, Subscription } from './types'

/** 메모리 내 구독 저장소 — 서버 재시작 시 초기화됨 */
const mockSubscriptions = new Map<string, Subscription>()

export class MockPaymentProvider implements PaymentProvider {
  async createCheckout(
    priceId: string,
    userId: string,
    _locale: string
  ): Promise<string> {
    // 목업: 즉시 구독 활성화하고 현재 페이지로 리다이렉트
    mockSubscriptions.set(userId, {
      userId,
      planId: 'premium_monthly',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      externalSubscriptionId: `mock_sub_${Date.now()}`,
    })

    // 목업에서는 결제 페이지 대신 성공 URL 반환
    return '/pricing?success=true'
  }

  async verifySubscription(userId: string): Promise<Subscription | null> {
    return mockSubscriptions.get(userId) ?? null
  }

  async handleWebhook(_payload: unknown, _signature: string): Promise<void> {
    // 목업 — 웹훅 무동작
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    // 해당 구독 찾아서 취소 처리
    for (const [userId, sub] of mockSubscriptions.entries()) {
      if (sub.externalSubscriptionId === subscriptionId) {
        mockSubscriptions.set(userId, { ...sub, status: 'cancelled' })
        break
      }
    }
  }
}
