/* ─────────────────────────────────────────
 * 원형 결과 카드 — 매칭된 원형의 시각적 표현
 * 비유: "운명의 프로필 카드" — SNS 프로필처럼 나의 원형을 보여준다
 * 주 원형 + 보조 원형 + 설명 + 강점 + 조언
 * ───────────────────────────────────────── */

'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { getArchetype } from '@/data/archetypes'
import type { ArchetypeResult as ArchetypeResultType } from '@/lib/archetype/matcher'
import { captureShareCard, downloadImage } from '@/lib/utils/share'

interface Props {
  result: ArchetypeResultType
}

export default function ArchetypeResult({ result }: Props) {
  const t = useTranslations('archetype')
  const shareRef = useRef<HTMLDivElement>(null)

  const primary = getArchetype(result.primary)
  const secondary = getArchetype(result.secondary)
  if (!primary || !secondary) return null

  /** 공유 이미지 다운로드 */
  async function handleShare() {
    if (!shareRef.current) return
    try {
      const blob = await captureShareCard(shareRef.current)
      downloadImage(blob, `fateweaver-archetype-${result.primary}.png`)
    } catch {
      /* 무시 — html2canvas 실패 시 */
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      {/* 주 원형 카드 */}
      <div
        ref={shareRef}
        className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center"
        style={{
          background: `linear-gradient(135deg, ${primary.gradient.from}10, ${primary.gradient.to}10)`,
        }}
      >
        {/* 이모지 + 이름 */}
        <div className="mb-2 text-5xl">{primary.emoji}</div>
        <h2
          className="mb-1 font-heading text-2xl font-bold"
          style={{
            background: `linear-gradient(135deg, ${primary.gradient.from}, ${primary.gradient.to})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t(`types.${result.primary}.name`)}
        </h2>
        <p className="mb-6 text-sm text-slate-400">
          {t(`types.${result.primary}.title`)}
        </p>

        {/* 설명 */}
        <p className="mb-6 text-sm leading-relaxed text-slate-300">
          {t(`types.${result.primary}.description`)}
        </p>

        {/* 강점 리스트 */}
        <div className="mb-6 text-left">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t('strengths')}
          </h3>
          <ul className="space-y-2">
            {[0, 1, 2].map((idx) => {
              try {
                const key = `types.${result.primary}.strengths.${idx}` as Parameters<typeof t>[0]
                const text = t(key)
                if (text.includes(`strengths.${idx}`)) return null
                return (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                    <span
                      className="text-xs"
                      style={{ color: primary.gradient.from }}
                    >
                      &#x2713;
                    </span>
                    {text}
                  </li>
                )
              } catch {
                return null
              }
            })}
          </ul>
        </div>

        {/* 조언 */}
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
          <p className="text-xs font-semibold text-gold-400 mb-1">{t('advice')}</p>
          <p className="text-sm leading-relaxed text-slate-400">
            {t(`types.${result.primary}.advice`)}
          </p>
        </div>

        {/* 워터마크 (공유 카드용) */}
        <p className="mt-4 text-[10px] text-slate-600">fateweaver.vercel.app</p>
      </div>

      {/* 보조 원형 (작은 카드) */}
      <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <p className="mb-2 text-xs text-slate-500">{t('secondaryLabel')}</p>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{secondary.emoji}</span>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: secondary.gradient.from }}
            >
              {t(`types.${result.secondary}.name`)}
            </p>
            <p className="text-xs text-slate-500">
              {t(`types.${result.secondary}.title`)}
            </p>
          </div>
        </div>
      </div>

      {/* 공유 버튼 */}
      <button
        onClick={handleShare}
        className="mt-6 flex h-12 w-full items-center justify-center rounded-full border border-white/20 text-sm font-medium text-slate-300 transition-all hover:border-gold-500/40 hover:text-gold-400 active:scale-[0.98]"
      >
        {t('share')}
      </button>
    </div>
  )
}
