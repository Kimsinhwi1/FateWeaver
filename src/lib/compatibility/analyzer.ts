/* ─────────────────────────────────────────
 * 궁합 분석 엔진
 * 비유: 두 사람의 "화학 반응식" — 각자의 오행 에너지가
 *       만나면 어떤 반응이 일어나는지 분석하는 것
 *
 * 분석 요소 3가지:
 *   1. 일간 궁합: 두 사람의 dayMaster 간 오행 관계 (상생/상극/비화)
 *   2. 오행 보완도: A의 부족한 오행을 B가 채워주는지
 *   3. 종합 점수: 0-100점 가중 평균
 * ───────────────────────────────────────── */

import type { SajuData, Element } from '@/types/saju'
import { GENERATING_CYCLE, OVERCOMING_CYCLE, analyzeBalance } from '@/lib/saju/elements'
import { STEM_TO_ELEMENT } from '@/lib/saju/stems-branches'
import type { HeavenlyStem } from '@/types/saju'

/** 일간 관계 유형 — 두 사람의 핵심 에너지가 어떻게 만나는지 */
export type DayMasterRelation =
  | 'generating'        // 상생: 한 쪽이 다른 쪽을 살린다
  | 'generated_by'      // 피생: 상대가 나를 살린다
  | 'overcoming'        // 상극: 한 쪽이 다른 쪽을 제약한다
  | 'overcome_by'       // 피극: 상대가 나를 제약한다
  | 'same'              // 비화: 같은 오행 — 동지

/** 궁합 분석 결과 */
export interface CompatibilityResult {
  /** 종합 점수 (0-100) */
  score: number
  /** 일간(dayMaster) 간 오행 관계 */
  dayMasterRelation: DayMasterRelation
  /** Person 1의 일간 오행 */
  person1Element: Element
  /** Person 2의 일간 오행 */
  person2Element: Element
  /** 오행 보완 시너지 점수 (0-100) */
  elementSynergy: number
  /** 강점 목록 (번역 키) */
  strengths: string[]
  /** 도전 과제 목록 (번역 키) */
  challenges: string[]
}

/**
 * dayMaster 문자열에서 천간(HeavenlyStem)을 추출하여 오행을 알아낸다
 * 비유: "壬 (water)" 같은 문자열에서 첫 한자를 읽어내는 것
 */
function getDayMasterElement(sajuData: SajuData): Element {
  /* dayMaster 포맷: "壬 (water)" — 첫 문자가 천간 */
  const stem = sajuData.dayMaster.charAt(0) as HeavenlyStem
  return STEM_TO_ELEMENT[stem] ?? sajuData.fourPillars.day.element
}

/**
 * 두 오행 간의 관계를 판별한다
 * 비유: 가위바위보처럼, 두 오행이 만나면 어떤 관계가 형성되는지 확인
 */
function getRelation(element1: Element, element2: Element): DayMasterRelation {
  if (element1 === element2) return 'same'
  if (GENERATING_CYCLE[element1] === element2) return 'generating'
  if (GENERATING_CYCLE[element2] === element1) return 'generated_by'
  if (OVERCOMING_CYCLE[element1] === element2) return 'overcoming'
  if (OVERCOMING_CYCLE[element2] === element1) return 'overcome_by'
  /* 이론상 도달하지 않지만, 타입 안전을 위해 */
  return 'same'
}

/**
 * 일간 관계별 기본 궁합 점수
 * 비유: 첫인상 점수 — 두 에너지가 처음 만났을 때의 "기본 호감도"
 *
 * - 상생(내가 상대를 살림) = 높은 점수 (자연스러운 조화)
 * - 피생(상대가 나를 살림) = 약간 높은 점수 (받는 관계)
 * - 비화(같은 오행) = 중간 점수 (동지/라이벌)
 * - 상극/피극 = 낮지만 0은 아닌 점수 (긴장감 있지만 성장 가능)
 */
function getRelationBaseScore(relation: DayMasterRelation): number {
  switch (relation) {
    case 'generating': return 85
    case 'generated_by': return 80
    case 'same': return 70
    case 'overcoming': return 50
    case 'overcome_by': return 45
  }
}

