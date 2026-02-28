/* ─────────────────────────────────────────
 * Next.js 미들웨어 — 다국어 라우팅
 * 비유: 공항의 "입국 심사대" — 방문자가 어떤 언어 사용자인지 판단하고
 *       맞는 언어 페이지로 안내한다
 * ───────────────────────────────────────── */

import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // 다국어 처리할 경로 패턴 (API, _next, 파일 제외)
  matcher: ['/', '/(en|ko)/:path*'],
}
