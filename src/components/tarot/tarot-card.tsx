/* ─────────────────────────────────────────
 * 타로 카드 UI 컴포넌트
 * 비유: 실제 타로 카드 한 장 — 앞면(해석)과 뒷면(미스터리)이 있다
 * CSS 3D transform으로 카드가 "뒤집어지는" 애니메이션 구현
 * ───────────────────────────────────────── */

'use client'

import { useState, useEffect } from 'react'
import type { DrawnCard } from '@/types/tarot'

interface TarotCardProps {
  drawnCard: DrawnCard
  /** 카드 위치 라벨 (예: "Past", "과거") */
  positionLabel: string
  /** 카드가 공개되었는지 */
  isRevealed?: boolean
  /** 뒤집기 지연 시간(ms) — 여러 카드가 순서대로 뒤집히는 연출 */
  flipDelay?: number
}

export default function TarotCard({
  drawnCard,
  positionLabel,
  isRevealed = true,
  flipDelay = 0,
}: TarotCardProps) {
  const { card, isReversed } = drawnCard

  // 애니메이션을 위해 딜레이 후 뒤집기 — 카드가 하나씩 "착!" 뒤집어지는 효과
  const [flipped, setFlipped] = useState(false)
  useEffect(() => {
    if (isRevealed) {
      const timer = setTimeout(() => setFlipped(true), flipDelay)
      return () => clearTimeout(timer)
    }
    setFlipped(false)
  }, [isRevealed, flipDelay])

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 위치 라벨 */}
      <span className="text-xs font-medium uppercase tracking-widest text-mystic-400">
        {positionLabel}
      </span>

      {/* 카드 본체 — 3D 뒤집기 컨테이너 */}
      <div className="perspective-1000 h-64 w-40 sm:h-72 sm:w-44">
        <div
          className={`preserve-3d relative h-full w-full transition-transform duration-700 ease-in-out ${
            flipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* 카드 뒷면 — 미스터리한 패턴 */}
          <div className="backface-hidden absolute inset-0 flex items-center justify-center rounded-xl border-2 border-mystic-700/50 bg-gradient-to-b from-mystic-900 to-slate-900 shadow-lg shadow-mystic-950/50">
            <div className="flex h-3/4 w-3/4 items-center justify-center rounded-lg border border-gold-500/20 bg-mystic-950/50">
              <span className="text-4xl text-gold-500/30">{'\u2726'}</span>
            </div>
          </div>

          {/* 카드 앞면 — 해석 정보 */}
          <div
            className={`backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-gold-500/40 bg-gradient-to-b from-slate-800 to-slate-900 p-4 shadow-lg shadow-mystic-900/50 ${
              isReversed ? 'ring-1 ring-red-500/30' : ''
            }`}
          >
            {/* 카드 번호 또는 슈트 */}
            <span className="text-xs text-gold-500/60">
              {card.arcana === 'major' ? `${card.number}` : `${card.suit?.toUpperCase()}`}
            </span>

            {/* 카드 심볼 (placeholder — 추후 실제 이미지로 교체) */}
            <div className="my-4 flex h-20 w-20 items-center justify-center rounded-full border border-gold-500/20 text-3xl">
              {card.arcana === 'major' ? '\u2726' : getSuitSymbol(card.suit)}
            </div>

            {/* 카드 이름 */}
            <h4 className="text-center font-heading text-sm font-semibold text-gold-300">
              {card.name}
            </h4>
            <p className="text-center text-xs text-slate-400">
              {card.nameKo}
            </p>

            {/* 역방향 표시 */}
            {isReversed && (
              <span className="mt-2 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400/80">
                Reversed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** 슈트별 심볼 반환 */
function getSuitSymbol(suit?: string): string {
  switch (suit) {
    case 'wands': return '\u{1F525}'    // 불 — 완드는 불의 원소
    case 'cups': return '\u{1F378}'     // 잔 — 컵 슈트
    case 'swords': return '\u2694\uFE0F' // 검 — 소드 슈트
    case 'pentacles': return '\u2B50'   // 별 — 펜타클 슈트
    default: return '\u2726'            // 기본 심볼
  }
}
