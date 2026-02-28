/* ─────────────────────────────────────────
 * 월간 운세 결과 — 텍스트 + 카테고리 점수 바
 * 비유: 이달의 "운세 성적표" — 전체 운세 + 4개 영역 점수 + 핵심 조언
 * ───────────────────────────────────────── */

'use client'

import { useTranslations } from 'next-intl'

interface MonthlyResultProps {
  fortune: string
  categories: {
    love: number
    wealth: number
    health: number
    career: number
  }
  advice: string
}

/** 카테고리별 아이콘과 색상 */
const CATEGORY_CONFIG = {
  love:   { icon: '\u2764\uFE0F', color: 'bg-pink-500',   barBg: 'bg-pink-500/20' },
  wealth: { icon: '\uD83D\uDCB0', color: 'bg-amber-500',  barBg: 'bg-amber-500/20' },
  health: { icon: '\uD83D\uDCAA', color: 'bg-emerald-500', barBg: 'bg-emerald-500/20' },
  career: { icon: '\uD83D\uDCBC', color: 'bg-blue-500',   barBg: 'bg-blue-500/20' },
} as const

type CategoryKey = keyof typeof CATEGORY_CONFIG

export default function MonthlyResult({ fortune, categories, advice }: MonthlyResultProps) {
  const t = useTranslations('monthly')

  return (
    <div className="space-y-8">
      {/* 운세 텍스트 */}
      <div className="space-y-4">
        {fortune.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="text-base leading-relaxed text-slate-300">
            {paragraph}
          </p>
        ))}
      </div>

      {/* 카테고리 점수 */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="mb-5 font-heading text-lg font-semibold text-slate-200">
          {t('categoriesTitle')}
        </h3>
        <div className="space-y-4">
          {(Object.keys(CATEGORY_CONFIG) as CategoryKey[]).map((key) => {
            const config = CATEGORY_CONFIG[key]
            const score = categories[key]
            const percentage = (score / 10) * 100

            return (
              <div key={key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-300">
                    <span>{config.icon}</span>
                    {t(`category.${key}`)}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    {score}/10
                  </span>
                </div>
                <div className={`h-2.5 w-full rounded-full ${config.barBg}`}>
                  <div
                    className={`h-full rounded-full ${config.color} transition-all duration-700`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 이달의 조언 */}
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
