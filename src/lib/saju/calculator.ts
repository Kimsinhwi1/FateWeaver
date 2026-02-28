/* ─────────────────────────────────────────
 * 사주팔자 계산 엔진 — manseryeok 라이브러리 기반
 * 비유: 생년월일시라는 "좌표"를 입력하면
 *       동양 철학의 "우주 지도"에서 당신의 위치를 찾아주는 GPS
 *
 * manseryeok: 한국천문연구원 음력 데이터 기반의 정확한 만세력 계산
 *   - 절기 기반 월주 계산으로 높은 정확도
 *   - 음력/양력 변환 지원
 *   - 기존 근사 계산(~85%) → 전문 라이브러리(~95%+)로 업그레이드
 * ───────────────────────────────────────── */

import {
  calculateFourPillars as manseryeokCalculate,
  type FourPillarsDetail,
} from 'manseryeok'
import type { FourPillars, ElementBalance, SajuData, Pillar, Element } from '@/types/saju'
import type { HeavenlyStem, EarthlyBranch } from '@/types/saju'
import { STEM_TO_ELEMENT, BRANCH_TO_ELEMENT } from './stems-branches'
import { findFavorableElement } from './elements'

/**
 * 한국어 오행 이름 → 영어 Element 타입 변환
 * 비유: 한국어 메뉴판을 영어 메뉴판으로 번역하는 것
 */
const KOREAN_ELEMENT_MAP: Record<string, Element> = {
  '목': 'wood',
  '화': 'fire',
  '토': 'earth',
  '금': 'metal',
  '수': 'water',
}

/**
 * manseryeok의 한자(壬申) 문자열을 우리 Pillar 타입으로 변환
 * 비유: 외국 여권의 정보를 우리 시스템 형식으로 옮겨 적는 것
 *
 * manseryeok은 '壬申' 같은 2글자 한자 문자열을 반환하는데,
 * 첫 글자가 천간(하늘), 둘째 글자가 지지(땅)이다.
 */
function hanjaStringToPillar(
  hanjaStr: string,
  elementInfo: { stem: string; branch: string }
): Pillar {
  const stem = hanjaStr[0] as HeavenlyStem
  const branch = hanjaStr[1] as EarthlyBranch

  return {
    stem,
    branch,
    element: KOREAN_ELEMENT_MAP[elementInfo.stem] ?? STEM_TO_ELEMENT[stem],
  }
}

/**
 * manseryeok 결과로부터 오행 분포를 계산한다
 * 비유: 사주의 8글자(천간4 + 지지4)를 오행별로 세는 "인구조사"
 *
 * 각 기둥에는 천간과 지지가 하나씩 있으니, 총 8개의 오행을 센다.
 * (시주가 없으면 6개만 센다)
 */
function calculateElementBalance(fourPillars: FourPillars): ElementBalance {
  const balance: ElementBalance = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour]

  for (const pillar of pillars) {
    if (!pillar) continue
    // 천간의 오행 — 하늘 글자가 속한 원소
    balance[STEM_TO_ELEMENT[pillar.stem]]++
    // 지지의 오행 — 땅 글자가 속한 원소
    balance[BRANCH_TO_ELEMENT[pillar.branch]]++
  }

  return balance
}

/**
 * 메인 함수: 생년월일시로 사주 데이터를 계산한다
 * 비유: 좌표(생년월일시)를 입력하면 우주 지도(사주)를 반환하는 GPS
 *
 * manseryeok 라이브러리가 정확한 만세력 기반으로 사주를 계산하고,
 * 우리 시스템의 형식(중국 한자 + 영문 오행)으로 변환하여 반환한다.
 */
export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour?: number
): SajuData {
  // manseryeok으로 정밀 계산
  // 시간을 모르면 정오(12시)로 계산하되, 시주는 결과에서 제외한다
  const result: FourPillarsDetail = manseryeokCalculate({
    year,
    month,
    day,
    hour: hour ?? 12,
    minute: 0,
  })

  // manseryeok 결과를 우리 타입으로 변환
  const yearPillar = hanjaStringToPillar(result.yearHanja, result.yearElement)
  const monthPillar = hanjaStringToPillar(result.monthHanja, result.monthElement)
  const dayPillar = hanjaStringToPillar(result.dayHanja, result.dayElement)

  // 시주는 시간을 알 때만 유효 — 모르면 null
  const hourPillar = hour !== undefined
    ? hanjaStringToPillar(result.hourHanja, result.hourElement)
    : null

  const fourPillars: FourPillars = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  }

  const elementBalance = calculateElementBalance(fourPillars)
  const favorableElement = findFavorableElement(elementBalance)

  return {
    fourPillars,
    elementBalance,
    dayMaster: `${dayPillar.stem} (${dayPillar.element})`,
    favorableElement,
  }
}
