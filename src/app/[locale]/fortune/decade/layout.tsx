/* ─────────────────────────────────────────
 * 10년 대운 레이아웃 — SEO 메타데이터
 * ───────────────────────────────────────── */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Decade Fortune — 10-Year Life Path | FateWeaver',
  description: 'Discover your 10-year fortune through Korean Saju birth chart analysis. See how cosmic energy shapes your decade ahead.',
  keywords: ['decade fortune', 'saju reading', '10-year forecast', 'life path', '대운', '10년 운세'],
  openGraph: {
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
}

export default function DecadeLayout({ children }: { children: React.ReactNode }) {
  return children
}
