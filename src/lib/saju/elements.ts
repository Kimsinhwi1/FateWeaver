/* ─────────────────────────────────────────
 * 오행(五行) 로직
 * 비유: 자연의 다섯 가지 에너지의 "관계도"
 * 목(木)→화(火)→토(土)→금(金)→수(水)→목 으로 순환하며 서로 돕고 제약한다
 * ───────────────────────────────────────── */

import type { Element, ElementBalance } from '@/types/saju'

/**
 * 상생(相生) 관계 — "서로 살리는 관계"
 * 비유: 나무(木)를 태우면 불(火)이 되고,
 *       불이 꺼지면 재(土)가 되고,
 *       땅에서 쇠(金)가 나오고,
 *       쇠가 차가우면 물(水)방울이 맺히고,
 *       물을 마시면 나무(木)가 자란다
 */
export const GENERATING_CYCLE: Record<Element, Element> = {
  wood: 'fire',   // 목생화: 나무가 불을 살린다
  fire: 'earth',  // 화생토: 불이 재(흙)를 만든다
  earth: 'metal', // 토생금: 땅에서 쇠가 나온다
  metal: 'water', // 금생수: 쇠가 물방울을 맺는다
  water: 'wood',  // 수생목: 물이 나무를 키운다
}

/**
 * 상극(相剋) 관계 — "서로 제약하는 관계"
 * 비유: 나무(木)가 흙(土)의 영양분을 빼앗고,
 *       흙이 물(水)을 막고,
 *       물이 불(火)을 끄고,
 *       불이 쇠(金)를 녹이고,
 *       쇠가 나무(木)를 벤다
 */
export const OVERCOMING_CYCLE: Record<Element, Element> = {
  wood: 'earth',  // 목극토
  earth: 'water', // 토극수
  water: 'fire',  // 수극화
  fire: 'metal',  // 화극금
  metal: 'wood',  // 금극목
}

/**
 * 오행 분포에서 가장 부족한 오행(용신)을 판단한다
 * 비유: 밴드에서 드러머가 없으면 드러머를 찾아야 하듯,
 *       사주에서 부족한 오행을 찾아 보완하는 것
 */
export function findFavorableElement(balance: ElementBalance): Element {
  const entries = Object.entries(balance) as [Element, number][]
  // 가장 적은 오행을 찾는다
  entries.sort((a, b) => a[1] - b[1])
  return entries[0][0]
}

/**
 * 오행 분포의 균형 상태를 평가한다
 * 비유: 건강검진처럼 각 오행의 "수치"가 정상 범위인지 확인
 */
export function analyzeBalance(balance: ElementBalance): {
  dominant: Element
  weak: Element
  isBalanced: boolean
} {
  const entries = Object.entries(balance) as [Element, number][]
  entries.sort((a, b) => b[1] - a[1])

  const dominant = entries[0][0]
  const weak = entries[entries.length - 1][0]
  const maxVal = entries[0][1]
  const minVal = entries[entries.length - 1][1]

  // 최대-최소 차이가 2 이하면 균형잡힘
  const isBalanced = maxVal - minVal <= 2

  return { dominant, weak, isBalanced }
}