/**
 * 오행 보완도 계산 — A의 부족한 오행을 B가 얼마나 채워주는지
 * 비유: 퍼즐 맞추기 — A에게 빈 조각이 있는데, B가 그 조각을 가지고 있으면 시너지
 *
 * 양방향으로 계산: A→B 보완 + B→A 보완의 평균
 */
function calculateElementSynergy(saju1: SajuData, saju2: SajuData): number {
  const balance1 = analyzeBalance(saju1.elementBalance)
  const balance2 = analyzeBalance(saju2.elementBalance)

  let synergyScore = 50 /* 기본 점수 */

  /* A의 약한 오행을 B가 강하게 가지고 있으면 보너스 */
  if (balance1.weak === balance2.dominant) synergyScore += 20
  if (balance2.weak === balance1.dominant) synergyScore += 20

  /* 용신(필요한 오행)을 상대가 많이 가지고 있으면 보너스 */
  const fav1Count = saju2.elementBalance[saju1.favorableElement]
  const fav2Count = saju1.elementBalance[saju2.favorableElement]
  if (fav1Count >= 2) synergyScore += 10
  if (fav2Count >= 2) synergyScore += 10

  /* 둘 다 균형잡힌 사주면 보너스 */
  if (balance1.isBalanced && balance2.isBalanced) synergyScore += 5

  /* 둘의 약한 오행이 같으면 감점 (같은 결핍) */
  if (balance1.weak === balance2.weak) synergyScore -= 10

  return Math.max(0, Math.min(100, synergyScore))
}

/**
 * 관계 유형에 맞는 강점/도전 번역 키를 결정한다
 * 비유: 두 사람의 관계 유형에 따른 "궁합 설명서" 목차
 */
function getStrengthsAndChallenges(
  relation: DayMasterRelation,
  synergy: number
): { strengths: string[]; challenges: string[] } {
  const strengths: string[] = []
  const challenges: string[] = []

  /* 일간 관계 기반 강점/도전 */
  switch (relation) {
    case 'generating':
      strengths.push('naturalHarmony', 'growthTogether')
      challenges.push('dependencyRisk')
      break
    case 'generated_by':
      strengths.push('supportivePartner', 'emotionalSecurity')
      challenges.push('passivityRisk')
      break
    case 'same':
      strengths.push('deepUnderstanding', 'sharedValues')
      challenges.push('competitionRisk', 'samenessRisk')
      break
    case 'overcoming':
      strengths.push('dynamicTension', 'personalGrowth')
      challenges.push('conflictRisk', 'powerImbalance')
      break
    case 'overcome_by':
      strengths.push('learningOpportunity', 'complementaryStrength')
      challenges.push('conflictRisk', 'selfEsteemRisk')
      break
  }

  /* 오행 시너지 기반 추가 */
  if (synergy >= 80) {
    strengths.push('excellentBalance')
  } else if (synergy <= 30) {
    challenges.push('elementImbalance')
  }

  return { strengths, challenges }
}

/**
 * 메인 함수: 두 사람의 궁합을 분석한다
 * 비유: 두 사람의 사주 "DNA"를 비교하여 궁합 리포트를 생성하는 것
 *
 * @param saju1 - 첫 번째 사람의 사주 데이터
 * @param saju2 - 두 번째 사람의 사주 데이터
 * @returns 궁합 분석 결과 (점수, 관계 유형, 강점, 도전)
 */
export function analyzeCompatibility(
  saju1: SajuData,
  saju2: SajuData
): CompatibilityResult {
  /* 1. 일간 오행 추출 */
  const el1 = getDayMasterElement(saju1)
  const el2 = getDayMasterElement(saju2)

  /* 2. 일간 관계 판별 */
  const relation = getRelation(el1, el2)

  /* 3. 기본 점수 (일간 관계 40%) */
  const baseScore = getRelationBaseScore(relation)

  /* 4. 오행 보완 시너지 (60%) */
  const synergy = calculateElementSynergy(saju1, saju2)

  /* 5. 종합 점수 — 가중 평균 */
  const totalScore = Math.round(baseScore * 0.4 + synergy * 0.6)

  /* 6. 강점/도전 판별 */
  const { strengths, challenges } = getStrengthsAndChallenges(relation, synergy)

  return {
    score: Math.max(0, Math.min(100, totalScore)),
    dayMasterRelation: relation,
    person1Element: el1,
    person2Element: el2,
    elementSynergy: synergy,
    strengths,
    challenges,
  }
}
