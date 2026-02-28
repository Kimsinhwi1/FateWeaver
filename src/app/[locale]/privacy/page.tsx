/* ─────────────────────────────────────────
 * 개인정보 처리방침 페이지 — Server Component (정적)
 * 비유: 가게 앞의 "개인정보 처리 안내문"
 * i18n으로 한/영 지원, 디자인은 심플한 텍스트 레이아웃
 * ───────────────────────────────────────── */

import { useTranslations } from 'next-intl'

export default function PrivacyPage() {
  const t = useTranslations('privacy')

  /** 섹션을 일관된 스타일로 렌더링하는 헬퍼 */
  function Section({ title, paragraphs }: { title: string; paragraphs: string[] }) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-slate-400">
            {p}
          </p>
        ))}
      </section>
    )
  }

  /* i18n에서 sections 배열을 가져온다 */
  const sectionKeys = [
    'introduction',
    'dataCollected',
    'googleOAuth',
    'birthData',
    'storedData',
    'payments',
    'cookies',
    'dataDeletion',
    'gdpr',
    'changes',
    'contact',
  ] as const

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-center font-heading text-3xl font-bold text-slate-100">
        {t('title')}
      </h1>
      <p className="mb-12 text-center text-sm text-slate-500">
        {t('lastUpdated')}
      </p>

      <div className="space-y-10">
        {sectionKeys.map((key) => {
          /* 각 섹션의 문단 개수만큼 동적으로 가져온다 */
          const title = t(`sections.${key}.title`)
          const paragraphs: string[] = []
          for (let i = 0; i < 10; i++) {
            try {
              const p = t(`sections.${key}.content.${i}`)
              if (p && !p.startsWith('privacy.sections')) paragraphs.push(p)
            } catch {
              break
            }
          }
          if (paragraphs.length === 0) return null
          return <Section key={key} title={title} paragraphs={paragraphs} />
        })}
      </div>
    </div>
  )
}
