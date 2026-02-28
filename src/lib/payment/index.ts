/* ─────────────────────────────────────────
 * 결제 프로바이더 팩토리
 * 비유: "콘센트 어댑터 자동 선택" — 환경에 맞는 결제사를 자동으로 골라준다
 *
 * PAYMENT_PROVIDER 환경변수로 전환:
 *   - 'lemonsqueezy' → Lemon Squeezy (프로덕션)
 *   - 'mock' 또는 미설정 → 목업 (개발용)
 * ───────────────────────────────────────── */

import type { PaymentProvider } from './types'
import { MockPaymentProvider } from './mock'

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER

  switch (provider) {
    case 'lemonsqueezy': {
      // 동적 import — Lemon Squeezy SDK가 필요한 경우에만 로드
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { LemonSqueezyProvider } = require('./lemonsqueezy')
      return new LemonSqueezyProvider()
    }
    default:
      return new MockPaymentProvider()
  }
}

export { PRICING_PLANS } from './types'
export type { PaymentProvider, PricingPlan, PlanId, Subscription } from './types'
