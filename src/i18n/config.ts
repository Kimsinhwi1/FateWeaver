/* ─────────────────────────────────────────
 * 다국어(i18n) 설정
 * 비유: "통역사 설정" — 어떤 언어를 지원하고 기본 언어가 뭔지 정의
 * ───────────────────────────────────────── */

export const locales = ['en', 'ko'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'
