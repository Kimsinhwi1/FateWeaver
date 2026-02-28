/* ─────────────────────────────────────────
 * 타로 리딩 페이지
 * Phase 1 MVP의 핵심 — 생년월일 입력 → 3카드 뽑기 → AI 융합 해석
 * ───────────────────────────────────────── */

'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import BirthInputForm from '@/components/shared/birth-input-form'
import CardSpread from '@/components/tarot/card-spread'
import ReadingResult from '@/components/tarot/reading-result'
import type { BirthInput } from '@/types/saju'
import type { DrawnCard } from '@/types/tarot'

/** API 응답 타입 */
interface ReadingResponse {
  cards: DrawnCard[]
  interpretation: string
  readingId: string
}

export default function TarotPage() {
  const t = useTranslations('tarot')
  const tCommon = useTranslations('common')
  const locale = useLocale()

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ReadingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (birthData: BirthInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tarot/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...birthData,
          locale,
          spreadType: 'daily_3card',
        }),
      })

      if (!response.ok) {
        throw new Error('Reading failed')
      }

      const data: ReadingResponse = await response.json()
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

      <main className="min-h-screen px-4 pt-24 pb-16">
        {/* 제목 */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-3xl font-bold text-slate-50 sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-slate-400">
            {t('subtitle')}
          </p>
        </div>

        {/* 입력 폼 (결과가 없을 때만 표시) */}
        {!result && (
          <div className="mt-12">
            <BirthInputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mx-auto mt-8 max-w-md rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {/* 리딩 결과 */}
        {result && (
          <div className="mt-12 space-y-12">
            {/* 뽑힌 카드들 */}
            <CardSpread cards={result.cards} />

            {/* AI 해석 */}
            <ReadingResult interpretation={result.interpretation} />

            {/* 다시 뽑기 버튼 */}
            <div className="text-center">
              <button
                onClick={() => setResult(null)}
                className="rounded-full border border-white/20 px-6 py-2 text-sm text-slate-400 transition-colors hover:border-mystic-400 hover:text-mystic-400"
              >
                {t('startReading')}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
