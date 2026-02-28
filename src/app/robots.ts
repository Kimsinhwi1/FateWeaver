/* ─────────────────────────────────────────
 * robots.txt — 검색 엔진 크롤러에게 "어디를 방문해도 되는지" 알려주는 안내문
 * ───────────────────────────────────────── */

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://fateweaver.vercel.app/sitemap.xml',
  }
}
