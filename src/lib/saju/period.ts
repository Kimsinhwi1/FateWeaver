/* ─────────────────────────────────────────
 * 대운/월운/연운 시간 유틸리티
 * 비유: 사주의 "시계" — 10년 주기(대운), 연간, 월간의
 *       천간지지를 계산하여 운의 흐름을 읽는 도구
 *
 * 핵심 원리:
 *   천간 10개 × 지지 12개 = 60갑자 순환
 *   (year - 4) % 10 → 천간 인덱스
 *   (year - 4) % 12 → 지지 인덱스
 * ───────────────────────────────────────── */

import type { SajuData, Element } from '@/types/saju'
import type { HeavenlyStem, EarthlyBranch } from '@/types/saju'
import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  STEM_TO_ELEMENT,
  BRANCH_TO_ELEMENT,
  MONTH_BRANCHES,
} from '@/lib/saju/stems-branches'
import { GENERATING_CYCLE, OVERCOMING_CYCLE } from '@/lib/saju/elements'

/** 기둥 데이터 — 천간 + 지지 + 오행 */
export interface PillarData {
  stem: HeavenlyStem
  branch: EarthlyBranch
  element: Element
}

/** 기간과 사주의 관계 */
export type PeriodRelation =
  | 'generating'      // 내 사주가 이 시기를 살린다 (능동적 에너지)
  | 'generated_by'    // 이 시기가 나를 살린다 (지원받는 에너지)
  | 'overcoming'      // 내 사주가 이 시기를 누른다 (도전적 에너지)
  | 'overcome_by'     // 이 시기가 나를 누른다 (시련의 에너지)
  | 'same'            // 같은 오행 — 비화 (공명 에너지)

/** 10년 대운 한 해의 데이터 */
export interface DecadePeriodYear {
  year: number
  pillar: PillarData
  relation: PeriodRelation
}

/**
 * 특정 년도의 년주(年柱)를 계산한다
 * 비유: 그 해의 "우주 이름표" — 2026년은 병오(丙午)년, 화(火) 에너지
 *
 * 계산 원리: 60갑자 순환에서 기준년(甲子 = 서기 4년)으로부터의 거리
 */
export function getYearPillar(year: number): PillarData {
  const stemIdx = (year - 4) % 10
  const branchIdx = (year - 4) % 12

  /* 음수 방지 — JavaScript의 % 연산자는 음수를 반환할 수 있다 */
  const stem = HEAVENLY_STEMS[((stemIdx % 10) + 10) % 10]
  const branch = EARTHLY_BRANCHES[((branchIdx % 12) + 12) % 12]

  return {
    stem,
    branch,
    element: STEM_TO_ELEMENT[stem],
  }
}

/**
 * 특정 년/월의 월주(月柱)를 계산한다
 * 비유: 그 달의 "에너지 색깔" — 같은 해라도 달마다 다른 기운이 흐른다
 *
 * 월지(月支): 인월(寅)=1월부터 시작 → MONTH_BRANCHES 배열 사용
 * 월간(月干): 연간(年干)에 따라 결정되는 규칙이 있다
 *   → 甲/己년 → 丙寅월부터, 乙/庚년 → 戊寅월부터, ...
 */
export function getMonthPillar(year: number, month: number): PillarData {
  /* 월지 — 1월=寅, 2월=卯, ..., 12월=丑 */
  const branch = MONTH_BRANCHES[month - 1]

  /* 월간 계산 — 연간에 따른 월간 시작점 규칙
   * 비유: 매년 1월의 천간이 다르다 — 연간이 "씨앗"이 되어 월간을 결정
   *
   * 규칙표:
   *   甲/己년 → 1월 천간 = 丙 (인덱스 2)
   *   乙/庚년 → 1월 천간 = 戊 (인덱스 4)
   *   丙/辛년 → 1월 천간 = 庚 (인덱스 6)
   *   丁/壬년 → 1월 천간 = 壬 (인덱스 8)
   *   戊/癸년 → 1월 천간 = 甲 (인덱스 0)
   */
  const yearStemIdx = (year - 4) % 10
  const baseMonthStemIdx = (yearStemIdx % 5) * 2 + 2
  const monthStemIdx = (baseMonthStemIdx + (month - 1)) % 10
  const stem = HEAVENLY_STEMS[monthStemIdx]

  return {
    stem,
    branch,
    element: STEM_TO_ELEMENT[stem],
  }
}

