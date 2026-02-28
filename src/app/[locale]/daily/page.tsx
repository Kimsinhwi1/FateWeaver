/* ─────────────────────────────────────────
 * 오늘의 운세 페이지 — /[locale]/daily
 * 비유: 매일 아침 운세를 확인하는 "일일 운세 코너"
 * BirthInputForm을 재사용하여 생년월일 입력 → API 호출 → 결과 표시
 * ───────────────────────────────────────── */

'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import BirthInputForm from '@/components/shared/birth-input-form'
import FortuneResult from '@/components/daily/fortune-result'
import PremiumTeaser from '@/components/shared/premium-teaser'
import type { BirthInput } from '@/types/saju'

interface FortuneData {
  fortune: string
  luckyColor: string
  luckyNumber: number
  moodScore: number
  zodiacSign: string
  cached: boolean
}

export default function DailyPage() {
  const locale = useLocale()
  const t = useTranslations('daily')
  const tCommon = useTranslations('common')

  const [isLoading, setIsLoading] = useState(false)
  const [fortuneData, setFortuneData] = useState<FortuneData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (input: BirthInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/daily/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: input.birthDate,
          birthTime: input.birthTime,
          locale,
        }),
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data: FortuneData = await response.json()
      setFortuneData(data)
    } catch {
      setError(tCommon('error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 pt-24 pb-16">
      <div className="mx-auto max-w-4xl">
        {/* 페이지 헤더 */}
        <div className="mb-10 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-wide text-gold-400 sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-slate-400">
            {t('subtitle')}
          </p>
        </div>

        {/* 결과가 없을 때 → 입력 폼 표시 */}
        {!fortuneData && (
          <BirthInputForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel={t('checkFortune')}
            loadingLabel={t('loading')}
          />
        )}

        {/* 에러 표시 */}
        {error && (
          <p className="mt-6 text-center text-sm text-red-400">{error}</p>
        )}

        {/* 결과 표시 */}
        {fortuneData && (
          <div className="animate-fadeIn">
            <FortuneResult
              fortune={fortuneData.fortune}
              luckyColor={fortuneData.luckyColor}
              luckyNumber={fortuneData.luckyNumber}
              moodScore={fortuneData.moodScore}
              zodiacSign={fortuneData.zodiacSign}
            />

            {/* 프리미엄 티저 */}
            <PremiumTeaser />

            {/* 다시 보기 버튼 */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setFortuneData(null)}
                className="rounded-full border border-white/20 px-6 py-2 text-sm text-slate-400 transition-colors hover:border-mystic-400 hover:text-mystic-400"
              >
                {t('retry')}
              </button>
            </div>
          </div>
        )}

        {/* 면책 문구 */}
        <p className="mt-12 text-center text-xs text-slate-600">
          {tCommon('disclaimer')}
        </p>
      </div>
    </main>
  )
}
