/* ─────────────────────────────────────────
 * 사주팔자 관련 타입 정의
 * 비유: 사주의 "주민등록증 양식" — 어떤 정보가 필요한지 규격을 정한다
 * ───────────────────────────────────────── */

/** 천간(天干) — 하늘의 기운 10가지 */
export type HeavenlyStem =
  | '甲' | '乙'   // 목(木)
  | '丙' | '丁'   // 화(火)
  | '戊' | '己'   // 토(土)
  | '庚' | '辛'   // 금(金)
  | '壬' | '癸'   // 수(水)

/** 지지(地支) — 땅의 기운 12가지 */
export type EarthlyBranch =
  | '子' | '丑' | '寅' | '卯'
  | '辰' | '巳' | '午' | '未'
  | '申' | '酉' | '戌' | '亥'

/** 오행(五行) — 자연의 다섯 가지 에너지 */
export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

/** 사주의 한 기둥 — 천간 + 지지 조합 */
export interface Pillar {
  /** 천간 (하늘 글자) */
  stem: HeavenlyStem
  /** 지지 (땅 글자) */
  branch: EarthlyBranch
  /** 이 기둥의 오행 (천간 기준) */
  element: Element
}

/** 사주 네 기둥 전체 */
export interface FourPillars {
  /** 년주 — 태어난 해 */
  year: Pillar
  /** 월주 — 태어난 달 */
  month: Pillar
  /** 일주 — 태어난 날 */
  day: Pillar
  /** 시주 — 태어난 시간 (시간 모르면 null) */
  hour: Pillar | null
}

/** 오행 분포 — 각 오행이 사주에 몇 개 있는지 */
export interface ElementBalance {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
}

/** 사주 분석 결과 — AI에게 전달할 구조화된 데이터 */
export interface SajuData {
  /** 사주 네 기둥 */
  fourPillars: FourPillars
  /** 오행 분포 */
  elementBalance: ElementBalance
  /** 일간(日干) — "나" 자신을 대표하는 글자 */
  dayMaster: string
  /** 용신(用神) — 부족해서 보완이 필요한 오행 */
  favorableElement: Element
}

/** 서양 별자리 */
export type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces'

/** 유저의 생년월일시 입력 데이터 */
export interface BirthInput {
  /** 생년월일 (YYYY-MM-DD) */
  birthDate: string
  /** 태어난 시간 (HH:MM) — 모르면 null */
  birthTime: string | null
  /** 태어난 곳 시간대 */
  birthTimezone: string
  /** 성별 (사주 해석에 영향) */
  gender?: 'male' | 'female'
}
