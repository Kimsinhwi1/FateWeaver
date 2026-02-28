/* ─────────────────────────────────────────
 * 타로 섹션 레이아웃 — 타로 페이지 전용 SEO 메타데이터
 * 'use client' 페이지에서는 metadata export가 불가하므로
 * 상위 layout에서 메타데이터를 제공한다
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
      ? '무료 AI 타로 리딩 — 3카드 스프레드 + 사주 융합 해석'
      : 'Free AI Tarot Reading — 3-Card Spread with Birth Chart Analysis',
    description: isKo
      ? '3장의 타로 카드와 사주 데이터를 AI가 융합 해석합니다. 무료 온라인 타로 리딩.'
      : 'Draw 3 tarot cards and get a personalized AI reading fused with your Eastern birth chart analysis.',
    openGraph: {
      title: isKo
        ? '무료 AI 타로 리딩 — FateWeaver'
        : 'Free AI Tarot Reading — FateWeaver',
      images: [{ url: '/api/og', width: 1200, height: 630 }],
    },
  }
}

export default function TarotLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
