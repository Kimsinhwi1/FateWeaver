/* ─────────────────────────────────────────
 * 서비스 이용약관 레이아웃 — SEO 메타데이터
 * ───────────────────────────────────────── */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | FateWeaver',
  description:
    'FateWeaver Terms of Service — usage rules, disclaimers, and subscription policies for our AI fortune reading service.',
  robots: { index: true, follow: true },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
