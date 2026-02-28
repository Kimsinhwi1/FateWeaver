/* ─────────────────────────────────────────
 * 블로그 아티클 상세 — SEO 롱테일 콘텐츠
 * 비유: "도서관의 책 한 권" — 특정 주제를 깊이 다루는 글
 * SSR(force-dynamic) — getTranslations가 요청 컨텍스트(cookies/headers)에
 * 의존하므로 정적 생성(SSG)과 충돌. SSR로 전환하여 문제 해결.
 * ───────────────────────────────────────── */

import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { BLOG_ARTICLES } from '@/data/blog-articles'

/** SSR 강제 — getTranslations/getLocale이 동적 함수이므로 SSG와 충돌 방지 */
export const dynamic = 'force-dynamic'

/** 아티클별 SEO 메타데이터 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const article = BLOG_ARTICLES.find((a) => a.slug === slug)
  if (!article) return {}

  const messages = locale === 'ko'
    ? (await import('@/i18n/ko.json')).default
    : (await import('@/i18n/en.json')).default

  const blogMessages = messages.blog as Record<string, unknown>
  const articles = blogMessages.articles as Record<string, Record<string, string>>
  const articleData = articles[slug]

  return {
    title: articleData?.title ?? slug,
    description: articleData?.ogDescription ?? articleData?.summary ?? '',
    keywords: article.keywords,
    openGraph: {
      type: 'article',
      publishedTime: article.publishedAt,
    },
  }
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = await params
  const locale = await getLocale()
  const t = await getTranslations('blog')

  /* 유효하지 않은 slug → 404 */
  const article = BLOG_ARTICLES.find((a) => a.slug === slug)
  if (!article) notFound()

  /* body 배열의 각 단락을 읽어오기 */
  const bodyParagraphs: string[] = []
  for (let i = 0; i < 20; i++) {
    try {
      const key = `articles.${slug}.body.${i}` as Parameters<typeof t>[0]
      const paragraph = t(key)
      /* next-intl은 키가 없으면 키 자체를 반환 — 배열 인덱스 키는 존재 여부 확인 */
      if (paragraph && !paragraph.includes(`body.${i}`)) {
        bodyParagraphs.push(paragraph)
      } else {
        break
      }
    } catch {
      break
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-3xl px-4 pt-24 pb-16">
        {/* 뒤로가기 링크 */}
        <Link
          href={`/${locale}/blog`}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-mystic-400"
        >
          <span>&#x2190;</span>
          {t('backToList')}
        </Link>

        <article>
          {/* 제목 */}
          <h1 className="mb-4 font-heading text-2xl font-bold leading-tight text-slate-50 sm:text-3xl md:text-4xl">
            {t(`articles.${slug}.title` as Parameters<typeof t>[0])}
          </h1>

          {/* 메타 정보 */}
          <div className="mb-8 flex items-center gap-3 text-xs text-slate-500">
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString(
                locale === 'ko' ? 'ko-KR' : 'en-US',
                { year: 'numeric', month: 'long', day: 'numeric' }
              )}
            </time>
            <span>&#x00B7;</span>
            <span>{t('readingTime', { minutes: article.readingTime })}</span>
          </div>

          {/* 본문 */}
          <div className="space-y-5">
            {bodyParagraphs.map((paragraph, idx) => (
              <p
                key={idx}
                className="text-base leading-relaxed text-slate-300"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* 하단 CTA */}
          <div className="mt-12 rounded-2xl border border-gold-500/20 bg-gold-500/5 p-6 text-center sm:p-8">
            <p className="mb-4 text-lg font-semibold text-gold-400">
              {t(`articles.${slug}.ctaText` as Parameters<typeof t>[0])}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {article.ctaLinks.map((link, idx) => {
                const pageName = link.replace('/', '')
                const isPrimary = idx === 0
                return (
                  <Link
                    key={link}
                    href={`/${locale}${link}`}
                    className={
                      isPrimary
                        ? 'inline-block rounded-full bg-mystic-600 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-mystic-600/30 transition-all hover:bg-mystic-500'
                        : 'inline-block rounded-full border border-gold-500/40 px-8 py-3 text-sm font-medium text-gold-400 transition-all hover:border-gold-400 hover:bg-gold-500/10'
                    }
                  >
                    {t('tryCta')}
                    {article.ctaLinks.length > 1 && (
                      <span className="ml-1 text-xs opacity-70">
                        ({pageName === 'tarot'
                          ? locale === 'ko' ? '타로' : 'Tarot'
                          : pageName === 'daily'
                            ? locale === 'ko' ? '운세' : 'Fortune'
                            : pageName === 'archetype'
                              ? locale === 'ko' ? '원형' : 'Archetype'
                              : pageName})
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
