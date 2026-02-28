/* ─────────────────────────────────────────
 * 오늘의 운세 섹션 레이아웃 — 전용 SEO 메타데이터
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
    title: isKo
      ? '오늘의 운세 — 사주 + 별자리 기반 AI 일일 운세'
      : "Today's Fortune — AI Daily Horoscope Based on Birth Chart & Zodiac",
    description: isKo
      ? '생년월일 기반으로 AI가 매일 새로운 운세를 제공합니다. 럭키 컬러, 럭키 넘버 포함.'
      : 'Get your personalized daily fortune based on your birth chart and zodiac sign. Includes lucky color and number.',
    openGraph: {
      title: isKo
        ? '오늘의 운세 — FateWeaver'
        : "Today's Fortune — FateWeaver",
    },
  }
}

export default function DailyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
