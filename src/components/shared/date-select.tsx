/* ─────────────────────────────────────────
 * 날짜 선택 컴포넌트 — 3개 셀렉트 드롭다운
 * 비유: "돌림판 3개" — 년·월·일 각각 돌려서 맞추는 자물쇠
 *
 * 왜 type="date" 대신 이걸 쓰나?
 *   - 모바일에서 네이티브 date picker가 불편 (드래그 → 탭 → 드래그)
 *   - 셀렉트 드롭다운은 탭 한 번으로 선택 가능
 *   - 화면 잘림 문제 없음 (고정 너비 불필요)
 *   - 모든 브라우저/OS에서 동일한 UX
 *
 * 출력: 'YYYY-MM-DD' 문자열 (기존 코드와 100% 호환)
 * ───────────────────────────────────────── */

'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

interface DateSelectProps {
  value: string                        // 'YYYY-MM-DD' 또는 빈 문자열
  onChange: (value: string) => void
  /** 악센트 색상 클래스 — focus 테두리, ring 색상 (기본: mystic) */
  accentClass?: string
  /** 최소 년도 (기본: 1920) */
  minYear?: number
  /** 최대 년도 (기본: 올해) */
  maxYear?: number
}

/** 윤년 판별 — 2월 일수 계산에 필요 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/** 특정 년월의 마지막 날 계산 — 2월은 윤년 고려 */
function getDaysInMonth(year: number, month: number): number {
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month === 2 && isLeapYear(year)) return 29
  return daysPerMonth[month - 1] ?? 31
}

export default function DateSelect({
  value,
  onChange,
  accentClass = 'focus:border-mystic-500 focus:ring-mystic-500',
  minYear = 1920,
  maxYear,
}: DateSelectProps) {
  const t = useTranslations('birthForm')

  const currentYear = new Date().getFullYear()
  const max = maxYear ?? currentYear

  /** 현재 선택된 년/월/일 파싱 */
  const [selectedYear, selectedMonth, selectedDay] = useMemo(() => {
    if (!value) return ['', '', '']
    const parts = value.split('-')
    return [parts[0] ?? '', parts[1] ?? '', parts[2] ?? '']
  }, [value])

  /** 년도 옵션: 최근 → 과거 순서 (최근이 위에 오는 게 편함) */
  const yearOptions = useMemo(() => {
    const options: number[] = []
    for (let y = max; y >= minYear; y--) options.push(y)
    return options
  }, [max, minYear])

  /** 월 옵션: 1~12 */
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i + 1)
  }, [])

  /** 일 옵션: 선택된 년월에 따라 동적 계산 (2월 29일 등) */
  const dayOptions = useMemo(() => {
    const y = selectedYear ? parseInt(selectedYear) : currentYear
    const m = selectedMonth ? parseInt(selectedMonth) : 1
    const maxDay = getDaysInMonth(y, m)
    return Array.from({ length: maxDay }, (_, i) => i + 1)
  }, [selectedYear, selectedMonth, currentYear])

  /** 값 변경 시 YYYY-MM-DD 조합하여 상위에 전달 */
  function handleChange(part: 'year' | 'month' | 'day', val: string) {
    let y = selectedYear
    let m = selectedMonth
    let d = selectedDay

    if (part === 'year') y = val
    if (part === 'month') m = val
    if (part === 'day') d = val

    /** 3개 모두 선택되어야 유효한 날짜 */
    if (y && m && d) {
      /** 일 보정: 월 변경 시 기존 일이 초과할 수 있음 (예: 31 → 2월) */
      const maxDay = getDaysInMonth(parseInt(y), parseInt(m))
      const safeDay = Math.min(parseInt(d), maxDay)
      const paddedMonth = m.padStart(2, '0')
      const paddedDay = String(safeDay).padStart(2, '0')
      onChange(`${y}-${paddedMonth}-${paddedDay}`)
    } else {
      /** 부분 선택 상태 → 빈 문자열 (미완료 표시) */
      onChange('')
    }
  }

  /** 셀렉트 공통 스타일 — 터치 최적 48px 높이 */
  const selectBase = `h-12 w-full appearance-none rounded-xl border border-white/20 bg-white/5 px-2 text-sm text-slate-100 transition-colors outline-none ring-1 ring-transparent ${accentClass}`

  return (
    <div className="flex gap-2">
      {/* 년도 */}
      <div className="flex-[1.2]">
        <select
          value={selectedYear}
          onChange={(e) => handleChange('year', e.target.value)}
          className={selectBase}
          aria-label={t('year')}
        >
          <option value="" disabled className="bg-slate-900 text-slate-500">
            {t('year')}
          </option>
          {yearOptions.map((y) => (
            <option key={y} value={String(y)} className="bg-slate-900">
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* 월 */}
      <div className="flex-1">
        <select
          value={selectedMonth}
          onChange={(e) => handleChange('month', e.target.value)}
          className={selectBase}
          aria-label={t('month')}
        >
          <option value="" disabled className="bg-slate-900 text-slate-500">
            {t('month')}
          </option>
          {monthOptions.map((m) => (
            <option key={m} value={String(m).padStart(2, '0')} className="bg-slate-900">
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* 일 */}
      <div className="flex-1">
        <select
          value={selectedDay}
          onChange={(e) => handleChange('day', e.target.value)}
          className={selectBase}
          aria-label={t('day')}
        >
          <option value="" disabled className="bg-slate-900 text-slate-500">
            {t('day')}
          </option>
          {dayOptions.map((d) => (
            <option key={d} value={String(d).padStart(2, '0')} className="bg-slate-900">
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
