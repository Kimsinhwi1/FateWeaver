/* ─────────────────────────────────────────
 * 궁합 분석 레이아웃 — SEO 메타데이터
 * 비유: 궁합 분석 코너의 "간판" — 검색 엔진에게 이 페이지가 뭔지 알려준다
 * ───────────────────────────────────────── */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Saju Compatibility Analysis — Two-Person Birth Chart Reading | FateWeaver',
  description:
    'Discover your relationship compatibility through Korean Saju birth chart analysis. Compare two birth charts and receive AI-powered insights about your connection.',
  keywords: [
    'saju compatibility',
    'korean astrology compatibility',
    'birth chart compatibility',
    'relationship compatibility',
    'couple fortune reading',
    'AI compatibility analysis',
  ],
}

export default function CompatibilityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
