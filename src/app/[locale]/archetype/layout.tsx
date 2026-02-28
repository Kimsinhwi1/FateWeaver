/* ─────────────────────────────────────────
 * 원형 매칭 레이아웃 — SEO 메타데이터
 * ───────────────────────────────────────── */

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isKo = locale === 'ko'

  return {
    title: isKo
      ? '나의 사주 원형 — 한국 점성술 성격 분석'
      : 'Your Saju Archetype — Korean Astrology Personality',
    description: isKo
      ? '사주와 융 심리학을 결합한 12가지 원형 중 당신은 누구인가요?'
      : 'Discover which of 12 Jungian archetypes matches your Korean birth chart.',
    keywords: ['saju archetype', 'korean astrology', 'saju personality', 'birth chart personality'],
  }
}

export default function ArchetypeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
