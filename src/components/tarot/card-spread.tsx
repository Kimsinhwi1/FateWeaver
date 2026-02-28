/* ─────────────────────────────────────────
 * 카드 스프레드 레이아웃
 * 비유: 타로 테이블 위에 카드를 "배치"하는 레이아웃
 * 3카드 스프레드: 과거 - 현재 - 미래 (순서대로 뒤집힘)
 * ───────────────────────────────────────── */

'use client'

import type { DrawnCard } from '@/types/tarot'
import { useTranslations } from 'next-intl'
import TarotCard from './tarot-card'

interface CardSpreadProps {
  cards: DrawnCard[]
}

export default function CardSpread({ cards }: CardSpreadProps) {
  const t = useTranslations('tarot.positions')

  const positionLabels = [t('past'), t('present'), t('future')]

  return (
    /* 모바일(375px): 3장이 겹치지 않도록 gap-3 + 카드 크기 자동 축소 */
    <div className="flex items-start justify-center gap-3 sm:gap-6 md:gap-8">
      {cards.map((drawnCard, index) => (
        <TarotCard
          key={drawnCard.card.id}
          drawnCard={drawnCard}
          positionLabel={positionLabels[index] ?? `Position ${index + 1}`}
          flipDelay={index * 400}
        />
      ))}
    </div>
  )
}
