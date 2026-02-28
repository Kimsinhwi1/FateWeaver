/* ─────────────────────────────────────────
 * 피드백/문의 페이지
 * 비유: 가게의 "건의함" — 누구나 의견을 남길 수 있는 공간
 *
 * 카테고리 선택 + 이메일(선택) + 메시지 → POST /api/feedback
 * 로그인 유저는 이메일 자동 채움
 * ───────────────────────────────────────── */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/components/auth/auth-provider'

type FeedbackCategory = 'bug' | 'feature' | 'general' | 'other'

export default function FeedbackPage() {
  const t = useTranslations('feedback')
  const { user } = useAuth()

  const [category, setCategory] = useState<FeedbackCategory>('general')
  const [email, setEmail] = useState(user?.email ?? '')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories: { value: FeedbackCategory; icon: string }[] = [
    { value: 'bug', icon: '\uD83D\uDC1B' },
    { value: 'feature', icon: '\uD83D\uDCA1' },
    { value: 'general', icon: '\uD83D\uDCE8' },
    { value: 'other', icon: '\uD83D\uDCDD' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (message.trim().length < 10) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, email: email || null, message }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit feedback')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  /* 제출 완료 화면 */
  if (submitted) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <div className="mb-4 text-5xl">{'\u2728'}</div>
        <h1 className="mb-3 font-heading text-2xl font-bold text-mystic-300">
          {t('thankYouTitle')}
        </h1>
        <p className="text-sm leading-relaxed text-slate-400">
          {t('thankYouMessage')}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-2 text-center font-heading text-3xl font-bold text-slate-100">
        {t('title')}
      </h1>
      <p className="mb-10 text-center text-sm text-slate-500">
        {t('subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 카테고리 선택 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            {t('categoryLabel')}
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`rounded-xl border px-3 py-3 text-center text-xs transition-colors ${
                  category === cat.value
                    ? 'border-mystic-500 bg-mystic-500/10 text-mystic-300'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="mb-1 block text-lg">{cat.icon}</span>
                {t(`category.${cat.value}`)}
              </button>
            ))}
          </div>
        </div>

        {/* 이메일 (선택) */}
        <div>
          <label htmlFor="feedback-email" className="mb-2 block text-sm font-medium text-slate-300">
            {t('emailLabel')}
            <span className="ml-1 text-xs text-slate-600">{t('emailOptional')}</span>
          </label>
          <input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-mystic-500"
          />
        </div>

        {/* 메시지 */}
        <div>
          <label htmlFor="feedback-message" className="mb-2 block text-sm font-medium text-slate-300">
            {t('messageLabel')}
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('messagePlaceholder')}
            rows={5}
            minLength={10}
            required
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-mystic-500"
          />
          <p className="mt-1 text-xs text-slate-600">
            {t('messageHint', { count: Math.max(0, 10 - message.trim().length) })}
          </p>
        </div>

        {error && (
          <p className="text-center text-sm text-red-400">{error}</p>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting || message.trim().length < 10}
          className="w-full rounded-xl bg-gradient-to-r from-mystic-600 to-mystic-500 py-3.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </button>
      </form>
    </div>
  )
}
