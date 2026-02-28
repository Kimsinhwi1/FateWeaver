/* ─────────────────────────────────────────
 * 타로 카드 UI 컴포넌트
 * 비유: 실제 타로 카드 한 장 — 앞면(해석)과 뒷면(미스터리)이 있다
 * CSS 3D transform으로 카드가 "뒤집어지는" 애니메이션 구현
 * 카드 이미지는 /public/images/tarot/ 에서 card.id 기반으로 로드
 * ───────────────────────────────────────── */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
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
    // isRevealed가 false → 초기 상태로 리셋 (다음 턴에 적용)
    const reset = setTimeout(() => setFlipped(false), 0)
    return () => clearTimeout(reset)
  }, [isRevealed, flipDelay])

  /** 카드 이미지 경로 — card.id(예: "major_0")를 기반으로 이미지를 찾는다 */
  const imagePath = `/images/tarot/${card.id}.jpg`

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 위치 라벨 */}
      <span className="text-xs font-medium uppercase tracking-widest text-mystic-400">
        {positionLabel}
      </span>

      {/* 카드 본체 — 3D 뒤집기 컨테이너
         모바일(375px): 96×160px — 카드 3장 + gap-3 = 312px < 343px(뷰포트-패딩)
         sm(640px+): 160×256px, md(768px+): 176×288px */}
      <div className="perspective-1000 h-40 w-24 sm:h-64 sm:w-40 md:h-72 md:w-44">
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

          {/* 카드 앞면 — 실제 카드 이미지 + 정보 */}
          <div
            className={`backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center overflow-hidden rounded-xl border-2 border-gold-500/40 bg-gradient-to-b from-slate-800 to-slate-900 shadow-lg shadow-mystic-900/50 ${
              isReversed ? 'ring-2 ring-red-500/40' : ''
            }`}
          >
            {/* 카드 이미지 — 역방향이면 180도 회전 (실제 타로처럼) */}
            <div className={`relative h-[70%] w-full ${isReversed ? 'rotate-180' : ''}`}>
              <Image
                src={imagePath}
                alt={`${card.name} (${card.nameKo})`}
                fill
                sizes="(max-width: 639px) 96px, (max-width: 767px) 160px, 176px"
                className="object-cover object-top"
                priority={false}
              />
            </div>

            {/* 카드 정보 영역 */}
            <div className="flex flex-1 flex-col items-center justify-center px-2 py-1.5">
              <h4 className="text-center font-heading text-[10px] font-semibold leading-tight text-gold-300 sm:text-xs md:text-sm">
                {card.name}
              </h4>
              <p className="hidden text-center text-[10px] text-slate-400 sm:block">
                {card.nameKo}
              </p>

              {/* 역방향 표시 */}
              {isReversed && (
                <span className="mt-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400/80">
                  Reversed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
