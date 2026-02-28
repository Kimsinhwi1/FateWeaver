/* ─────────────────────────────────────────
 * 가격 섹션 레이아웃 — 전용 SEO 메타데이터
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
    title: isKo ? '요금제 — 프리미엄 운세' : 'Pricing — Premium Fortune Reading',
    description: isKo
      ? '무제한 타로 리딩, 심층 사주 분석, 궁합, 월간 리포트. 프리미엄으로 운명의 비밀을 풀어보세요.'
      : 'Unlimited tarot readings, deep birth chart analysis, compatibility, and monthly reports.',
    openGraph: {
      title: isKo ? '요금제 — FateWeaver' : 'Pricing — FateWeaver',
      images: [{ url: '/api/og', width: 1200, height: 630 }],
    },
  }
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
