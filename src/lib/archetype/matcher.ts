/* ─────────────────────────────────────────
 * 원형 매칭 엔진 — 사주 데이터 → 12 융 원형
 * 비유: "성격 프리즘" — 사주의 오행 빛을 통과시키면
 *       12가지 원형 색깔 중 하나로 분리되어 나온다
 *
 * 결정론적 로직 (AI 불필요):
 *   1. 일간 천간의 오행 → 기본 카테고리 (2~3개 후보)
 *   2. 오행 분포 우세/열세 → 세부 원형 결정
 *   3. 용신(favorableElement) → 보조 원형 (서브 타입)
 * ───────────────────────────────────────── */

import type { SajuData, Element } from '@/types/saju'
import { STEM_TO_ELEMENT } from '@/lib/saju/stems-branches'
import { analyzeBalance } from '@/lib/saju/elements'
import { ARCHETYPES, type ArchetypeId } from '@/data/archetypes'
import type { HeavenlyStem } from '@/types/saju'

export interface ArchetypeResult {
  /** 주 원형 */
  primary: ArchetypeId
  /** 보조 원형 (성장 방향) */
  secondary: ArchetypeId
  /** 일간의 오행 */
  dayMasterElement: Element
  /** 오행 우세/열세 정보 */
  dominantElement: Element
  weakElement: Element
  isBalanced: boolean
}

/**
 * 사주 데이터로 원형을 매칭한다
 * 비유: GPS 좌표를 넣으면 "당신은 ○○ 마을에 살고 있습니다"라고 알려주는 것
 */
export function matchArchetype(sajuData: SajuData): ArchetypeResult {
  /* 1단계: 일간 오행 파악 — "나"의 기본 에너지 */
  const dayMasterElement = STEM_TO_ELEMENT[sajuData.fourPillars.day.stem as HeavenlyStem]

  /* 2단계: 오행 균형 분석 — 어떤 에너지가 강하고 약한지 */
  const balance = analyzeBalance(sajuData.elementBalance)

  /* 3단계: 주 원형 결정
     — 일간 오행(primaryElement)과 가장 강한 오행(secondaryElement)이 맞는 원형 찾기 */
  const primaryArchetype = findBestMatch(dayMasterElement, balance.dominant)

  /* 4단계: 보조 원형 결정
     — 용신(부족한 에너지)이 가리키는 방향 = 성장 원형 */
  const secondaryArchetype = findBestMatch(
    sajuData.favorableElement,
    balance.weak !== sajuData.favorableElement ? balance.weak : dayMasterElement
  )

  /* 보조 원형이 주 원형과 같으면 다른 것으로 교체 */
  const finalSecondary = secondaryArchetype === primaryArchetype
    ? findAlternate(sajuData.favorableElement, primaryArchetype)
    : secondaryArchetype

  return {
    primary: primaryArchetype,
    secondary: finalSecondary,
    dayMasterElement,
    dominantElement: balance.dominant,
    weakElement: balance.weak,
    isBalanced: balance.isBalanced,
  }
}

/**
 * 주 오행 + 보조 오행 조합으로 가장 맞는 원형 찾기
 * 비유: "이 사람의 메인 성격 + 서브 성격" 조합으로 가장 가까운 원형 검색
 */
function findBestMatch(primaryElement: Element, secondaryElement: Element): ArchetypeId {
  /* 정확히 매칭되는 원형 찾기 */
  const exact = ARCHETYPES.find(
    (a) => a.primaryElement === primaryElement && a.secondaryElement === secondaryElement
  )
  if (exact) return exact.id

  /* 정확한 매칭이 없으면 primaryElement만으로 찾기 */
  const byPrimary = ARCHETYPES.find((a) => a.primaryElement === primaryElement)
  if (byPrimary) return byPrimary.id

  /* 최후 방어 — 절대 도달하지 않아야 하지만 안전장치 */
  return 'sage'
}

/**
 * 특정 원형을 제외하고 대안 찾기
 * 비유: "1지망이 탈락하면 같은 계열의 2지망을 찾는 것"
 */
function findAlternate(element: Element, exclude: ArchetypeId): ArchetypeId {
  const candidates = ARCHETYPES.filter(
    (a) => a.primaryElement === element && a.id !== exclude
  )
  return candidates.length > 0 ? candidates[0].id : 'everyman'
}
