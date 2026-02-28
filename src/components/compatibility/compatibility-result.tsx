/* ─────────────────────────────────────────
 * 궁합 분석 결과 표시 컴포넌트
 * 비유: 두 사람의 "관계 성적표" — 종합 점수 + 항목별 분석
 *
 * 구성:
 *   1. 종합 점수 — 큰 원형 게이지 (CSS conic-gradient)
 *   2. 일간 관계 설명 — 오행 아이콘 + 관계 화살표
 *   3. 오행 보완도 — 시너지 바
 *   4. AI 해석 텍스트
 *   5. 강점/도전 리스트
 * ───────────────────────────────────────── */

'use client'

import { useTranslations } from 'next-intl'
import type { Element } from '@/types/saju'

interface CompatibilityResultProps {
  score: number
  dayMasterRelation: string
  person1Element: Element
  person2Element: Element
  elementSynergy: number
  strengths: string[]
  challenges: string[]
  interpretation: string
}

/** 오행별 이모지 + 색상 매핑 */
const ELEMENT_UI: Record<Element, { emoji: string; color: string; bgColor: string }> = {
  wood:  { emoji: '🌿', color: 'text-green-400',  bgColor: 'bg-green-500/20' },
  fire:  { emoji: '🔥', color: 'text-red-400',    bgColor: 'bg-red-500/20' },
  earth: { emoji: '🏔️', color: 'text-amber-400',  bgColor: 'bg-amber-500/20' },
  metal: { emoji: '⚔️', color: 'text-slate-300',  bgColor: 'bg-slate-400/20' },
  water: { emoji: '🌊', color: 'text-blue-400',   bgColor: 'bg-blue-500/20' },
}

/** 점수 → 색상 등급 */
function getScoreColor(score: number): string {
  if (score >= 80) return '#c084fc' /* mystic-400 */
  if (score >= 60) return '#d4a017' /* gold-500 */
  if (score >= 40) return '#fb923c' /* orange-400 */
  return '#f87171'                  /* red-400 */
}

export default function CompatibilityResult({
  score,
  dayMasterRelation,
  person1Element,
  person2Element,
  elementSynergy,
  strengths,
  challenges,
  interpretation,
}: CompatibilityResultProps) {
  const t = useTranslations('compatibility')

  const scoreColor = getScoreColor(score)
  const p1UI = ELEMENT_UI[person1Element]
  const p2UI = ELEMENT_UI[person2Element]

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* ──── 1. 종합 점수 원형 게이지 ──── */}
      <div className="flex flex-col items-center">
        <div
          className="relative flex h-44 w-44 items-center justify-center rounded-full sm:h-52 sm:w-52"
          style={{
            background: `conic-gradient(${scoreColor} ${score * 3.6}deg, rgba(255,255,255,0.05) ${score * 3.6}deg)`,
          }}
        >
          {/* 내부 원 — 점수 텍스트 */}
          <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-slate-900 sm:h-44 sm:w-44">
            <span className="font-heading text-4xl font-bold sm:text-5xl" style={{ color: scoreColor }}>
              {score}
            </span>
            <span className="text-xs text-slate-500">{t('outOf100')}</span>
          </div>
        </div>
        <p className="mt-4 text-center font-heading text-lg font-semibold text-slate-200">
          {t(`scoreLevel.${score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'moderate' : 'challenging'}`)}
        </p>
      </div>

      {/* ──── 2. 일간 관계 — 두 오행 아이콘 ──── */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 text-center text-sm font-medium text-slate-400">
          {t('dayMasterTitle')}
        </h3>
        <div className="flex items-center justify-center gap-4">
          {/* Person 1 오행 */}
          <div className={`flex flex-col items-center gap-1.5 rounded-xl ${p1UI.bgColor} px-5 py-3`}>
            <span className="text-2xl">{p1UI.emoji}</span>
            <span className={`text-xs font-medium ${p1UI.color}`}>
              {t(`element.${person1Element}`)}
            </span>
          </div>

          {/* 관계 화살표 */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg text-slate-500">&#x2194;</span>
            <span className="text-[10px] text-slate-500">
              {t(`relation.${dayMasterRelation}`)}
            </span>
          </div>

          {/* Person 2 오행 */}
          <div className={`flex flex-col items-center gap-1.5 rounded-xl ${p2UI.bgColor} px-5 py-3`}>
            <span className="text-2xl">{p2UI.emoji}</span>
            <span className={`text-xs font-medium ${p2UI.color}`}>
              {t(`element.${person2Element}`)}
            </span>
          </div>
        </div>
      </div>

      {/* ──── 3. 오행 시너지 바 ──── */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-3 text-sm font-medium text-slate-400">
          {t('synergyTitle')}
        </h3>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${elementSynergy}%`,
              background: `linear-gradient(90deg, #c084fc, #d4a017)`,
            }}
          />
        </div>
        <p className="mt-2 text-right text-xs text-slate-500">{elementSynergy}/100</p>
      </div>

      {/* ──── 4. AI 해석 텍스트 ──── */}
      <div className="rounded-2xl border border-mystic-500/20 bg-mystic-600/5 p-6 sm:p-8">
        <h3 className="mb-4 font-heading text-lg font-semibold text-mystic-400">
          {t('interpretationTitle')}
        </h3>
        <div className="space-y-4">
          {interpretation.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-sm leading-relaxed text-slate-300">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* ──── 5. 강점 + 도전 ──── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* 강점 */}
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
          <h3 className="mb-3 text-sm font-semibold text-green-400">{t('strengthsTitle')}</h3>
          <ul className="space-y-2">
            {strengths.map((key) => (
              <li key={key} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="mt-0.5 text-green-400">&#x2713;</span>
                {t(`strengths.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* 도전 */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="mb-3 text-sm font-semibold text-amber-400">{t('challengesTitle')}</h3>
          <ul className="space-y-2">
            {challenges.map((key) => (
              <li key={key} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="mt-0.5 text-amber-400">&#x25B3;</span>
                {t(`challenges.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
