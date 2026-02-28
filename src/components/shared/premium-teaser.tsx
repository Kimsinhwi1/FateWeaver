/* ─────────────────────────────────────────
 * 프리미엄 티저 — "더 깊은 해석은 프리미엄에서"
 * 비유: 무료 시식 코너 옆의 "본품 안내판"
 * Phase 3 결제 기능 전까지는 Coming Soon 상태
 * ───────────────────────────────────────── */

'use client'

import { useTranslations } from 'next-intl'

export default function PremiumTeaser() {
  const t = useTranslations('premium')

  const features = [
    { icon: '\uD83D\uDD2E', label: t('features.deepReading') },
    { icon: '\uD83D\uDCC5', label: t('features.monthlyFortune') },
    { icon: '\u2764\uFE0F', label: t('features.compatibility') },
    { icon: '\uD83C\uDF1F', label: t('features.yearlyForecast') },
  ]

  return (
    <div className="mx-auto mt-8 w-full max-w-2xl rounded-2xl border border-mystic-500/20 bg-gradient-to-b from-mystic-900/20 to-transparent p-6">
      {/* 헤더 */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mystic-600/30 text-sm">
          {'\uD83D\uDD12'}
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

      {/* 기능 목록 */}
      <ul className="space-y-3">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-3 text-sm text-slate-400">
            <span className="text-base">{feature.icon}</span>
            <span>{feature.label}</span>
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
