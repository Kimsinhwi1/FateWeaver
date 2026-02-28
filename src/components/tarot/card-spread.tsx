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
    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
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
