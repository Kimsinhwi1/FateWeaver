/* ─────────────────────────────────────────
 * 생년월일시 입력 폼
 * 비유: 운세를 보기 위한 "접수 양식" — Auth 없이도 사용 가능
 * ───────────────────────────────────────── */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { BirthInput } from '@/types/saju'

interface BirthInputFormProps {
  onSubmit: (data: BirthInput) => void
  isLoading?: boolean
}

export default function BirthInputForm({ onSubmit, isLoading }: BirthInputFormProps) {
  const t = useTranslations('birthForm')
  const tTarot = useTranslations('tarot')

  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | undefined>(undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!birthDate) return

    onSubmit({
      birthDate,
      birthTime: birthTime || null,
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

      {/* 태어난 시간 (선택) */}
      <div>
        <label htmlFor="birthTime" className="mb-2 block text-sm font-medium text-slate-300">
          {t('birthTime')}{' '}
          <span className="text-slate-500">{t('birthTimeOptional')}</span>
        </label>
        <input
          id="birthTime"
          type="time"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-slate-100 transition-colors focus:border-mystic-500 focus:outline-none focus:ring-1 focus:ring-mystic-500"
        />
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
        {isLoading ? tTarot('loading') : tTarot('startReading')}
      </button>
    </form>
  )
}
