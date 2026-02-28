/* ─────────────────────────────────────────
 * 블로그 아티클 메타데이터
 * 비유: "도서관 카탈로그" — 각 글의 기본 정보만 정리
 * 실제 텍스트는 i18n JSON에서 관리 (blog.{slug}.title 등)
 * ───────────────────────────────────────── */

export interface BlogArticle {
  /** URL slug */
  slug: string
  /** 발행일 (ISO 형식) */
  publishedAt: string
  /** 읽기 시간 (분) */
  readingTime: number
  /** 하단 CTA가 연결되는 경로들 */
  ctaLinks: string[]
  /** SEO 타겟 키워드 (메타 참고용) */
  keywords: string[]
}

/** 3편의 SEO 블로그 아티클 */
export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'what-is-saju',
    publishedAt: '2026-02-15',
    readingTime: 7,
    ctaLinks: ['/tarot', '/daily'],
    keywords: ['saju reading', 'korean fortune telling', 'four pillars of destiny'],
  },
  {
    slug: 'free-ai-tarot-reading',
    publishedAt: '2026-02-20',
    readingTime: 6,
    ctaLinks: ['/tarot'],
    keywords: ['free AI tarot reading', 'AI tarot', 'online tarot reading'],
  },
  {
    slug: 'saju-archetype',
    publishedAt: '2026-02-25',
    readingTime: 8,
    ctaLinks: ['/archetype'],
    keywords: ['korean astrology', 'saju personality', 'birth chart personality'],
  },
]
