/* ─────────────────────────────────────────
 * 푸터 — 하단 네비게이션 + 법적 고지
 * 모바일에서 헤더에 숨겨진 링크들을 여기서 보여준다
 * 비유: 쇼핑몰 1층 안내판 — 헤더가 간판이면 푸터는 층별 안내
 * ───────────────────────────────────────── */

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('common')
  const tNav = useTranslations('nav')
  const locale = useLocale()

  return (
    <footer className="border-t border-white/5 py-10">
      {/* 네비게이션 링크 — 모바일에서 헤더에 숨겨진 메뉴 접근용 */}
      <nav className="mx-auto mb-6 grid max-w-5xl grid-cols-2 gap-3 px-4 sm:grid-cols-4">
        <Link
          href={`/${locale}/tarot`}
          className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-mystic-400"
        >
          {tNav('tarot')}
        </Link>
        <Link
          href={`/${locale}/daily`}
          className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-mystic-400"
        >
          {tNav('daily')}
        </Link>
        <Link
          href={`/${locale}/archetype`}
          className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-mystic-400"
        >
          {tNav('archetype')}
        </Link>
        <Link
          href={`/${locale}/compatibility`}
          className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-gold-400"
        >
          {tNav('compatibility')}
        </Link>
        <Link
          href={`/${locale}/fortune/decade`}
          className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-gold-400"
        >
          {tNav('decade')}
        </Link>
        <Link
          href={`/${locale}/fortune/monthly`}
          className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-gold-400"
        >
          {tNav('monthly')}
        </Link>
        <Link
          href={`/${locale}/fortune/yearly`}
          className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-gold-400"
        >
          {tNav('yearly')}
        </Link>
        <Link
          href={`/${locale}/blog`}
          className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-mystic-400"
        >
          {tNav('blog')}
        </Link>
        <Link
          href={`/${locale}/pricing`}
          className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-gold-400"
        >
          {tNav('pricing')}
        </Link>
        <Link
          href={`/${locale}/feedback`}
          className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-mystic-400"
        >
          {tNav('feedback')}
        </Link>
      </nav>

      {/* 법적 링크 + 면책 문구 + 저작권 */}
      <div className="mx-auto mb-4 flex max-w-5xl items-center justify-center gap-4 px-4">
        <Link
          href={`/${locale}/privacy`}
          className="text-xs text-slate-500 transition-colors hover:text-slate-400"
        >
          {tNav('privacy')}
        </Link>
        <span className="text-xs text-slate-700">|</span>
        <Link
          href={`/${locale}/terms`}
          className="text-xs text-slate-500 transition-colors hover:text-slate-400"
        >
          {tNav('terms')}
        </Link>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500">
          {t('disclaimer')}
        </p>
        <p className="mt-2 text-xs text-slate-600">
          &copy; 2026 FateWeaver. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
