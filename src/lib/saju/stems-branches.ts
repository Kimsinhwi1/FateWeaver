/* ─────────────────────────────────────────
 * 천간지지(天干地支) 데이터
 * 비유: 동양 달력의 "알파벳" — 10개 천간 + 12개 지지가 조합되어 60갑자를 만든다
 * 마치 시계의 시침(천간)과 분침(지지)이 돌아가며 60가지 조합을 만드는 것
 * ───────────────────────────────────────── */

import type { HeavenlyStem, EarthlyBranch, Element } from '@/types/saju'

/** 천간 10개 — 순서가 중요하다 (인덱스로 계산에 사용) */
export const HEAVENLY_STEMS: HeavenlyStem[] = [
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸',
]

/** 지지 12개 — 순서가 중요하다 */
export const EARTHLY_BRANCHES: EarthlyBranch[] = [
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥',
]

/** 천간 → 오행 매핑 (2개씩 짝) */
export const STEM_TO_ELEMENT: Record<HeavenlyStem, Element> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
}

/** 지지 → 오행 매핑 */
export const BRANCH_TO_ELEMENT: Record<EarthlyBranch, Element> = {
  '寅': 'wood', '卯': 'wood',
  '巳': 'fire', '午': 'fire',
  '辰': 'earth', '未': 'earth', '戌': 'earth', '丑': 'earth',
  '申': 'metal', '酉': 'metal',
  '子': 'water', '亥': 'water',
}

/** 오행 한국어 이름 */
export const ELEMENT_NAMES_KO: Record<Element, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
}

/** 오행 영어 이름 */
export const ELEMENT_NAMES_EN: Record<Element, string> = {
  wood: 'Wood',
  fire: 'Fire',
  earth: 'Earth',
  metal: 'Metal',
  water: 'Water',
}

/**
 * 월지(月支) 매핑 — 음력 월 → 지지
 * 비유: 1년 12달을 12지지에 배정한 "달력"
 * 인월(寅)이 1월(음력)부터 시작
 */
export const MONTH_BRANCHES: EarthlyBranch[] = [
  '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑',
]

/**
 * 시지(時支) 매핑 — 시간대 → 지지
 * 비유: 하루 24시간을 12지지로 나눈 "시간표"
 * 자시(子) = 23:00~01:00, 축시(丑) = 01:00~03:00, ...
 */
export const HOUR_BRANCHES: { branch: EarthlyBranch; startHour: number; endHour: number }[] = [
  { branch: '子', startHour: 23, endHour: 1 },
  { branch: '丑', startHour: 1, endHour: 3 },
  { branch: '寅', startHour: 3, endHour: 5 },
  { branch: '卯', startHour: 5, endHour: 7 },
  { branch: '辰', startHour: 7, endHour: 9 },
  { branch: '巳', startHour: 9, endHour: 11 },
  { branch: '午', startHour: 11, endHour: 13 },
  { branch: '未', startHour: 13, endHour: 15 },
  { branch: '申', startHour: 15, endHour: 17 },
  { branch: '酉', startHour: 17, endHour: 19 },
  { branch: '戌', startHour: 19, endHour: 21 },
  { branch: '亥', startHour: 21, endHour: 23 },
]
