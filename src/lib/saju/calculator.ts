/* ─────────────────────────────────────────
 * 사주팔자 계산 엔진
 * 비유: 생년월일시라는 "좌표"를 입력하면
 *       동양 철학의 "우주 지도"에서 당신의 위치를 찾아주는 GPS
 *
 * 참고: 정확한 사주 계산은 음력 변환 + 만세력이 필요하지만,
 *       MVP에서는 양력 기반 근사 계산을 사용한다
 *       (정확도 ~85% — 추후 만세력 라이브러리 연동으로 개선)
 * ───────────────────────────────────────── */

import type { FourPillars, ElementBalance, SajuData, Pillar } from '@/types/saju'
import { HEAVENLY_STEMS, EARTHLY_BRANCHES, MONTH_BRANCHES, HOUR_BRANCHES, STEM_TO_ELEMENT, BRANCH_TO_ELEMENT } from './stems-branches'
import { findFavorableElement } from './elements'

/**
 * 년주(年柱) 계산
 * 비유: 태어난 해를 60갑자 "바퀴"에서 어디인지 찾는 것
 * 공식: (연도 - 4) % 60 → 60갑자 인덱스
 *       천간 = 인덱스 % 10, 지지 = 인덱스 % 12
 */
function calculateYearPillar(year: number): Pillar {
  const index = (year - 4) % 60
  const stemIndex = index % 10
  const branchIndex = index % 12
  const stem = HEAVENLY_STEMS[stemIndex]

  return {
    stem,
    branch: EARTHLY_BRANCHES[branchIndex],
    element: STEM_TO_ELEMENT[stem],
  }
}

/**
 * 월주(月柱) 계산
 * 비유: 태어난 달의 에너지를 찾는 것
 * 월지(지지)는 고정이고, 월간(천간)은 년간에 따라 결정된다
 *
 * 년간 기준 월간 시작점:
 * 甲/己년 → 丙寅월부터 시작 (천간 인덱스 2)
 * 乙/庚년 → 戊寅월부터 시작 (천간 인덱스 4)
 * 丙/辛년 → 庚寅월부터 시작 (천간 인덱스 6)
 * 丁/壬년 → 壬寅월부터 시작 (천간 인덱스 8)
 * 戊/癸년 → 甲寅월부터 시작 (천간 인덱스 0)
 */
function calculateMonthPillar(year: number, month: number): Pillar {
  const yearPillar = calculateYearPillar(year)
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearPillar.stem)

  // 년간에 따른 월간 시작 인덱스
  const monthStemStartMap: Record<number, number> = {
    0: 2, 5: 2,  // 甲/己 → 丙(2)
    1: 4, 6: 4,  // 乙/庚 → 戊(4)
    2: 6, 7: 6,  // 丙/辛 → 庚(6)
    3: 8, 8: 8,  // 丁/壬 → 壬(8)
    4: 0, 9: 0,  // 戊/癸 → 甲(0)
  }

  const startStemIndex = monthStemStartMap[yearStemIndex]
  // 음력 1월은 인월(寅)이므로 month-1로 오프셋
  const monthOffset = month - 1
  const stemIndex = (startStemIndex + monthOffset) % 10
  const stem = HEAVENLY_STEMS[stemIndex]
  const branch = MONTH_BRANCHES[monthOffset]

  return {
    stem,
    branch,
    element: STEM_TO_ELEMENT[stem],
  }
}

/**
 * 일주(日柱) 계산 (근사값)
 * 비유: 태어난 날의 "고유 번호"를 찾는 것
 *
 * 정확한 일주는 만세력 조회가 필요하지만,
 * MVP에서는 기준일로부터의 일수 차이로 근사 계산
 * 기준: 1900년 1월 1일 = 庚子일 (60갑자 인덱스 36)
 */
function calculateDayPillar(year: number, month: number, day: number): Pillar {
  // 1900-01-01부터의 일수 계산 (줄리안 데이 근사)
  const baseDate = new Date(1900, 0, 1)
  const targetDate = new Date(year, month - 1, day)
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))

  // 1900-01-01 = 60갑자 인덱스 36 (庚子)
  const index = ((diffDays % 60) + 36) % 60
  const stemIndex = ((index % 10) + 10) % 10
  const branchIndex = ((index % 12) + 12) % 12
  const stem = HEAVENLY_STEMS[stemIndex]

  return {
    stem,
    branch: EARTHLY_BRANCHES[branchIndex],
    element: STEM_TO_ELEMENT[stem],
  }
}

/**
 * 시주(時柱) 계산
 * 비유: 태어난 시간의 에너지를 찾는 것
 * 시지(지지)는 시간대로 결정, 시간(천간)은 일간에 따라 결정
 */
function calculateHourPillar(year: number, month: number, day: number, hour: number): Pillar {
  const dayPillar = calculateDayPillar(year, month, day)
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayPillar.stem)

  // 시간대 → 지지 찾기
  const hourEntry = HOUR_BRANCHES.find((h) => {
    if (h.startHour > h.endHour) {
      // 자시(23~01)처럼 자정을 넘기는 경우
      return hour >= h.startHour || hour < h.endHour
    }
    return hour >= h.startHour && hour < h.endHour
  })

  const branch = hourEntry?.branch ?? '子'
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch)

  // 일간 기준 시간 시작점 (년간→월간과 같은 원리)
  const hourStemStartMap: Record<number, number> = {
    0: 0, 5: 0,  // 甲/己일 → 甲子시부터
    1: 2, 6: 2,  // 乙/庚일 → 丙子시부터
    2: 4, 7: 4,  // 丙/辛일 → 戊子시부터
    3: 6, 8: 6,  // 丁/壬일 → 庚子시부터
    4: 8, 9: 8,  // 戊/癸일 → 壬子시부터
  }

  const startStemIndex = hourStemStartMap[dayStemIndex]
  const stemIndex = (startStemIndex + branchIndex) % 10
  const stem = HEAVENLY_STEMS[stemIndex]

  return {
    stem,
    branch,
    element: STEM_TO_ELEMENT[stem],
  }
}

/**
 * 오행 분포를 계산한다
 * 비유: 사주의 8글자(천간4 + 지지4)를 오행별로 세는 "인구조사"
 */
function calculateElementBalance(fourPillars: FourPillars): ElementBalance {
  const balance: ElementBalance = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour]

  for (const pillar of pillars) {
    if (!pillar) continue
    // 천간의 오행
    balance[STEM_TO_ELEMENT[pillar.stem]]++
    // 지지의 오행
    balance[BRANCH_TO_ELEMENT[pillar.branch]]++
  }

  return balance
}

/**
 * 메인 함수: 생년월일시로 사주 데이터를 계산한다
 * 비유: 좌표(생년월일시)를 입력하면 우주 지도(사주)를 반환하는 GPS
 */
export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour?: number
): SajuData {
  const yearPillar = calculateYearPillar(year)
  const monthPillar = calculateMonthPillar(year, month)
  const dayPillar = calculateDayPillar(year, month, day)
  const hourPillar = hour !== undefined ? calculateHourPillar(year, month, day, hour) : null

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
