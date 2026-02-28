/* ─────────────────────────────────────────
 * 결제 추상화 인터페이스
 * 비유: USB-C 포트 — 어떤 충전기(결제사)를 꽂든 작동하는 "규격 통일"
 *
 * Lemon Squeezy → Paddle → Stripe 어디로 바꾸든
 * 이 인터페이스만 구현하면 나머지 코드는 수정 불필요
 * ───────────────────────────────────────── */

/** 가격 플랜 ID */
export type PlanId = 'deep_reading' | 'premium_monthly' | 'premium_yearly'

/** 플랜 상세 정보 */
export interface PricingPlan {
  id: PlanId
  name: string
  nameKo: string
  /** 가격 (USD 기준, 센트 단위 아님) */
  price: number
  /** 결제 주기 — 원타임이면 null */
  interval: 'month' | 'year' | null
  /** 결제사별 고유 가격 ID (Lemon Squeezy variant_id 등) */
  externalPriceId: string
}

/** 구독 상태 */
export interface Subscription {
  userId: string
  planId: PlanId
  status: 'active' | 'cancelled' | 'past_due' | 'expired'
  currentPeriodEnd: string | null
  /** 결제사 고유 구독 ID */
  externalSubscriptionId: string
}

/**
 * 결제 서비스 추상화 인터페이스
 * 비유: "콘센트 규격" — 어떤 결제사든 이 규격만 맞추면 꽂을 수 있다
 */
export interface PaymentProvider {
  /** 결제 페이지 URL 생성 — 유저를 결제 페이지로 보낸다 */
  createCheckout(priceId: string, userId: string, locale: string): Promise<string>

  /** 구독 상태 확인 — 이 유저가 프리미엄인지 확인 */
  verifySubscription(userId: string): Promise<Subscription | null>

  /** 웹훅 처리 — 결제사가 보내는 이벤트(결제 완료, 취소 등) 처리 */
  handleWebhook(payload: unknown, signature: string): Promise<void>

  /** 구독 취소 */
  cancelSubscription(subscriptionId: string): Promise<void>
}

/** 가격 플랜 목록 — 앱 전체에서 사용하는 "메뉴판" */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'deep_reading',
    name: 'Deep Reading',
    nameKo: '심층 리딩',
    price: 3.99,
    interval: null,
    externalPriceId: '', // Lemon Squeezy 승인 후 채울 것
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    nameKo: '프리미엄 월간',
    price: 6.99,
    interval: 'month',
    externalPriceId: '',
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    nameKo: '프리미엄 연간',
    price: 49.99,
    interval: 'year',
    externalPriceId: '',
  },
]
