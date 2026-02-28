/* ─────────────────────────────────────────
 * 12 융(Jung) 원형 데이터
 * 비유: "성격의 12면체" — 각 면은 인간 정신의 보편적 패턴
 * 사주의 오행 조합으로 어떤 원형에 해당하는지 결정
 * ───────────────────────────────────────── */

import type { Element } from '@/types/saju'

export type ArchetypeId =
  | 'ruler' | 'sage' | 'explorer' | 'innocent'
  | 'creator' | 'hero' | 'magician' | 'rebel'
  | 'lover' | 'caregiver' | 'jester' | 'everyman'

export interface Archetype {
  id: ArchetypeId
  /** 대표 이모지 */
  emoji: string
  /** 그라데이션 CSS (from → to) */
  gradient: { from: string; to: string }
  /** 주 오행 — 이 오행이 일간이면 후보에 포함 */
  primaryElement: Element
  /** 보조 조건 — 이 오행이 우세하면 이 원형으로 확정 */
  secondaryElement: Element
}

/** 12개 원형 정의 — 번역 텍스트는 i18n에서 관리 */
export const ARCHETYPES: Archetype[] = [
  /* ── 목(Wood) 기반 ── */
  {
    id: 'hero',
    emoji: '\u2694\uFE0F',    // ⚔️
    gradient: { from: '#22c55e', to: '#059669' },
    primaryElement: 'wood',
    secondaryElement: 'fire',
  },
  {
    id: 'explorer',
    emoji: '\uD83E\uDDED',    // 🧭
    gradient: { from: '#34d399', to: '#06b6d4' },
    primaryElement: 'wood',
    secondaryElement: 'water',
  },
  {
    id: 'rebel',
    emoji: '\u26A1',           // ⚡
    gradient: { from: '#84cc16', to: '#eab308' },
    primaryElement: 'wood',
    secondaryElement: 'metal',
  },

  /* ── 화(Fire) 기반 ── */
  {
    id: 'magician',
    emoji: '\u2728',           // ✨
    gradient: { from: '#f97316', to: '#c084fc' },
    primaryElement: 'fire',
    secondaryElement: 'wood',
  },
  {
    id: 'creator',
    emoji: '\uD83C\uDFA8',    // 🎨
    gradient: { from: '#ef4444', to: '#f97316' },
    primaryElement: 'fire',
    secondaryElement: 'earth',
  },
  {
    id: 'lover',
    emoji: '\uD83D\uDC96',    // 💖
    gradient: { from: '#f43f5e', to: '#ec4899' },
    primaryElement: 'fire',
    secondaryElement: 'metal',
  },

  /* ── 토(Earth) 기반 ── */
  {
    id: 'ruler',
    emoji: '\uD83D\uDC51',    // 👑
    gradient: { from: '#d4a017', to: '#b45309' },
    primaryElement: 'earth',
    secondaryElement: 'metal',
  },
  {
    id: 'caregiver',
    emoji: '\uD83D\uDC9A',    // 💚
    gradient: { from: '#a3e635', to: '#22c55e' },
    primaryElement: 'earth',
    secondaryElement: 'water',
  },

  /* ── 금(Metal) 기반 ── */
  {
    id: 'sage',
    emoji: '\uD83E\uDDD9',    // 🧙
    gradient: { from: '#a78bfa', to: '#6366f1' },
    primaryElement: 'metal',
    secondaryElement: 'water',
  },
  {
    id: 'innocent',
    emoji: '\uD83C\uDF1F',    // 🌟
    gradient: { from: '#e2e8f0', to: '#a78bfa' },
    primaryElement: 'metal',
    secondaryElement: 'earth',
  },

  /* ── 수(Water) 기반 ── */
  {
    id: 'jester',
    emoji: '\uD83C\uDFAD',    // 🎭
    gradient: { from: '#06b6d4', to: '#3b82f6' },
    primaryElement: 'water',
    secondaryElement: 'wood',
  },
  {
    id: 'everyman',
    emoji: '\uD83E\uDD1D',    // 🤝
    gradient: { from: '#64748b', to: '#475569' },
    primaryElement: 'water',
    secondaryElement: 'earth',
  },
]

/** ID로 원형 찾기 */
export function getArchetype(id: ArchetypeId): Archetype | undefined {
  return ARCHETYPES.find((a) => a.id === id)
}
