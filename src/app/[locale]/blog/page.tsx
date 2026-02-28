/* ─────────────────────────────────────────
 * 블로그 인덱스 — SEO 콘텐츠 허브
 * 비유: "도서관 로비" — 모든 아티클을 한눈에 보여주는 진열대
 * Server Component — SEO 크롤링 최적화 (SSR)
 * ───────────────────────────────────────── */

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { BLOG_ARTICLES } from '@/data/blog-articles'

export default function BlogPage() {
  const t = useTranslations('blog')
  const locale = useLocale()

  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-4xl px-4 pt-24 pb-16">
        {/* 제목 */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 font-heading text-3xl font-bold text-slate-50 sm:text-4xl">
            {t('title')}
          </h1>
          <p className="text-sm text-slate-400 sm:text-base">
            {t('subtitle')}
          </p>
        </div>

        {/* 아티클 카드 그리드 */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/${locale}/blog/${article.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-mystic-500/30 hover:bg-white/[0.06]"
            >
              {/* 아티클 제목 */}
              <h2 className="mb-3 font-heading text-lg font-semibold text-slate-100 transition-colors group-hover:text-gold-400">
                {t(`articles.${article.slug}.title`)}
              </h2>

              {/* 요약 */}
              <p className="mb-4 text-sm leading-relaxed text-slate-400">
                {t(`articles.${article.slug}.summary`)}
              </p>

              {/* 메타 정보 */}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <time dateTime={article.publishedAt}>
                  {new Date(article.publishedAt).toLocaleDateString(
                    locale === 'ko' ? 'ko-KR' : 'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric' }
                  )}
                </time>
                <span className="text-slate-600">&#x00B7;</span>
                <span>{t('readingTime', { minutes: article.readingTime })}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* 하단 CTA */}
        <section className="mt-16 text-center">
          <p className="mb-4 text-sm text-slate-400">
            {locale === 'ko'
              ? '지금 바로 체험해 보세요'
              : 'Ready to experience it yourself?'}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/${locale}/tarot`}
              className="inline-block rounded-full bg-mystic-600 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-mystic-600/30 transition-all hover:bg-mystic-500"
            >
              {locale === 'ko' ? '타로 리딩 받기' : 'Get Your Tarot Reading'}
            </Link>
            <Link
              href={`/${locale}/daily`}
              className="inline-block rounded-full border border-gold-500/40 px-8 py-3 text-sm font-medium text-gold-400 transition-all hover:border-gold-400 hover:bg-gold-500/10"
            >
              {locale === 'ko' ? '오늘의 운세 확인' : "Check Today's Fortune"}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
