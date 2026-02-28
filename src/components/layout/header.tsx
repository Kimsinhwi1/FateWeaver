/* ─────────────────────────────────────────
 * 헤더 — 상단 네비게이션 바
 * Phase 3: 로그인/프로필 버튼 + pricing/history 네비 추가
 * ───────────────────────────────────────── */

'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import AuthButton from '@/components/auth/auth-button'

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

        {/* 네비게이션 링크 + 인증 — 모든 링크 최소 44px 터치 영역 */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href={`/${locale}/tarot`}
            className="flex min-h-[44px] items-center text-sm text-slate-300 transition-colors hover:text-mystic-400"
          >
            {t('tarot')}
          </Link>
          <Link
            href={`/${locale}/daily`}
            className="flex min-h-[44px] items-center text-sm text-slate-300 transition-colors hover:text-mystic-400"
          >
            {t('daily')}
          </Link>
          <Link
            href={`/${locale}/archetype`}
            className="hidden min-h-[44px] items-center text-sm text-slate-300 transition-colors hover:text-mystic-400 sm:flex"
          >
            {t('archetype')}
          </Link>
          <Link
            href={`/${locale}/compatibility`}
            className="hidden min-h-[44px] items-center text-sm text-slate-300 transition-colors hover:text-gold-400 sm:flex"
          >
            {t('compatibility')}
          </Link>
          <Link
            href={`/${locale}/blog`}
            className="hidden min-h-[44px] items-center text-sm text-slate-300 transition-colors hover:text-mystic-400 lg:flex"
          >
            {t('blog')}
          </Link>
          <Link
            href={`/${locale}/pricing`}
            className="hidden min-h-[44px] items-center text-sm text-slate-300 transition-colors hover:text-gold-400 lg:flex"
          >
            {t('pricing')}
          </Link>

          {/* 언어 전환 — 44px 터치 영역, 모바일에서 KO/EN 약어 사용 */}
          <Link
            href={locale === 'en' ? '/ko' : '/en'}
            className="flex min-h-[44px] items-center whitespace-nowrap rounded-full border border-white/20 px-3 text-xs text-slate-400 transition-colors hover:border-mystic-400 hover:text-mystic-400"
          >
            <span className="sm:hidden">{locale === 'en' ? 'KO' : 'EN'}</span>
            <span className="hidden sm:inline">{locale === 'en' ? '한국어' : 'EN'}</span>
          </Link>

          {/* 로그인/프로필 버튼 */}
          <AuthButton />
        </div>
      </nav>
    </header>
  )
}
