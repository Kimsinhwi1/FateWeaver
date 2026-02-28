/* ─────────────────────────────────────────
 * 개인정보 처리방침 레이아웃 — SEO 메타데이터
 * ───────────────────────────────────────── */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | FateWeaver',
  description:
    'FateWeaver Privacy Policy — how we collect, use, and protect your data including birth date, Google OAuth, and payment information.',
  robots: { index: true, follow: true },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
