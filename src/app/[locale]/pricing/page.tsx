/* ─────────────────────────────────────────
 * 가격 페이지 — 프리미엄 업그레이드 안내
 * 비유: "메뉴판" — 무료/프리미엄 차이를 한눈에 보여준다
 *
 * 결제 버튼은 "Coming Soon" 상태 (Lemon Squeezy 승인 전)
 * ───────────────────────────────────────── */

'use client'

import { useTranslations } from 'next-intl'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

/** 가격 카드 데이터 */
const plans = [
  {
    id: 'deep_reading',
    priceKey: 'deepPrice',
    interval: null as string | null,
    popular: false,
  },
  {
    id: 'premium_monthly',
    priceKey: 'monthlyPrice',
    interval: 'month',
    popular: true,
  },
  {
    id: 'premium_yearly',
    priceKey: 'yearlyPrice',
    interval: 'year',
    popular: false,
  },
]

/** 기능 비교 항목 */
const comparisonFeatures = [
  'dailyTarot',
  'basicSaju',
  'dailyFortune',
  'unlimitedReading',
  'deepSaju',
  'compatibility',
  'monthlyReport',
  'readingHistory',
  'aiCounseling',
] as const

export default function PricingPage() {
  const t = useTranslations('pricing')

  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-5xl px-4 pt-24 pb-16">
        {/* 제목 */}
        <div className="mb-16 text-center">
          <h1 className="mb-3 font-heading text-3xl font-bold text-slate-50 sm:text-4xl">
            {t('title')}
          </h1>
          <p className="text-sm text-slate-400 sm:text-base">
            {t('subtitle')}
          </p>
        </div>

        {/* 가격 카드 3개 */}
        <div className="mx-auto mb-20 grid max-w-4xl gap-6 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 text-center transition-colors ${
                plan.popular
                  ? 'border-gold-500/40 bg-gold-500/5 shadow-lg shadow-gold-500/10'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              {/* 인기 뱃지 */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-4 py-0.5 text-xs font-bold text-slate-950">
                  {t('popular')}
                </div>
              )}

              {/* 플랜 이름 */}
              <h3 className="mt-2 font-heading text-lg font-semibold text-slate-100">
                {t(`plans.${plan.id}.name`)}
              </h3>

              {/* 가격 */}
              <div className="my-4">
                <span className="text-3xl font-bold text-gold-400">
                  {t(`plans.${plan.id}.price`)}
                </span>
                {plan.interval && (
                  <span className="text-sm text-slate-500">
                    /{t(`interval.${plan.interval}`)}
                  </span>
                )}
              </div>

              {/* 설명 */}
              <p className="mb-6 text-sm text-slate-400">
                {t(`plans.${plan.id}.description`)}
              </p>

              {/* CTA 버튼 — Coming Soon */}
              <button
                disabled
                className="w-full cursor-not-allowed rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-slate-400"
              >
                {t('comingSoon')}
              </button>
            </div>
          ))}
        </div>

        {/* 기능 비교 테이블 */}
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center font-heading text-2xl font-bold text-slate-100">
            {t('compareTitle')}
          </h2>

          <div className="overflow-hidden rounded-xl border border-white/10">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.03]">
              <div className="p-4 text-sm font-medium text-slate-400">
                {t('featureLabel')}
              </div>
              <div className="p-4 text-center text-sm font-medium text-slate-400">
                {t('free')}
              </div>
              <div className="p-4 text-center text-sm font-medium text-gold-400">
                {t('premium')}
              </div>
            </div>

            {/* 기능 행 */}
            {comparisonFeatures.map((feature, idx) => (
              <div
                key={feature}
                className={`grid grid-cols-3 ${
                  idx < comparisonFeatures.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <div className="p-4 text-sm text-slate-300">
                  {t(`features.${feature}`)}
                </div>
                <div className="flex items-center justify-center p-4 text-center">
                  <span className={t(`comparison.${feature}.free`) === 'true'
                    ? 'text-green-400'
                    : 'text-slate-600'
                  }>
                    {t(`comparison.${feature}.free`) === 'true'
                      ? '\u2713'
                      : t(`comparison.${feature}.free`)
                    }
                  </span>
                </div>
                <div className="flex items-center justify-center p-4 text-center text-gold-400">
                  {'\u2713'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 안내 */}
        <p className="mt-8 text-center text-xs text-slate-500">
          {t('notice')}
        </p>
      </main>
      <Footer />
    </>
  )
}
