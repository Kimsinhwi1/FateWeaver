/* ─────────────────────────────────────────
 * API 라우트 가드 — Rate Limit + 인증 + 사용량 통합 검사
 * 비유: "보안 3중 잠금" — (1) 속도 제한 → (2) 신분 확인 → (3) 입장권 확인
 *
 * 왜 개별 유틸이 아니라 통합 가드인가?
 *   모든 API 라우트에서 동일한 3단계 검사를 반복하는 대신,
 *   하나의 함수로 묶어서 실수를 방지하고 일관성을 보장한다.
 *
 * 사용법:
 *   const guard = await apiGuard(request, { requirePremium: true })
 *   if (guard.error) return guard.error
 *   // guard.userId, guard.isPremium 사용 가능
 * ───────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

/** 서버사이드 사용량 추적 (인메모리 — Supabase 없을 때 폴백) */
const usageStore = new Map<string, Map<string, number>>()

type FeatureKey = 'tarot' | 'daily' | 'compatibility' | 'decade' | 'monthly' | 'yearly'

/** 무료 티어 일일 제한 (서버 기준 — 클라이언트 limit.ts와 동기화) */
const FREE_LIMITS: Record<FeatureKey, number> = {
  tarot: 1,
  daily: 3,
  compatibility: 0,
  decade: 0,
  monthly: 0,
  yearly: 0,
}

interface GuardOptions {
  /** 프리미엄 전용 기능인가? (true면 비로그인/무료 유저 차단) */
  requirePremium?: boolean
  /** 사용량 체크할 기능 키 (지정하면 일일 제한 적용) */
  feature?: FeatureKey
}

interface GuardSuccess {
  error: null
  userId: string | null
  isPremium: boolean
  ip: string
  /**
   * 사용량 확정 — 입력값 검증 통과 후 반드시 호출해야 카운트가 증가한다
   * 비유: "식당 입장은 했지만, 주문(confirmUsage) 해야 식사 횟수가 차감"
   *
   * 왜 lazy인가?
   *   입력값이 잘못되어 400을 반환할 때까지 사용량을 차감하면,
   *   유저 입장에서 "아무것도 안 했는데 횟수가 줄었다"는 억울한 상황 발생
   */
  confirmUsage: () => Promise<void>
}

interface GuardFailure {
  error: NextResponse
  userId: null
  isPremium: false
  ip: string
  /** 실패 시에는 호출해도 아무 일도 일어나지 않는 no-op */
  confirmUsage: () => Promise<void>
}

type GuardResult = GuardSuccess | GuardFailure

/** 요청자 IP 추출 — Vercel은 x-forwarded-for에 실제 IP를 전달 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

/** 오늘 날짜 문자열 (YYYY-MM-DD) — 사용량 키로 사용 */
function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * 서버사이드 사용량 조회
 * Supabase가 있으면 DB 기반, 없으면 인메모리 폴백
 */
async function getServerUsageCount(
  identifier: string,
  feature: FeatureKey
): Promise<number> {
  const today = getToday()
  const key = `${identifier}:${feature}:${today}`

  /** Supabase가 설정되어 있으면 DB에서 조회 */
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const supabase = createAdminClient()
      const { data } = await supabase
        .from('usage_tracking')
        .select('count')
        .eq('identifier', identifier)
        .eq('feature', feature)
        .eq('usage_date', today)
        .single()

      return data?.count ?? 0
    } catch {
      /** 테이블이 없거나 에러 시 인메모리 폴백 */
    }
  }

  /** 인메모리 폴백 */
  const todayStore = usageStore.get(today)
  return todayStore?.get(`${identifier}:${feature}`) ?? 0
}

/**
 * 서버사이드 사용량 원자적 증가
 * 비유: "출석부에 도장 찍기" — INSERT ... ON CONFLICT로 한 번에 처리
 *
 * 왜 원자적(atomic)인가?
 *   select → insert/update 2단계는 동시 요청 시 레이스 컨디션 발생 가능.
 *   예: 두 요청이 동시에 count=0을 읽고, 둘 다 insert 시도 → 충돌 또는 카운트 누락.
 *   INSERT ... ON CONFLICT DO UPDATE SET count = count + 1 은 DB 레벨에서
 *   원자적으로 처리되므로 동시 요청에도 정확한 카운트를 보장한다.
 */
