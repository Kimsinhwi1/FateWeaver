/* ─────────────────────────────────────────
 * 10년 대운 결과 — 타임라인 형태로 10년 표시
 * 비유: 10년짜리 "운세 달력" — 세로 타임라인에 각 해를 카드로 표시
 * 현재 연도는 하이라이트, 나머지는 순차적으로 표시
 * ───────────────────────────────────────── */

'use client'

import { useTranslations } from 'next-intl'

interface DecadeYear {
  year: number
  keyword: string
  description: string
}

interface DecadeResultProps {
  years: DecadeYear[]
  overall: string
}

export default function DecadeResult({ years, overall }: DecadeResultProps) {
  const t = useTranslations('decade')
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-8">
      {/* 타임라인 헤더 */}
      <h2 className="text-center font-heading text-xl font-semibold text-gold-400">
        {t('timelineTitle')}
      </h2>

      {/* 10년 타임라인 */}
      <div className="relative ml-4 border-l-2 border-mystic-600/30 pl-6">
        {years.map((yearData) => {
          const isCurrent = yearData.year === currentYear
          return (
            <div key={yearData.year} className="relative mb-6 last:mb-0">
              {/* 타임라인 도트 */}
              <div
                className={`absolute -left-[calc(1.5rem+5px)] top-1 h-3 w-3 rounded-full border-2 ${
                  isCurrent
                    ? 'border-mystic-400 bg-mystic-400 shadow-lg shadow-mystic-400/50'
                    : 'border-slate-600 bg-slate-800'
                }`}
              />

              {/* 연도 카드 */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  isCurrent
                    ? 'border-mystic-500/40 bg-mystic-900/20 shadow-lg shadow-mystic-600/10'
                    : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <div className="mb-1 flex items-center gap-3">
                  <span
                    className={`font-heading text-lg font-bold ${
                      isCurrent ? 'text-mystic-400' : 'text-slate-300'
                    }`}
                  >
                    {yearData.year}
                  </span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                      isCurrent
                        ? 'bg-mystic-500/20 text-mystic-300'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {yearData.keyword}
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-xs text-gold-400">
                      {t('currentYear')}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  {yearData.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 종합 해석 */}
      <div className="rounded-2xl border border-gold-500/20 bg-gold-500/5 p-6">
        <h3 className="mb-3 font-heading text-lg font-semibold text-gold-400">
          {t('overallTitle')}
        </h3>
        <div className="space-y-4">
          {overall.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-sm leading-relaxed text-slate-300">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
