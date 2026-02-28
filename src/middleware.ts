/* ─────────────────────────────────────────
 * Next.js 미들웨어 — 다국어 라우팅 + SEO 헤더
 * 비유: 공항의 "입국 심사대" — 방문자가 어떤 언어 사용자인지 판단하고
 *       맞는 언어 페이지로 안내한다
 *
 * x-pathname 헤더:
 *   layout.tsx의 generateMetadata에서 현재 경로를 알아야
 *   hreflang(다국어 SEO)을 자동 생성할 수 있다.
 *   미들웨어에서 요청 경로를 헤더에 심어 전달.
 * ───────────────────────────────────────── */

import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import type { NextRequest } from 'next/server'

/** next-intl 다국어 미들웨어 인스턴스 */
const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  /** next-intl이 locale 감지 + 리디렉트 + 쿠키 처리 */
  const response = intlMiddleware(request)

  /** SEO: layout.tsx가 hreflang을 생성할 때 현재 경로가 필요 */
  response.headers.set('x-pathname', request.nextUrl.pathname)

  return response
}

export const config = {
  // 다국어 처리할 경로 패턴 (API, _next, 파일 제외)
  matcher: ['/', '/(en|ko)/:path*'],
}
