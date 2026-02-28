/* ─────────────────────────────────────────
 * 헤더 — 상단 네비게이션 바
 * ───────────────────────────────────────── */

'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* 로고 */}
        <Link
          href={`/${locale}`}
          className="font-heading text-xl font-semibold tracking-wider text-gold-400"
        >
          FateWeaver
        </Link>

        {/* 네비게이션 링크 */}
        <div className="flex items-center gap-6">
          <Link
            href={`/${locale}/tarot`}
            className="text-sm text-slate-300 transition-colors hover:text-mystic-400"
          >
            {t('tarot')}
          </Link>
          <Link
            href={`/${locale}/daily`}
            className="text-sm text-slate-300 transition-colors hover:text-mystic-400"
          >
            {t('daily')}
          </Link>

          {/* 언어 전환 */}
          <Link
            href={locale === 'en' ? '/ko' : '/en'}
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-400 transition-colors hover:border-mystic-400 hover:text-mystic-400"
          >
            {locale === 'en' ? '한국어' : 'EN'}
          </Link>
        </div>
      </nav>
    </header>
  )
}
