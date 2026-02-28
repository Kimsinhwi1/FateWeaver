/* ─────────────────────────────────────────
 * 블로그 레이아웃 — SEO 메타데이터 전용
 * 비유: "도서관 간판" — 블로그 섹션 전체에 걸리는 대표 제목
 * 'use client'가 아닌 Server Component이므로 generateMetadata 가능
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
    title: isKo ? 'FateWeaver 블로그' : 'FateWeaver Blog',
    description: isKo
      ? '사주, 타로, AI 운세에 대한 심층 가이드'
      : 'In-depth guides about Saju, Tarot, and AI fortune reading',
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
