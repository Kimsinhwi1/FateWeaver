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

      <main className="flex min-h-screen flex-col items-center px-4 pt-16">
        {/* 히어로 섹션 */}
        <section className="mx-auto flex max-w-3xl flex-col items-center pt-16 text-center sm:pt-24">
          {/* 장식 요소 — 신비로운 심볼 */}
          <div className="mb-6 flex items-center gap-3 text-gold-500/40">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500/30" />
            <span className="text-2xl">&#x2726;</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500/30" />
          </div>

          <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl md:text-6xl">
            {t('landing.hero.title')}
            <br />
            <span className="bg-gradient-to-r from-mystic-400 to-gold-400 bg-clip-text text-transparent">
              {t('landing.hero.titleAccent')}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            {t('landing.hero.subtitle')}
          </p>

          {/* CTA 버튼들 */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href={`/${locale}/tarot`}
              className="inline-block rounded-full bg-mystic-600 px-8 py-3.5 text-base font-medium text-white shadow-lg shadow-mystic-600/30 transition-all hover:bg-mystic-500 hover:shadow-mystic-500/40 hover:scale-[1.02]"
            >
              {t('landing.hero.cta')}
            </Link>
            <span className="text-xs text-slate-500">
              {t('landing.hero.ctaFree')}
            </span>
          </div>
        </section>

        {/* 기능 소개 섹션 */}
        <section className="mx-auto mt-28 grid max-w-4xl gap-6 sm:grid-cols-3 sm:gap-8">
          {/* 타로 */}
          <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm transition-colors hover:border-mystic-500/30 hover:bg-white/[0.06]">
            <div className="mb-4 text-3xl" aria-hidden="true">&#x1F0CF;</div>
            <h3 className="font-heading text-lg font-semibold text-gold-400">
              {t('landing.features.tarot')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {t('landing.features.tarotDesc')}
            </p>
          </div>

          {/* 사주 */}
          <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm transition-colors hover:border-mystic-500/30 hover:bg-white/[0.06]">
            <div className="mb-4 text-3xl" aria-hidden="true">&#x262F;</div>
            <h3 className="font-heading text-lg font-semibold text-gold-400">
              {t('landing.features.saju')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {t('landing.features.sajuDesc')}
            </p>
          </div>

          {/* AI 융합 */}
          <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm transition-colors hover:border-mystic-500/30 hover:bg-white/[0.06]">
            <div className="mb-4 text-3xl" aria-hidden="true">&#x2728;</div>
            <h3 className="font-heading text-lg font-semibold text-gold-400">
              {t('landing.features.fusion')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {t('landing.features.fusionDesc')}
            </p>
          </div>
        </section>

        {/* 샘플 리딩 미리보기 섹션 */}
        <section className="mx-auto mt-28 w-full max-w-3xl">
          <h2 className="mb-3 text-center font-heading text-2xl font-bold text-slate-100 sm:text-3xl">
            {t('landing.sample.title')}
          </h2>
          <p className="mb-10 text-center text-sm text-slate-500">
            {t('landing.sample.description')}
          </p>

          {/* 샘플 카드 3장 */}
          <div className="mb-8 flex justify-center gap-4 sm:gap-6">
            {[
              { label: t('landing.sample.card1'), position: t('tarot.positions.past') },
              { label: t('landing.sample.card2'), position: t('tarot.positions.present') },
              { label: t('landing.sample.card3'), position: t('tarot.positions.future') },
            ].map((card) => (
              <div key={card.position} className="text-center">
                <div className="mx-auto flex h-28 w-20 items-center justify-center rounded-xl border border-mystic-500/30 bg-gradient-to-b from-mystic-900/40 to-slate-900/80 sm:h-36 sm:w-24">
                  <span className="text-2xl sm:text-3xl">&#x1F0CF;</span>
                </div>
                <p className="mt-2 text-xs text-mystic-400">{card.position}</p>
                <p className="mt-0.5 text-xs text-slate-500">{card.label}</p>
              </div>
            ))}
          </div>

          {/* 샘플 해석 텍스트 */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              {t('landing.sample.text')}
            </p>
          </div>
        </section>

        {/* 하단 CTA 섹션 */}
        <section className="mx-auto mt-28 w-full max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold text-slate-100 sm:text-3xl">
            {t('landing.cta2.title')}
          </h2>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={`/${locale}/tarot`}
              className="inline-block rounded-full bg-mystic-600 px-8 py-3.5 text-base font-medium text-white shadow-lg shadow-mystic-600/30 transition-all hover:bg-mystic-500 hover:shadow-mystic-500/40 hover:scale-[1.02]"
            >
              {t('landing.cta2.tarot')}
            </Link>
            <Link
              href={`/${locale}/daily`}
              className="inline-block rounded-full border border-gold-500/40 px-8 py-3.5 text-base font-medium text-gold-400 transition-all hover:border-gold-400 hover:bg-gold-500/10 hover:scale-[1.02]"
            >
              {t('landing.cta2.daily')}
            </Link>
          </div>
        </section>

        {/* 신뢰 지표 */}
        <section className="mx-auto mt-20 flex max-w-md flex-wrap items-center justify-center gap-8 text-center">
          <div>
            <div className="text-sm font-medium text-mystic-400">&#x2726;</div>
            <div className="mt-1 text-xs text-slate-500">{t('landing.trust.accuracy')}</div>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div>
            <div className="text-sm font-medium text-mystic-400">&#x1F30F;</div>
            <div className="mt-1 text-xs text-slate-500">{t('landing.trust.languages')}</div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
