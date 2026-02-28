/* ─────────────────────────────────────────
 * 피드백 페이지 레이아웃 — SEO 메타데이터
 * ───────────────────────────────────────── */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Feedback & Contact | FateWeaver',
  description:
    'Share your feedback, report bugs, or suggest features for FateWeaver. We value your input to improve our AI fortune reading service.',
}

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
