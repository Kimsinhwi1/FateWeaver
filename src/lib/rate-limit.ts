/* ─────────────────────────────────────────
 * IP 기반 Rate Limiter — 인메모리 슬라이딩 윈도우
 * 비유: "놀이공원 입장 게이트" — 1분에 10명까지만 통과시키는 자동 카운터
 *
 * 왜 인메모리인가?
 *   Vercel serverless에서도 warm instance 내에서는 메모리가 유지된다.
 *   완벽하지는 않지만 Redis 없이도 합리적인 수준의 보호를 제공한다.
 *   프로덕션에서 더 강력한 보호가 필요하면 Upstash Redis로 교체 가능.
 *
 * 동작:
 *   각 IP의 요청 타임스탬프를 배열로 저장하고,
 *   윈도우(기본 60초) 내의 요청만 카운트하여 한도 초과 시 차단.
 * ───────────────────────────────────────── */

interface RateLimitResult {
  allowed: boolean
  /** 남은 요청 횟수 */
  remaining: number
  /** 제한 해제까지 남은 밀리초 (초과 시에만 의미 있음) */
  retryAfterMs: number
}

/** IP별 요청 타임스탬프 저장소 */
const requestLog = new Map<string, number[]>()

/** 메모리 누수 방지를 위한 최대 IP 수 */
const MAX_ENTRIES = 10_000

/**
 * Rate Limit 검사
 * @param ip - 요청자 IP
 * @param windowMs - 윈도우 크기 (기본 60초)
 * @param maxRequests - 윈도우 내 최대 요청 수 (기본 10)
 */
export function checkRateLimit(
  ip: string,
  windowMs: number = 60_000,
  maxRequests: number = 10
): RateLimitResult {
  const now = Date.now()
  const windowStart = now - windowMs

  /** 윈도우 내 요청만 필터링 */
  const timestamps = requestLog.get(ip) ?? []
  const recent = timestamps.filter((t) => t > windowStart)

  if (recent.length >= maxRequests) {
    /** 가장 오래된 요청이 윈도우에서 빠지는 시점 = 재시도 가능 시점 */
    const oldestInWindow = recent[0]
    const retryAfterMs = oldestInWindow + windowMs - now

    return { allowed: false, remaining: 0, retryAfterMs }
  }

  /** 통과: 현재 요청 기록 */
  recent.push(now)
  requestLog.set(ip, recent)

  /** 주기적 정리 — 저장된 IP가 너무 많아지면 오래된 것부터 삭제 */
  if (requestLog.size > MAX_ENTRIES) {
    for (const [key, times] of requestLog) {
      const filtered = times.filter((t) => t > windowStart)
      if (filtered.length === 0) requestLog.delete(key)
      else requestLog.set(key, filtered)
    }
  }

  return {
    allowed: true,
    remaining: maxRequests - recent.length,
    retryAfterMs: 0,
  }
}
