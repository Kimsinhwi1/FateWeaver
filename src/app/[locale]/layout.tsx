/* ─────────────────────────────────────────
 * 루트 레이아웃 — 모든 페이지의 "뼈대"
 * 비유: 건물의 골조 — 모든 방(페이지)이 이 뼈대 안에 들어간다
 * 다크 테마 + 신비로운 분위기를 전체 앱에 적용
 * ───────────────────────────────────────── */

import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR, Cinzel } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { AuthProvider } from '@/components/auth/auth-provider'
import '@/app/globals.css'

/** 본문 폰트 — 한/영 모두 깔끔하게 지원 */
const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto',
  display: 'swap',
})

/** 제목 폰트 — 신비로운 세리프체 (영문 제목용) */
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
})

const BASE_URL = 'https://fateweaver.vercel.app'

/** 뷰포트 + 테마 컬러 — 브라우저 주소창 색상을 다크 테마와 일치 */
export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
}

/** 동적 메타데이터 — locale에 따라 title, OG, Twitter 분기 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isKo = locale === 'ko'

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: isKo
        ? 'FateWeaver — AI 운세 리딩 | 동양 사주 × 서양 타로'
        : 'FateWeaver — AI Fortune Reading | Eastern Saju × Western Tarot',
      template: isKo ? '%s | FateWeaver' : '%s | FateWeaver',
    },
    description: isKo
      ? '동양 사주명리학과 서양 타로를 AI가 융합 해석하는 글로벌 운세 서비스'
      : 'The first AI that reads your fate through both Eastern & Western wisdom.',
    openGraph: {
      type: 'website',
      siteName: 'FateWeaver',
      locale: isKo ? 'ko_KR' : 'en_US',
      images: [{ url: '/api/og', width: 1200, height: 630, alt: 'FateWeaver — AI Fortune Reading' }],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/api/og'],
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // 유효하지 않은 로케일이면 404
  if (!routing.locales.includes(locale as 'en' | 'ko')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className="dark">
      <body
        className={`${notoSansKr.variable} ${cinzel.variable} font-body antialiased bg-slate-950 text-slate-100 min-h-screen`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
