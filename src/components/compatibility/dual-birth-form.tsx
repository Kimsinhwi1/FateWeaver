/* ─────────────────────────────────────────
 * 궁합용 이중 생년월일 입력 폼
 * 비유: 커플 체크인 카운터 — 두 사람의 정보를 나란히 접수
 *
 * BirthInputForm을 재사용하지 않고 독립 구현한 이유:
 *   - 2인 폼에서는 성별/timezone이 불필요 (궁합은 순수 사주 비교)
 *   - 레이아웃이 2열 나란히 → 단일 폼과 구조가 다름
 *   - 더 간결한 UI가 필요 (입력 필드 수 최소화)
 * ───────────────────────────────────────── */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export interface DualBirthInput {
  person1: { birthDate: string; birthTime: string | null }
  person2: { birthDate: string; birthTime: string | null }
}

interface DualBirthFormProps {
  onSubmit: (data: DualBirthInput) => void
  isLoading?: boolean
}

export default function DualBirthForm({ onSubmit, isLoading }: DualBirthFormProps) {
  const t = useTranslations('compatibility')

  const [p1Date, setP1Date] = useState('')
  const [p1Time, setP1Time] = useState('')
  const [p1TimeUnknown, setP1TimeUnknown] = useState(false)

  const [p2Date, setP2Date] = useState('')
  const [p2Time, setP2Time] = useState('')
  const [p2TimeUnknown, setP2TimeUnknown] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!p1Date || !p2Date) return

    onSubmit({
      person1: {
        birthDate: p1Date,
        birthTime: p1TimeUnknown ? null : (p1Time || null),
      },
      person2: {
        birthDate: p2Date,
        birthTime: p2TimeUnknown ? null : (p2Time || null),
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl space-y-6">
      {/* 두 사람 입력 — 모바일: 세로 스택, 데스크탑: 가로 나란히 */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Person 1 */}
        <fieldset className="space-y-4 rounded-2xl border border-mystic-500/20 bg-mystic-600/5 p-5">
          <legend className="px-2 text-sm font-semibold text-mystic-400">
            {t('person1Label')}
          </legend>

          {/* 생년월일 */}
          <div>
            <label htmlFor="p1-date" className="mb-1.5 block text-xs font-medium text-slate-400">
              {t('birthDate')}
            </label>
            <input
              id="p1-date"
              type="date"
              required
              value={p1Date}
              onChange={(e) => setP1Date(e.target.value)}
              max={today}
              min="1920-01-01"
              className="h-11 w-full rounded-xl border border-white/20 bg-white/5 px-3 text-sm text-slate-100 transition-colors focus:border-mystic-500 focus:outline-none focus:ring-1 focus:ring-mystic-500"
            />
          </div>

          {/* 시간 */}
          <div>
            <label htmlFor="p1-time" className="mb-1.5 block text-xs font-medium text-slate-400">
              {t('birthTime')}
            </label>
            <div className="flex gap-2">
              <input
                id="p1-time"
                type="time"
                value={p1Time}
                onChange={(e) => setP1Time(e.target.value)}
                disabled={p1TimeUnknown}
                className={`h-11 flex-1 rounded-xl border bg-white/5 px-3 text-sm text-slate-100 transition-colors focus:border-mystic-500 focus:outline-none focus:ring-1 focus:ring-mystic-500 ${
                  p1TimeUnknown ? 'cursor-not-allowed border-white/10 opacity-40' : 'border-white/20'
                }`}
              />
              <button
                type="button"
                onClick={() => { setP1TimeUnknown(!p1TimeUnknown); if (!p1TimeUnknown) setP1Time('') }}
                className={`flex h-11 items-center whitespace-nowrap rounded-xl border px-3 text-xs transition-all active:scale-95 ${
                  p1TimeUnknown
                    ? 'border-mystic-500 bg-mystic-600/20 text-mystic-300'
                    : 'border-white/20 bg-white/5 text-slate-400 hover:border-white/30'
                }`}
              >
                {t('timeUnknown')}
              </button>
            </div>
          </div>
        </fieldset>

        {/* Person 2 */}
        <fieldset className="space-y-4 rounded-2xl border border-gold-500/20 bg-gold-500/5 p-5">
          <legend className="px-2 text-sm font-semibold text-gold-400">
            {t('person2Label')}
          </legend>

          <div>
            <label htmlFor="p2-date" className="mb-1.5 block text-xs font-medium text-slate-400">
              {t('birthDate')}
            </label>
            <input
              id="p2-date"
              type="date"
              required
              value={p2Date}
              onChange={(e) => setP2Date(e.target.value)}
              max={today}
              min="1920-01-01"
              className="h-11 w-full rounded-xl border border-white/20 bg-white/5 px-3 text-sm text-slate-100 transition-colors focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>

          <div>
            <label htmlFor="p2-time" className="mb-1.5 block text-xs font-medium text-slate-400">
              {t('birthTime')}
            </label>
            <div className="flex gap-2">
              <input
                id="p2-time"
                type="time"
                value={p2Time}
                onChange={(e) => setP2Time(e.target.value)}
                disabled={p2TimeUnknown}
                className={`h-11 flex-1 rounded-xl border bg-white/5 px-3 text-sm text-slate-100 transition-colors focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${
                  p2TimeUnknown ? 'cursor-not-allowed border-white/10 opacity-40' : 'border-white/20'
                }`}
              />
              <button
                type="button"
                onClick={() => { setP2TimeUnknown(!p2TimeUnknown); if (!p2TimeUnknown) setP2Time('') }}
                className={`flex h-11 items-center whitespace-nowrap rounded-xl border px-3 text-xs transition-all active:scale-95 ${
                  p2TimeUnknown
                    ? 'border-gold-500 bg-gold-500/20 text-gold-300'
                    : 'border-white/20 bg-white/5 text-slate-400 hover:border-white/30'
                }`}
              >
                {t('timeUnknown')}
              </button>
            </div>
          </div>
        </fieldset>
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={!p1Date || !p2Date || isLoading}
        className="mx-auto flex h-14 w-full max-w-md items-center justify-center rounded-full bg-gradient-to-r from-mystic-600 to-gold-600 text-base font-medium text-white shadow-lg shadow-mystic-600/20 transition-all hover:from-mystic-500 hover:to-gold-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? t('analyzing') : t('analyze')}
      </button>
    </form>
  )
}
