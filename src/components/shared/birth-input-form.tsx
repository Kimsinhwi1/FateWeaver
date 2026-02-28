/* ─────────────────────────────────────────
 * 생년월일시 입력 폼
 * 비유: 운세를 보기 위한 "접수 양식" — Auth 없이도 사용 가능
 *
 * 모바일 최적화:
 *   - type="date"/type="time"으로 네이티브 OS 피커 활용
 *   - 최소 터치 영역 48px (Apple HIG 44px 이상 충족)
 *   - active:scale 피드백으로 터치 반응성 향상
 *
 * "시간 모름" 기능:
 *   태어난 시간을 모르는 사용자도 운세를 볼 수 있다.
 *   시간을 모르면 3기둥(년·월·일)만으로 사주를 해석하고,
 *   AI가 이를 감안한 해석을 제공한다.
 * ───────────────────────────────────────── */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import DateSelect from '@/components/shared/date-select'
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
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-5">
      {/* 생년월일 — 3개 셀렉트 드롭다운 (모바일 최적) */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          {t('birthDate')}
        </label>
        <DateSelect
          value={birthDate}
          onChange={setBirthDate}
        />
      </div>

      {/* 태어난 시간 (선택) + 시간 모름 토글 */}
      <div>
        <label htmlFor="birthTime" className="mb-2 block text-sm font-medium text-slate-300">
          {t('birthTime')}{' '}
          <span className="text-slate-500">{t('birthTimeOptional')}</span>
        </label>

        <div className="flex gap-2">
          {/* 시간 입력 — 네이티브 time picker */}
          <input
            id="birthTime"
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            disabled={timeUnknown}
            className={`h-12 min-w-0 flex-1 rounded-xl border bg-white/5 px-3 text-base text-slate-100 transition-colors focus:border-mystic-500 focus:outline-none focus:ring-1 focus:ring-mystic-500 sm:px-4 ${
              timeUnknown
                ? 'cursor-not-allowed border-white/10 opacity-40'
                : 'border-white/20'
            }`}
          />

          {/* "시간 모름" 토글 버튼 — 최소 48px 높이 */}
          <button
            type="button"
            onClick={handleTimeUnknownToggle}
            className={`flex h-12 shrink-0 items-center whitespace-nowrap rounded-xl border px-3 text-sm transition-all active:scale-95 sm:px-4 ${
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

      {/* 성별 (선택) — 큰 터치 영역 */}
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
              className={`flex h-12 flex-1 items-center justify-center rounded-xl border text-sm transition-all active:scale-95 ${
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

      {/* 제출 버튼 — 56px 높이로 모바일 터치 편의성 극대화 */}
      <button
        type="submit"
        disabled={!birthDate || isLoading}
        className="h-14 w-full rounded-full bg-mystic-600 text-base font-medium text-white shadow-lg shadow-mystic-600/25 transition-all hover:bg-mystic-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? (loadingLabel || tTarot('loading'))
          : (submitLabel || tTarot('startReading'))}
      </button>
    </form>
  )
}