/**
 * 두 오행 사이의 관계를 판별한다
 * 비유: 두 에너지가 만났을 때 "화학 반응" 유형을 확인
 */
export function analyzePeriodRelation(
  sajuData: SajuData,
  periodElement: Element
): PeriodRelation {
  const dayMasterElement = sajuData.fourPillars.day.element

  if (dayMasterElement === periodElement) return 'same'
  if (GENERATING_CYCLE[dayMasterElement] === periodElement) return 'generating'
  if (GENERATING_CYCLE[periodElement] === dayMasterElement) return 'generated_by'
  if (OVERCOMING_CYCLE[dayMasterElement] === periodElement) return 'overcoming'
  if (OVERCOMING_CYCLE[periodElement] === dayMasterElement) return 'overcome_by'

  /* 이론상 여기에 도달하지 않지만, 타입 안전을 위해 */
  return 'same'
}

/**
 * 10년 대운 기간을 계산한다
 * 비유: 앞으로 10년의 "운세 지도" — 각 해마다 어떤 에너지가 흐르는지 미리 보는 것
 *
 * 현재 연도부터 10년간 각 년도의:
 *   - 천간지지 (우주 이름표)
 *   - 오행 (에너지 유형)
 *   - 사주와의 관계 (상생/상극/비화)
 * 를 계산하여 반환한다
 */
export function getDecadePeriods(
  sajuData: SajuData,
  startYear: number
): DecadePeriodYear[] {
  const periods: DecadePeriodYear[] = []

  for (let i = 0; i < 10; i++) {
    const year = startYear + i
    const pillar = getYearPillar(year)
    const relation = analyzePeriodRelation(sajuData, pillar.element)

    periods.push({ year, pillar, relation })
  }

  return periods
}

/**
 * 오행 이름을 사람이 읽을 수 있는 형태로 반환
 * 비유: 코드명(wood)을 자연 이름(목/Wood)으로 번역
 */
export function getElementDisplayName(element: Element, locale: string): string {
  const names: Record<Element, { ko: string; en: string }> = {
    wood:  { ko: '목(木)', en: 'Wood' },
    fire:  { ko: '화(火)', en: 'Fire' },
    earth: { ko: '토(土)', en: 'Earth' },
    metal: { ko: '금(金)', en: 'Metal' },
    water: { ko: '수(水)', en: 'Water' },
  }
  return names[element][locale === 'ko' ? 'ko' : 'en']
}

/**
 * 관계를 사람이 읽을 수 있는 형태로 반환
 * 비유: 관계 유형 코드를 이해하기 쉬운 설명으로 번역
 */
export function getRelationDisplayName(relation: PeriodRelation, locale: string): string {
  const names: Record<PeriodRelation, { ko: string; en: string }> = {
    generating:   { ko: '상생 — 활발한 에너지', en: 'Generating — Active energy' },
    generated_by: { ko: '피생 — 도움받는 에너지', en: 'Supported — Nurturing energy' },
    overcoming:   { ko: '상극 — 도전의 에너지', en: 'Overcoming — Challenging energy' },
    overcome_by:  { ko: '피극 — 시련의 에너지', en: 'Overcome — Testing energy' },
    same:         { ko: '비화 — 공명하는 에너지', en: 'Same — Resonating energy' },
  }
  return names[relation][locale === 'ko' ? 'ko' : 'en']
}
