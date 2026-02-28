/* ─────────────────────────────────────────
 * 타로 카드 UI 컴포넌트
 * 비유: 실제 타로 카드 한 장 — 앞면(해석)과 뒷면(미스터리)이 있다
 * ───────────────────────────────────────── */

'use client'

import type { DrawnCard } from '@/types/tarot'

interface TarotCardProps {
  drawnCard: DrawnCard
  /** 카드 위치 라벨 (예: "Past", "과거") */
  positionLabel: string
  /** 카드가 공개되었는지 */
  isRevealed?: boolean
}

export default function TarotCard({ drawnCard, positionLabel, isRevealed = true }: TarotCardProps) {
  const { card, isReversed } = drawnCard

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 위치 라벨 */}
      <span className="text-xs font-medium uppercase tracking-widest text-mystic-400">
        {positionLabel}
      </span>

      {/* 카드 본체 */}
      <div
        className={`perspective-1000 relative h-64 w-40 sm:h-72 sm:w-44 ${
          isReversed ? 'rotate-180' : ''
        }`}
      >
        {isRevealed ? (
          /* 카드 앞면 */
          <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-gold-500/40 bg-gradient-to-b from-slate-800 to-slate-900 p-4 shadow-lg shadow-mystic-900/50">
            {/* 카드 번호 */}
            <span className="text-xs text-gold-500/60">
              {card.arcana === 'major' ? `${card.number}` : `${card.suit?.toUpperCase()}`}
            </span>

            {/* 카드 심볼 (placeholder — 추후 실제 이미지로 교체) */}
            <div className="my-4 flex h-20 w-20 items-center justify-center rounded-full border border-gold-500/20 text-3xl">
              {card.arcana === 'major' ? '&#x2726;' : getSuitSymbol(card.suit)}
            </div>

            {/* 카드 이름 */}
            <h4 className={`text-center font-heading text-sm font-semibold text-gold-300 ${
              isReversed ? 'rotate-180' : ''
            }`}>
              {card.name}
            </h4>
            <p className={`text-center text-xs text-slate-400 ${
              isReversed ? 'rotate-180' : ''
            }`}>
              {card.nameKo}
            </p>

            {/* 방향 표시 */}
            {isReversed && (
              <span className={`mt-1 text-[10px] text-red-400/70 rotate-180`}>
                Reversed
              </span>
            )}
          </div>
        ) : (
          /* 카드 뒷면 */
          <div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-mystic-700/50 bg-gradient-to-b from-mystic-900 to-slate-900 shadow-lg">
            <div className="h-3/4 w-3/4 rounded-lg border border-gold-500/20 bg-mystic-950/50" />
          </div>
        )}
      </div>
    </div>
  )
}

/** 슈트별 심볼 반환 */
function getSuitSymbol(suit?: string): string {
  switch (suit) {
    case 'wands': return '&#x1F6B6;'
    case 'cups': return '&#x1F378;'
    case 'swords': return '&#x2694;'
    case 'pentacles': return '&#x2B50;'
    default: return '&#x2726;'
  }
}
