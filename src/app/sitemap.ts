/* ─────────────────────────────────────────
 * Sitemap — 검색 엔진에게 사이트 구조를 알려주는 "지도"
 * Next.js App Router의 sitemap 규칙을 사용하여 자동 생성
 * ───────────────────────────────────────── */

import type { MetadataRoute } from 'next'

const BASE_URL = 'https://fateweaver.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'ko']
  const pages = ['', '/tarot', '/daily']

  // locale × page 조합으로 모든 URL 생성
  const urls: MetadataRoute.Sitemap = []

  for (const page of pages) {
    for (const locale of locales) {
      urls.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '/daily' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      })
    }
  }

  return urls
}
