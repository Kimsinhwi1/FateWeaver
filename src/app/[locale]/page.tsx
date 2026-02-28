/* ─────────────────────────────────────────
 * 랜딩 페이지 — FateWeaver의 첫인상
 * 신비로운 다크 테마, 핵심 가치 제안, CTA
 * ───────────────────────────────────────── */

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export default function LandingPage() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <>
      <Header />

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pt-16">
        {/* 히어로 섹션 */}
        <section className="mx-auto max-w-3xl text-center">
          {/* 장식 요소 — 신비로운 심볼 */}
          <div className="mb-8 text-5xl opacity-60" aria-hidden="true">
            &#x2728;
          </div>

          <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl md:text-6xl">
            {t('landing.hero.title')}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
            {t('landing.hero.subtitle')}
          </p>

          <Link
            href={`/${locale}/tarot`}
            className="mt-10 inline-block rounded-full bg-mystic-600 px-8 py-3 text-base font-medium text-white shadow-lg shadow-mystic-600/25 transition-all hover:bg-mystic-500 hover:shadow-mystic-500/30"
          >
            {t('landing.hero.cta')}
          </Link>
        </section>

        {/* 기능 소개 섹션 */}
        <section className="mx-auto mt-24 grid max-w-4xl gap-8 sm:grid-cols-3">
          {/* 타로 */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
            <div className="mb-4 text-3xl" aria-hidden="true">&#x1F0CF;</div>
            <h3 className="font-heading text-lg font-semibold text-gold-400">
              {t('landing.features.tarot')}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              {t('landing.features.tarotDesc')}
            </p>
          </div>

          {/* 사주 */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
            <div className="mb-4 text-3xl" aria-hidden="true">&#x262F;</div>
            <h3 className="font-heading text-lg font-semibold text-gold-400">
              {t('landing.features.saju')}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              {t('landing.features.sajuDesc')}
            </p>
          </div>

          {/* AI 융합 */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
            <div className="mb-4 text-3xl" aria-hidden="true">&#x2728;</div>
            <h3 className="font-heading text-lg font-semibold text-gold-400">
              {t('landing.features.fusion')}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              {t('landing.features.fusionDesc')}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