async function incrementServerUsage(
  identifier: string,
  feature: FeatureKey
): Promise<void> {
  const today = getToday()
  const key = `${identifier}:${feature}`

  /** Supabase가 설정되어 있으면 RPC로 원자적 카운트 증가 */
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const supabase = createAdminClient()

      /** increment_usage RPC — INSERT ... ON CONFLICT DO UPDATE SET count = count + 1 */
      const { error } = await supabase.rpc('increment_usage', {
        p_identifier: identifier,
        p_feature: feature,
        p_usage_date: today,
      })

      if (error) throw error
      return
    } catch {
      /** RPC 실패 시 인메모리에라도 기록 */
    }
  }

  /** 인메모리 폴백 (Node.js 싱글 스레드 → 동기 코드 내 레이스 없음) */
  if (!usageStore.has(today)) {
    /** 새 날이 시작되면 이전 날짜 데이터 정리 */
    usageStore.clear()
    usageStore.set(today, new Map())
  }

  const todayStore = usageStore.get(today)!
  const current = todayStore.get(key) ?? 0
  todayStore.set(key, current + 1)
}

/**
 * API 라우트 가드 — 모든 검사를 한 번에 수행
 *
 * 순서: Rate Limit → 인증 → 프리미엄 → 사용량
 */
export async function apiGuard(
  request: NextRequest,
  options: GuardOptions = {}
): Promise<GuardResult> {
  const ip = getClientIp(request)

  /** no-op 함수 — 실패 케이스나 사용량 체크 불필요 시 반환 */
  const noop = async () => {}

  /* ── 1단계: Rate Limit (모든 요청) ── */
  const rateResult = checkRateLimit(ip)
  if (!rateResult.allowed) {
    return {
      error: NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateResult.retryAfterMs / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      ),
      userId: null,
      isPremium: false,
      ip,
      confirmUsage: noop,
    }
  }

  /* ── 2단계: 인증 + 프리미엄 확인 ── */
  let userId: string | null = null
  let isPremium = false

  /**
   * Supabase가 설정되어 있을 때만 인증 시도
   * 개발 환경에서 Supabase 없이도 작동하도록 graceful 처리
   */
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        userId = user.id

        /** 프리미엄 상태 확인 — user_profiles 테이블에서 조회 */
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single()

        isPremium = profile?.is_premium ?? false
      }
    } catch {
      /** 인증 실패 시 비로그인으로 간주 — 프리미엄 필수가 아니면 계속 진행 */
    }
  }

  /** 프리미엄 전용 기능인데 프리미엄이 아닌 경우 차단 */
  if (options.requirePremium && !isPremium) {
    const status = userId ? 403 : 401
    const message = userId
      ? 'Premium subscription required'
      : 'Authentication required'

    return {
      error: NextResponse.json({ error: message }, { status }),
      userId: null,
      isPremium: false,
      ip,
      confirmUsage: noop,
    }
  }

  /* ── 3단계: 사용량 제한 (무료 유저만) ── */
  if (options.feature && !isPremium) {
    const limit = FREE_LIMITS[options.feature]
    /** 사용량 식별자: 로그인 유저는 userId, 비로그인은 IP */
    const identifier = userId ?? ip
    const count = await getServerUsageCount(identifier, options.feature)

    if (count >= limit) {
      return {
        error: NextResponse.json(
          {
            error: 'Daily limit reached',
            limit,
            used: count,
            premium_required: limit === 0,
          },
          { status: 429 }
        ),
        userId: null,
        isPremium: false,
        ip,
        confirmUsage: noop,
      }
    }

    /**
     * 사용량을 lazy하게 증가 — confirmUsage() 호출 시에만 카운트
     * 왜? 입력값 검증(400) 전에 차감하면 유저가 억울하게 횟수를 잃음
     * 라우트에서 입력값 검증 통과 후 await guard.confirmUsage() 호출
     */
    const featureToConfirm = options.feature
    return {
      error: null,
      userId,
      isPremium,
      ip,
      confirmUsage: async () => {
        await incrementServerUsage(identifier, featureToConfirm)
      },
    }
  }

  return { error: null, userId, isPremium, ip, confirmUsage: noop }
}
