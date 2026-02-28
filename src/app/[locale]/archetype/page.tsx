/* ─────────────────────────────────────────
 * 원형 매칭 페이지 — /[locale]/archetype
 * 비유: "성격 거울" — 사주를 입력하면 12 융 원형 중
 *       당신의 원형을 비춰 보여주는 마법 거울
 *
 * 무료 + 무제한: 바이럴 확산 목적으로 사용량 제한 없음
 * AI 호출 없음: 결정론적 매칭 (빠르고 비용 없음)
 * ───────────────────────────────────────── */

'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import BirthInputForm from '@/components/shared/birth-input-form'
import ArchetypeResultCard from '@/components/archetype/archetype-result'
import { calculateSaju } from '@/lib/saju/calculator'
import { matchArchetype, type ArchetypeResult } from '@/lib/archetype/matcher'
import { parseBirthDate, parseBirthTime } from '@/lib/utils/date'
import type { BirthInput } from '@/types/saju'

export default function ArchetypePage() {
  const locale = useLocale()
  const t = useTranslations('archetype')
  const tCommon = useTranslations('common')

  const [result, setResult] = useState<ArchetypeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  /** 폼 제출 → 사주 계산 → 원형 매칭 (모두 클라이언트 사이드) */
  function handleSubmit(input: BirthInput) {
    setError(null)

    try {
      /* 사주 계산 — 서버 호출 없이 클라이언트에서 직접 계산 */
      const { year, month, day } = parseBirthDate(input.birthDate)
      const hour = input.birthTime ? parseBirthTime(input.birthTime) : undefined
      const sajuData = calculateSaju(year, month, day, hour)

      /* 원형 매칭 — 결정론적 로직 */
      const archetypeResult = matchArchetype(sajuData)
      setResult(archetypeResult)
    } catch {
      setError(tCommon('error'))
    }
  }

  /** 다시 해보기 */
  function handleRetry() {
    setResult(null)
    setError(null)
  }

  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-3xl px-4 pt-24 pb-16">
        {/* 제목 */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 font-heading text-3xl font-bold text-slate-50 sm:text-4xl">
            {t('pageTitle')}
          </h1>
          <p className="text-sm text-slate-400 sm:text-base">
            {t('pageSubtitle')}
          </p>
          {/* 무료 뱃지 */}
          <span className="mt-3 inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
            {t('freeBadge')}
          </span>
        </div>

        {/* 입력 폼 또는 결과 */}
        {!result ? (
          <BirthInputForm
            onSubmit={handleSubmit}
            submitLabel={t('findArchetype')}
          />
        ) : (
          <>
            <ArchetypeResultCard result={result} />

            {/* 다시 해보기 버튼 */}
            <div className="mt-6 text-center">
              <button
                onClick={handleRetry}
                className="flex mx-auto min-h-[44px] items-center text-sm text-slate-500 transition-colors hover:text-mystic-400"
              >
                {t('tryAgain')}
              </button>
            </div>
          </>
        )}

        {/* 에러 */}
        {error && (
          <p className="mt-4 text-center text-sm text-red-400">{error}</p>
        )}

        {/* 면책 조항 */}
        <p className="mt-12 text-center text-xs text-slate-600">
          {tCommon('disclaimer')}
        </p>
      </main>
      <Footer />
    </>
  )
}
