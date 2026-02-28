/* ─────────────────────────────────────────
 * 루트 레이아웃 — 모든 페이지의 "뼈대"
 * 비유: 건물의 골조 — 모든 방(페이지)이 이 뼈대 안에 들어간다
 * 다크 테마 + 신비로운 분위기를 전체 앱에 적용
 * ───────────────────────────────────────── */

import type { Metadata } from 'next'
import { Noto_Sans_KR, Cinzel } from 'next/font/google'
import { NextIntlClientProvider, useMessages } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import '@/app/globals.css'

/** 본문 폰트 — 한/영 모두 깔끔하게 지원 */
const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
})

/** 제목 폰트 — 신비로운 세리프체 (영문 제목용) */
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FateWeaver — AI Fortune Reading',
  description: 'The first AI that reads your fate through both Eastern & Western wisdom.',
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
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
