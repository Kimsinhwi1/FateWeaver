/* ─────────────────────────────────────────
 * Sitemap — 검색 엔진에게 사이트 구조를 알려주는 "지도"
 * Next.js App Router의 sitemap 규칙을 사용하여 자동 생성
 *
 * hreflang alternates:
 *   각 URL에 대체 언어 버전을 명시하여
 *   Google이 같은 페이지의 en/ko 버전을 정확히 매칭
 * ───────────────────────────────────────── */

import type { MetadataRoute } from 'next'

const BASE_URL = 'https://fateweaver.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'ko']
  const pages = ['', '/tarot', '/daily', '/history', '/pricing', '/archetype', '/compatibility', '/fortune/decade', '/fortune/monthly', '/fortune/yearly', '/blog', '/privacy', '/terms', '/feedback']

  /** 블로그 아티클 slug — 정적 콘텐츠 */
  const blogSlugs = ['what-is-saju', 'free-ai-tarot-reading', 'saju-archetype']

  // locale × page 조합으로 모든 URL 생성
  const urls: MetadataRoute.Sitemap = []

  for (const page of pages) {
    for (const locale of locales) {
      urls.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '/daily' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : page === '/blog' ? 0.7 : 0.8,
        /** hreflang — 대체 언어 버전 URL을 Google에 알림 */
        alternates: {
          languages: {
            en: `${BASE_URL}/en${page}`,
            ko: `${BASE_URL}/ko${page}`,
          },
        },
      })
    }
  }

  // 블로그 아티클 URL 추가
  for (const slug of blogSlugs) {
    for (const locale of locales) {
      urls.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
        /** hreflang — 블로그 아티클도 대체 언어 버전 명시 */
        alternates: {
          languages: {
            en: `${BASE_URL}/en/blog/${slug}`,
            ko: `${BASE_URL}/ko/blog/${slug}`,
          },
        },
      })
    }
  }

  return urls
}
