/* ─────────────────────────────────────────
 * 연간 운세 레이아웃 — SEO 메타데이터
 * ───────────────────────────────────────── */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Yearly Fortune — Annual Forecast | FateWeaver',
  description: 'Get your personalized yearly fortune and quarterly outlook based on Korean Saju birth chart analysis.',
  keywords: ['yearly fortune', 'annual forecast', 'saju reading', '연간 운세', '올해 운세'],
  openGraph: {
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
}

export default function YearlyLayout({ children }: { children: React.ReactNode }) {
  return children
}
