/* ─────────────────────────────────────────
 * 타로 카드 추첨 로직
 * 비유: 실제 타로 덱에서 카드를 셔플하고 뽑는 행위를 코드로 구현
 * 진짜 점술사처럼 덱을 섞고, 뽑고, 뒤집을지 결정한다
 * ───────────────────────────────────────── */

import type { TarotCard, DrawnCard } from '@/types/tarot'
import { tarotDeck } from './cards'

/**
 * Fisher-Yates 셔플 알고리즘
 * 비유: 카드 덱을 "공정하게" 섞는 방법
 * 모든 카드가 모든 위치에 올 확률이 동일하다
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 타로 카드를 주어진 수만큼 뽑는다
 * @param count 뽑을 카드 수
 * @param reversalChance 역방향 확률 (기본 30% — 실제 타로 리딩과 유사)
 */
export function drawCards(count: number, reversalChance: number = 0.3): DrawnCard[] {
  // 1. 덱을 섞는다
  const shuffled = shuffle(tarotDeck)

  // 2. 앞에서부터 필요한 수만큼 뽑는다
  return shuffled.slice(0, count).map((card: TarotCard, index: number) => ({
    card,
    position: index,
    // 3. 각 카드마다 역방향 여부를 확률적으로 결정
    isReversed: Math.random() < reversalChance,
  }))
}
