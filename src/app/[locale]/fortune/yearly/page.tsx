/* ─────────────────────────────────────────
 * 연간 운세 페이지 — /[locale]/fortune/yearly
 * 비유: 올해의 "사계절 운세 가이드" — 사주 기반으로
 *       올해 테마 + 4분기 운세 + 종합 조언 표시
 *
 * 프리미엄 전용:
 *   비프리미엄 → PremiumGate 모달 표시
 *   프리미엄 → BirthInputForm → API → YearlyResult
 * ───────────────────────────────────────── */

'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import BirthInputForm from '@/components/shared/birth-input-form'
import YearlyResult from '@/components/fortune/yearly-result'
import PremiumGate from '@/components/shared/premium-gate'
import { useAuth } from '@/components/auth/auth-provider'
import type { BirthInput } from '@/types/saju'

interface YearlyQuarter {
  period: string
  forecast: string
}

interface YearlyData {
  theme: string
  quarters: YearlyQuarter[]
  advice: string
}

export default function YearlyPage() {
  const locale = useLocale()
  const t = useTranslations('yearly')
  const tCommon = useTranslations('common')
  const { isPremium } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<YearlyData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showGate, setShowGate] = useState(false)

  const handleSubmit = async (input: BirthInput) => {
    if (!isPremium) {
      setShowGate(true)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/fortune/yearly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: input.birthDate,
          birthTime: input.birthTime,
          locale,
        }),
      })

      if (!response.ok) throw new Error('API request failed')

      const data: YearlyData = await response.json()
      setResult(data)
    } catch {
      setError(tCommon('error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-950 px-4 pt-24 pb-16">
        <div className="mx-auto max-w-4xl">
          {/* 페이지 헤더 */}
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-medium text-gold-400">
              &#x2728; {t('premiumBadge')}
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-wide text-gold-400 sm:text-4xl">
              {t('title')}
            </h1>
            <p className="mt-3 text-slate-400">
              {t('subtitle')}
            </p>
          </div>

          {/* 입력 폼 */}
          {!result && (
            <BirthInputForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitLabel={t('analyze')}
              loadingLabel={t('loading')}
            />
          )}

          {/* 에러 */}
          {error && (
            <p className="mt-6 text-center text-sm text-red-400">{error}</p>
          )}

          {/* 결과 */}
          {result && (
            <div className="animate-fadeIn">
              <YearlyResult
                theme={result.theme}
                quarters={result.quarters}
                advice={result.advice}
              />

              <div className="mt-8 text-center">
                <button
                  onClick={() => setResult(null)}
                  className="rounded-full border border-white/20 px-6 py-2.5 text-sm text-slate-400 transition-colors hover:border-mystic-400 hover:text-mystic-400"
                >
                  {t('tryAgain')}
                </button>
              </div>
            </div>
          )}

          {/* 면책 문구 */}
          <p className="mt-12 text-center text-xs text-slate-600">
            {tCommon('disclaimer')}
          </p>

          {/* 프리미엄 게이트 모달 */}
          <PremiumGate
            isOpen={showGate}
            onClose={() => setShowGate(false)}
            type="premium_only"
            featureName={t('title')}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
