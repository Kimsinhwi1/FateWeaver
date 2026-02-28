/* ─────────────────────────────────────────
 * 타로 스프레드 정의
 * 비유: 카드를 테이블에 깔아놓는 "배치도" — 위치마다 의미가 다르다
 * ───────────────────────────────────────── */

import type { SpreadDefinition } from '@/types/tarot'

/** Phase 1 MVP: Daily 3-Card 스프레드만 지원 */
export const SPREADS: Record<string, SpreadDefinition> = {
  daily_3card: {
    type: 'daily_3card',
    name: 'Past - Present - Future',
    nameKo: '과거 - 현재 - 미래',
    cardCount: 3,
    positions: ['Past', 'Present', 'Future'],
    tier: 'free',
  },
}
