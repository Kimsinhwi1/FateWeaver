/* ─────────────────────────────────────────
 * 궁합 분석 페이지 — /[locale]/compatibility
 * 비유: 커플 전용 "운세의 방" — 두 사람의 사주를 비교하여 궁합 분석
 *
 * 프리미엄 전용 기능:
 *   비프리미엄 유저 → PremiumGate 모달 표시
 *   프리미엄 유저 → DualBirthForm → API 호출 → CompatibilityResult
 * ───────────────────────────────────────── */

'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import DualBirthForm from '@/components/compatibility/dual-birth-form'
import CompatibilityResult from '@/components/compatibility/compatibility-result'
import PremiumGate from '@/components/shared/premium-gate'
import { useAuth } from '@/components/auth/auth-provider'
import type { DualBirthInput } from '@/components/compatibility/dual-birth-form'
import type { Element } from '@/types/saju'

/** API 응답 타입 */
interface CompatibilityData {
  score: number
  dayMasterRelation: string
  person1Element: Element
  person2Element: Element
  elementSynergy: number
  strengths: string[]
  challenges: string[]
  interpretation: string
}

export default function CompatibilityPage() {
  const locale = useLocale()
  const t = useTranslations('compatibility')
  const tCommon = useTranslations('common')
  const { isPremium } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CompatibilityData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showGate, setShowGate] = useState(false)

  const handleSubmit = async (input: DualBirthInput) => {
    /* 프리미엄 체크 — 무료 유저는 게이트 */
    if (!isPremium) {
      setShowGate(true)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1: input.person1,
          person2: input.person2,
          locale,
        }),
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data: CompatibilityData = await response.json()
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

          {/* 결과가 없을 때 → 입력 폼 */}
          {!result && (
            <DualBirthForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          )}

          {/* 에러 */}
          {error && (
            <p className="mt-6 text-center text-sm text-red-400">{error}</p>
          )}

          {/* 결과 표시 */}
          {result && (
            <div className="animate-fadeIn">
              <CompatibilityResult
                score={result.score}
                dayMasterRelation={result.dayMasterRelation}
                person1Element={result.person1Element}
                person2Element={result.person2Element}
                elementSynergy={result.elementSynergy}
                strengths={result.strengths}
                challenges={result.challenges}
                interpretation={result.interpretation}
              />

              {/* 다시 분석 버튼 */}
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
