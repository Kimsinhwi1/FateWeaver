/* ─────────────────────────────────────────
 * 날짜/시간 유틸리티
 * 비유: 생년월일을 다양한 형태로 변환하는 "번역기"
 * ───────────────────────────────────────── */

import type { ZodiacSign } from '@/types/saju'

/**
 * 생년월일로 별자리를 계산한다
 * 비유: 태양이 어떤 별자리 구역에 있었는지 찾는 것
 */
export function getZodiacSign(month: number, day: number): ZodiacSign {
  // 각 별자리의 시작일 (월, 일)
  const zodiacDates: { sign: ZodiacSign; startMonth: number; startDay: number }[] = [
    { sign: 'capricorn', startMonth: 1, startDay: 1 },
    { sign: 'aquarius', startMonth: 1, startDay: 20 },
    { sign: 'pisces', startMonth: 2, startDay: 19 },
    { sign: 'aries', startMonth: 3, startDay: 21 },
    { sign: 'taurus', startMonth: 4, startDay: 20 },
    { sign: 'gemini', startMonth: 5, startDay: 21 },
    { sign: 'cancer', startMonth: 6, startDay: 21 },
    { sign: 'leo', startMonth: 7, startDay: 23 },
    { sign: 'virgo', startMonth: 8, startDay: 23 },
    { sign: 'libra', startMonth: 9, startDay: 23 },
    { sign: 'scorpio', startMonth: 10, startDay: 23 },
    { sign: 'sagittarius', startMonth: 11, startDay: 22 },
    { sign: 'capricorn', startMonth: 12, startDay: 22 },
  ]

  // 뒤에서부터 확인 — 날짜가 해당 별자리 시작일 이후인 첫 번째를 반환
  for (let i = zodiacDates.length - 1; i >= 0; i--) {
    const { sign, startMonth, startDay } = zodiacDates[i]
    if (month > startMonth || (month === startMonth && day >= startDay)) {
      return sign
    }
  }

  return 'capricorn'
}

/**
 * "YYYY-MM-DD" 문자열을 파싱한다
 */
export function parseBirthDate(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number)
  return { year, month, day }
}

/**
 * "HH:MM" 문자열을 시(hour)로 파싱한다
 */
export function parseBirthTime(timeStr: string): number {
  const [hour] = timeStr.split(':').map(Number)
  return hour
}
