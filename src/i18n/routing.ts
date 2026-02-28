/* ─────────────────────────────────────────
 * next-intl 라우팅 설정
 * 비유: URL에서 /en/tarot, /ko/tarot 처럼 언어를 구분하는 "교통 정리"
 * ───────────────────────────────────────── */

import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'ko'],
  defaultLocale: 'en',
})
