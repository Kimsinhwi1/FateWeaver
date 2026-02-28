/* ─────────────────────────────────────────
 * next-intl 요청별 설정
 * 비유: 각 페이지 요청마다 "이 사람은 한국어 사용자야" 하고 알려주는 역할
 * ───────────────────────────────────────── */

import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // 유효하지 않은 로케일이면 기본값 사용
  if (!locale || !routing.locales.includes(locale as 'en' | 'ko')) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`./${locale}.json`)).default,
  }
})
