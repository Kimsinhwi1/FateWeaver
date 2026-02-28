/* ─────────────────────────────────────────
 * 가격 페이지 레이아웃 — SEO 메타데이터 + FAQPage JSON-LD
 * 비유: "자주 묻는 질문 게시판" — Google 검색 결과에 FAQ 리치 스니펫 표시
 *
 * pricing/page.tsx가 'use client'이므로,
 * 서버 컴포넌트인 layout에서 JSON-LD를 삽입
 * ───────────────────────────────────────── */

import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/json-ld'

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

/** FAQ 데이터 — en/ko 양쪽 제공 (Google FAQPage 리치 스니펫용) */
const FAQ_DATA: Record<string, Array<{ question: string; answer: string }>> = {
  en: [
    {
      question: 'Is FateWeaver free to use?',
      answer:
        'Yes! FateWeaver offers free daily tarot readings and horoscopes. Premium features like compatibility analysis and decade fortune are available for $6.99/month.',
    },
    {
      question: 'What is Saju?',
      answer:
        'Saju is Korean Four Pillars of Destiny, a traditional fortune-telling system based on your birth date and time using the Chinese zodiac calendar.',
    },
    {
      question: 'How accurate is AI tarot reading?',
      answer:
        'FateWeaver uses AI to interpret traditional tarot symbolism. While it provides meaningful insights for self-reflection, it is for entertainment purposes only.',
    },
  ],
  ko: [
    {
      question: 'FateWeaver는 무료인가요?',
      answer:
        '네! FateWeaver는 무료 일일 타로 리딩과 운세를 제공합니다. 궁합 분석, 10년 대운 등 프리미엄 기능은 월 $6.99에 이용 가능합니다.',
    },
    {
      question: '사주란 무엇인가요?',
      answer:
        '사주(四柱)는 생년월일시를 기반으로 한 한국 전통 운세 체계로, 천간과 지지를 통해 개인의 운명을 해석합니다.',
    },
    {
      question: 'AI 타로 리딩은 얼마나 정확한가요?',
      answer:
        'FateWeaver는 AI를 활용하여 전통 타로 상징을 해석합니다. 자기 성찰에 유의미한 통찰을 제공하지만, 엔터테인먼트 목적으로만 사용해 주세요.',
    },
  ],
}

export default async function PricingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const faqs = FAQ_DATA[locale] || FAQ_DATA.en

  /** FAQPage 스키마 — Google 검색 결과에 FAQ 아코디언 표시 */
  const faqJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      {/* FAQPage 구조화된 데이터 */}
      <JsonLd data={faqJsonLd} />
      {children}
    </>
  )
}
