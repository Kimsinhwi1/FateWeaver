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
import ShareCard from '@/components/shared/share-card'
import PremiumGate from '@/components/shared/premium-gate'
import { useAuth } from '@/components/auth/auth-provider'
import { canUseFeature, incrementUsage, getRemainingUses } from '@/lib/usage/limit'
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
  const { isPremium } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ReadingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [showGate, setShowGate] = useState(false)

  const handleSubmit = async (birthData: BirthInput) => {
    // 사용 횟수 확인 — "시식 카운터 체크"
    if (!canUseFeature('tarot', isPremium)) {
      setShowGate(true)
      return
    }

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

      // 성공한 리딩만 사용 횟수에 카운트
      incrementUsage('tarot')
    } catch {
      setError(tCommon('error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setResult(null)
    setError(null)
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

        {/* 남은 무료 횟수 안내 */}
        {!isPremium && !result && !isLoading && (
          <p className="mt-4 text-center text-xs text-slate-500">
            {getRemainingUses('tarot', isPremium) > 0
              ? `${getRemainingUses('tarot', isPremium)}/${1} remaining today`
              : ''
            }
          </p>
        )}

        {/* 입력 폼 (결과가 없고 로딩 중이 아닐 때만 표시) */}
        {!result && !isLoading && (
          <div className="mt-8">
            <BirthInputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        )}

        {/* 로딩 상태 — 카드를 뽑고 있는 동안 */}
        {isLoading && (
          <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-6">
            {/* 로딩 카드 3장 */}
            <div className="flex gap-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse-glow h-48 w-28 rounded-xl border-2 border-mystic-700/50 bg-gradient-to-b from-mystic-900 to-slate-900 sm:h-56 sm:w-32"
                  style={{ animationDelay: `${i * 300}ms` }}
                />
              ))}
            </div>
            <p className="text-sm text-mystic-400">{t('loading')}</p>
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
            {/* 뽑힌 카드들 — 순서대로 뒤집힘 */}
            <CardSpread cards={result.cards} />

            {/* AI 해석 — 카드 뒤집기 후 페이드인 */}
            <div className="animate-fade-in-up" style={{ animationDelay: '1.4s', opacity: 0 }}>
              <ReadingResult interpretation={result.interpretation} />
            </div>

            {/* 하단 액션 버튼들 */}
            <div className="animate-fade-in-up flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4" style={{ animationDelay: '2s', opacity: 0 }}>
              {/* 다시 뽑기 */}
              <button
                onClick={handleRetry}
                className="rounded-full border border-white/20 px-6 py-2.5 text-sm text-slate-400 transition-colors hover:border-mystic-400 hover:text-mystic-400"
              >
                {t('retry')}
              </button>

              {/* 결과 공유 */}
              <button
                onClick={() => setShowShare(true)}
                className="rounded-full border border-gold-500/40 px-6 py-2.5 text-sm text-gold-400 transition-colors hover:border-gold-400 hover:bg-gold-500/10"
              >
                {t('share')}
              </button>
            </div>
          </div>
        )}

        {/* 공유 카드 모달 */}
        {showShare && result && (
          <ShareCard
            cards={result.cards}
            interpretation={result.interpretation}
            onClose={() => setShowShare(false)}
          />
        )}

        {/* 프리미엄 게이트 모달 */}
        <PremiumGate
          isOpen={showGate}
          onClose={() => setShowGate(false)}
          type="usage_limit"
        />
      </main>

      <Footer />
    </>
  )
}
