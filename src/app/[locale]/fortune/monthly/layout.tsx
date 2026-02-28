/* ─────────────────────────────────────────
 * 월간 운세 레이아웃 — SEO 메타데이터
 * ───────────────────────────────────────── */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Monthly Fortune — This Month\'s Outlook | FateWeaver',
  description: 'Get your personalized monthly fortune based on Korean Saju birth chart analysis. Love, wealth, health, and career insights.',
  keywords: ['monthly fortune', 'saju reading', 'month forecast', '월간 운세', '이달의 운세'],
  openGraph: {
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
}

export default function MonthlyLayout({ children }: { children: React.ReactNode }) {
  return children
}
