/* ─────────────────────────────────────────
 * 리딩 히스토리 페이지
 * 비유: "운세 일기장" — 과거 리딩을 날짜순으로 되돌아본다
 *
 * 로그인 유저 전용 — 비로그인 시 로그인 안내
 * ───────────────────────────────────────── */

'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useAuth } from '@/components/auth/auth-provider'
import { signInWithGoogle } from '@/lib/auth/helpers'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

interface HistoryItem {
  id: string
  type: 'tarot' | 'daily_fortune'
  summary: string
  cards?: { name: string; isReversed: boolean }[]
  createdAt: string
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const locale = useLocale()
  const t = useTranslations('history')
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) return

    async function fetchHistory() {
      setLoading(true)
      try {
        const res = await fetch('/api/history')
        if (res.ok) {
          const data = await res.json()
          setItems(data.items ?? [])
        }
      } catch {
        // 조회 실패 시 빈 목록
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user, authLoading])

  /** 날짜 포맷 */
  function formatDate(iso: string): string {
    const date = new Date(iso)
    return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-3xl px-4 pt-24 pb-16">
        <h1 className="mb-2 font-heading text-3xl font-bold text-slate-50">
          {t('title')}
        </h1>
        <p className="mb-10 text-sm text-slate-400">
          {t('subtitle')}
        </p>

        {/* 비로그인 상태 */}
        {!authLoading && !user && (
          <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <div className="mb-4 text-4xl">{'\uD83D\uDD12'}</div>
            <h2 className="mb-2 font-heading text-lg font-semibold text-slate-200">
              {t('loginRequired')}
            </h2>
            <p className="mb-6 max-w-sm text-sm text-slate-400">
              {t('loginDescription')}
            </p>
            <button
              onClick={() => signInWithGoogle(locale)}
              className="rounded-full bg-mystic-600 px-8 py-3 text-sm font-medium text-white transition-all hover:bg-mystic-500"
            >
              {t('signInToView')}
            </button>
          </div>
        )}

        {/* 로딩 */}
        {(authLoading || loading) && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-mystic-400 border-t-transparent" />
          </div>
        )}

        {/* 히스토리 목록 */}
        {!authLoading && user && !loading && (
          <>
            {items.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
                <div className="mb-4 text-4xl">{'\uD83D\uDCDC'}</div>
                <p className="text-sm text-slate-400">{t('empty')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-mystic-500/20 hover:bg-white/[0.05]"
                  >
                    {/* 상단: 타입 뱃지 + 날짜 */}
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                          item.type === 'tarot'
                            ? 'bg-mystic-900/50 text-mystic-400'
                            : 'bg-gold-900/50 text-gold-400'
                        }`}
                      >
                        {item.type === 'tarot' ? t('typeTarot') : t('typeFortune')}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* 카드 미리보기 (타로만) */}
                    {item.cards && item.cards.length > 0 && (
                      <div className="mb-3 flex gap-2">
                        {item.cards.map((card, i) => (
                          <span
                            key={i}
                            className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300"
                          >
                            {card.name}{card.isReversed ? ' (R)' : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 해석 요약 */}
                    <p className="text-sm leading-relaxed text-slate-400">
                      {item.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
