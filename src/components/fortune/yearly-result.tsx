/* ─────────────────────────────────────────
 * 연간 운세 결과 — 테마 + 4분기 그리드 + 조언
 * 비유: 올해의 "사계절 운세 지도" — 큰 테마 아래
 *       4분기를 카드로 나열하여 한눈에 흐름을 파악
 * ───────────────────────────────────────── */

'use client'

import { useTranslations } from 'next-intl'

interface YearlyQuarter {
  period: string
  forecast: string
}

interface YearlyResultProps {
  theme: string
  quarters: YearlyQuarter[]
  advice: string
}

/** 분기별 아이콘 — 계절 이미지 */
const QUARTER_ICONS = ['\uD83C\uDF31', '\u2600\uFE0F', '\uD83C\uDF43', '\u2744\uFE0F']

export default function YearlyResult({ theme, quarters, advice }: YearlyResultProps) {
  const t = useTranslations('yearly')
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-8">
      {/* 올해 테마 */}
      <div className="text-center">
        <p className="mb-2 text-sm text-slate-500">{currentYear}</p>
        <h2 className="font-heading text-2xl font-bold text-gold-400 sm:text-3xl">
          &ldquo;{theme}&rdquo;
        </h2>
      </div>

      {/* 4분기 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {quarters.map((quarter, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-mystic-500/20"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">{QUARTER_ICONS[idx]}</span>
              <h3 className="font-heading text-sm font-semibold text-mystic-400">
                {quarter.period}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              {quarter.forecast}
            </p>
          </div>
        ))}
      </div>

      {/* 종합 조언 */}
      <div className="rounded-2xl border border-gold-500/20 bg-gold-500/5 p-6">
        <h3 className="mb-3 font-heading text-lg font-semibold text-gold-400">
          {t('adviceTitle')}
        </h3>
        <p className="text-sm leading-relaxed text-slate-300">
          {advice}
        </p>
      </div>
    </div>
  )
}
