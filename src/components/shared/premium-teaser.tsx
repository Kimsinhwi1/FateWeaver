/* ─────────────────────────────────────────
 * 프리미엄 티저 — "더 깊은 해석은 프리미엄에서"
 * 비유: 무료 시식 코너 옆의 "본품 안내판"
 * 각 기능을 실제 페이지 링크로 연결하여 전환 유도
 * ───────────────────────────────────────── */

'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export default function PremiumTeaser() {
  const t = useTranslations('premium')
  const locale = useLocale()

  const features = [
    { icon: '\uD83D\uDD2E', label: t('features.deepReading'), href: `/${locale}/fortune/decade` },
    { icon: '\uD83D\uDCC5', label: t('features.monthlyFortune'), href: `/${locale}/fortune/monthly` },
    { icon: '\u2764\uFE0F', label: t('features.compatibility'), href: `/${locale}/compatibility` },
    { icon: '\uD83C\uDF1F', label: t('features.yearlyForecast'), href: `/${locale}/fortune/yearly` },
  ]

  return (
    <div className="mx-auto mt-8 w-full max-w-2xl rounded-2xl border border-mystic-500/20 bg-gradient-to-b from-mystic-900/20 to-transparent p-6">
      {/* 헤더 */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mystic-600/30 text-sm">
          {'\u2728'}
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold text-mystic-300">
            {t('title')}
          </h3>
          <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-xs font-medium text-gold-400">
            {t('comingSoon')}
          </span>
        </div>
      </div>

      {/* 기능 목록 — 각 항목이 실제 페이지로 연결 */}
      <ul className="space-y-3">
        {features.map((feature, idx) => (
          <li key={idx}>
            <Link
              href={feature.href}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-mystic-300"
            >
              <span className="text-base">{feature.icon}</span>
              <span>{feature.label}</span>
              <span className="ml-auto text-xs text-slate-600">{'\u2192'}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* 안내 문구 */}
      <p className="mt-4 text-center text-xs text-slate-600">
        {t('description')}
      </p>
    </div>
  )
}
