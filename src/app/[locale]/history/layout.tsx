/* ─────────────────────────────────────────
 * 히스토리 섹션 레이아웃 — 전용 SEO 메타데이터
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
    title: isKo ? '리딩 히스토리' : 'Reading History',
    description: isKo
      ? '과거 타로 리딩과 운세 기록을 확인하세요.'
      : 'View your past tarot readings and fortune history.',
    openGraph: {
      title: isKo ? '리딩 히스토리 — FateWeaver' : 'Reading History — FateWeaver',
      images: [{ url: '/api/og', width: 1200, height: 630 }],
    },
  }
}

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
