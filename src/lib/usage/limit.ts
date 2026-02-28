/* ─────────────────────────────────────────
 * 무료 사용 횟수 제한
 * 비유: "시식 카운터" — 하루 1회 무료 시식 후 "정식 주문" 안내
 *
 * 전략:
 *   비로그인 → localStorage에 날짜별 카운트 저장
 *   로그인(무료) → 같은 localStorage 기반 (서버 검증은 Phase 4에서)
 *   프리미엄 → 제한 없음
 * ───────────────────────────────────────── */

const STORAGE_KEY = 'fateweaver_usage'

interface UsageData {
  /** 날짜별 기능 사용 횟수 */
  [date: string]: {
    tarot?: number
    daily?: number
    compatibility?: number
    decade?: number
    monthly?: number
    yearly?: number
  }
}

/** 무료 티어 일일 제한 */
export const FREE_LIMITS = {
  tarot: 1,           // 하루 타로 1회
  daily: 3,           // 오늘의 운세 3회 (다른 생일로 확인 가능)
  compatibility: 0,   // 궁합: 무료 0회 = 프리미엄 전용
  decade: 0,          // 10년 대운: 프리미엄 전용
  monthly: 0,         // 월간 운세: 프리미엄 전용
  yearly: 0,          // 연간 운세: 프리미엄 전용
} as const

type FeatureKey = keyof typeof FREE_LIMITS

/** 오늘 날짜 문자열 (YYYY-MM-DD) */
function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

/** localStorage에서 사용량 읽기 */
function getUsageData(): UsageData {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/** localStorage에 사용량 저장 */
function setUsageData(data: UsageData): void {
  if (typeof window === 'undefined') return
  // 7일 이상 지난 데이터 정리 — 저장 공간 낭비 방지
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const cleaned: UsageData = {}
  for (const [date, counts] of Object.entries(data)) {
    if (date >= cutoffStr) {
      cleaned[date] = counts
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
}

/** 오늘 이 기능을 몇 번 사용했는지 확인 */
export function getUsageCount(feature: FeatureKey): number {
  const data = getUsageData()
  const today = getToday()
  return data[today]?.[feature] ?? 0
}

/** 이 기능을 지금 사용할 수 있는지 확인 */
export function canUseFeature(feature: FeatureKey, isPremium: boolean): boolean {
  if (isPremium) return true
  return getUsageCount(feature) < FREE_LIMITS[feature]
}

/** 사용 횟수 1 증가 */
export function incrementUsage(feature: FeatureKey): void {
  const data = getUsageData()
  const today = getToday()

  if (!data[today]) data[today] = {}
  data[today][feature] = (data[today][feature] ?? 0) + 1

  setUsageData(data)
}

/** 남은 무료 사용 횟수 */
export function getRemainingUses(feature: FeatureKey, isPremium: boolean): number {
  if (isPremium) return Infinity
  return Math.max(0, FREE_LIMITS[feature] - getUsageCount(feature))
}
