/* ─────────────────────────────────────────
 * 생년월일시 입력 폼
 * 비유: 운세를 보기 위한 "접수 양식" — Auth 없이도 사용 가능
 *
 * "시간 모름" 기능:
 *   태어난 시간을 모르는 사용자도 운세를 볼 수 있다.
 *   시간을 모르면 3기둥(년·월·일)만으로 사주를 해석하고,
 *   AI가 이를 감안한 해석을 제공한다.
 * ───────────────────────────────────────── */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { BirthInput } from '@/types/saju'

interface BirthInputFormProps {
  onSubmit: (data: BirthInput) => void
  isLoading?: boolean
  /** 제출 버튼 텍스트 커스터마이징 — 타로/운세 페이지별 다른 문구 */
  submitLabel?: string
  loadingLabel?: string
}

export default function BirthInputForm({ onSubmit, isLoading, submitLabel, loadingLabel }: BirthInputFormProps) {
  const t = useTranslations('birthForm')
  const tTarot = useTranslations('tarot')

  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | undefined>(undefined)
  const [timeUnknown, setTimeUnknown] = useState(false)

  const handleTimeUnknownToggle = () => {
    setTimeUnknown((prev) => {
      if (!prev) setBirthTime('')  // "모름" 켜면 시간 초기화
      return !prev
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!birthDate) return

    onSubmit({
      birthDate,
      birthTime: timeUnknown ? null : (birthTime || null),
      birthTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      gender,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-6">
      {/* 생년월일 */}
      <div>
        <label htmlFor="birthDate" className="mb-2 block text-sm font-medium text-slate-300">
          {t('birthDate')}
        </label>
        <input
          id="birthDate"
          type="date"
          required
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-slate-100 transition-colors focus:border-mystic-500 focus:outline-none focus:ring-1 focus:ring-mystic-500"
        />
      </div>

      {/* 태어난 시간 (선택) + 시간 모름 토글 */}
      <div>
        <label htmlFor="birthTime" className="mb-2 block text-sm font-medium text-slate-300">
          {t('birthTime')}{' '}
          <span className="text-slate-500">{t('birthTimeOptional')}</span>
        </label>

        <div className="flex gap-2">
          {/* 시간 입력 — "모름" 상태면 비활성화 */}
          <input
            id="birthTime"
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            disabled={timeUnknown}
            className={`flex-1 rounded-lg border bg-white/5 px-4 py-3 text-slate-100 transition-colors focus:border-mystic-500 focus:outline-none focus:ring-1 focus:ring-mystic-500 ${
              timeUnknown
                ? 'cursor-not-allowed border-white/10 opacity-40'
                : 'border-white/20'
            }`}
          />

          {/* "시간 모름" 토글 버튼 */}
          <button
            type="button"
            onClick={handleTimeUnknownToggle}
            className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition-all ${
              timeUnknown
                ? 'border-mystic-500 bg-mystic-600/20 text-mystic-300'
                : 'border-white/20 bg-white/5 text-slate-400 hover:border-white/30'
            }`}
          >
            {t('birthTimeUnknown')}
          </button>
        </div>

        {/* 시간 모름 안내 메시지 */}
        {timeUnknown && (
          <p className="mt-2 text-xs text-slate-500">
            {t('birthTimeUnknownDesc')}
          </p>
        )}
      </div>

      {/* 성별 (선택) */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          {t('gender')}
        </label>
        <div className="flex gap-3">
          {([
            { value: 'male' as const, label: t('male') },
            { value: 'female' as const, label: t('female') },
          ]).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setGender(gender === option.value ? undefined : option.value)}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-all ${
                gender === option.value
                  ? 'border-mystic-500 bg-mystic-600/20 text-mystic-300'
                  : 'border-white/20 bg-white/5 text-slate-400 hover:border-white/30'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={!birthDate || isLoading}
        className="w-full rounded-full bg-mystic-600 py-3 text-base font-medium text-white shadow-lg shadow-mystic-600/25 transition-all hover:bg-mystic-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? (loadingLabel || tTarot('loading'))
          : (submitLabel || tTarot('startReading'))}
      </button>
    </form>
  )
}
