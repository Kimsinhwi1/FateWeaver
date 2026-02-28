/* ─────────────────────────────────────────
 * BreadcrumbList JSON-LD — 검색 결과에 경로 표시
 * 비유: "이정표" — 현재 페이지가 사이트 어디에 있는지 Google에 알림
 * pathname을 파싱하여 계층 구조 자동 생성
 * ───────────────────────────────────────── */

import { JsonLd } from './json-ld'

const BASE_URL = 'https://fateweaver.vercel.app'

/** URL 세그먼트 → 사람이 읽을 수 있는 라벨 (en/ko) */
const SEGMENT_LABELS: Record<string, Record<string, string>> = {
  tarot: { en: 'Tarot Reading', ko: '타로 리딩' },
  daily: { en: 'Daily Fortune', ko: '오늘의 운세' },
  pricing: { en: 'Pricing', ko: '요금제' },
  blog: { en: 'Blog', ko: '블로그' },
  archetype: { en: 'Archetype', ko: '원형 분석' },
  compatibility: { en: 'Compatibility', ko: '궁합' },
  history: { en: 'History', ko: '히스토리' },
  decade: { en: '10-Year Fortune', ko: '10년 대운' },
  monthly: { en: 'Monthly Fortune', ko: '월간 운세' },
  yearly: { en: 'Yearly Fortune', ko: '연간 운세' },
  privacy: { en: 'Privacy Policy', ko: '개인정보 처리방침' },
  terms: { en: 'Terms of Service', ko: '이용약관' },
  feedback: { en: 'Feedback', ko: '문의하기' },
}

/** 블로그 slug → 아티클 제목 */
const BLOG_SLUG_LABELS: Record<string, Record<string, string>> = {
  'what-is-saju': { en: 'What Is Saju?', ko: '사주란 무엇인가?' },
  'free-ai-tarot-reading': { en: 'Free AI Tarot Reading', ko: '무료 AI 타로 리딩' },
  'saju-archetype': { en: 'Saju Archetype', ko: '사주 원형 분석' },
}

/** 네임스페이스 전용 세그먼트 — 실제 페이지가 없으므로 breadcrumb에서 건너뜀 */
const NAMESPACE_ONLY = new Set(['fortune'])

/**
 * pathname → BreadcrumbList JSON-LD 데이터 생성
 * @param pathname 전체 경로 (예: /en/blog/what-is-saju)
 * @param locale 현재 로케일 (en | ko)
 */
export function generateBreadcrumbData(
  pathname: string,
  locale: string
): Record<string, unknown> | null {
  /** locale 프리픽스 제거: /en/blog → /blog */
  const pathAfterLocale = pathname.replace(/^\/(en|ko)/, '') || ''
  const segments = pathAfterLocale.split('/').filter(Boolean)

  /** 홈페이지(세그먼트 없음)면 breadcrumb 불필요 */
  if (segments.length === 0) return null

  const items: Array<{
    '@type': string
    position: number
    name: string
    item: string
  }> = []

  /** 첫 번째 항목: 항상 Home */
  items.push({
    '@type': 'ListItem',
    position: 1,
    name: locale === 'ko' ? '홈' : 'Home',
    item: `${BASE_URL}/${locale}`,
  })

  /** 나머지 세그먼트를 순회하며 breadcrumb 항목 생성 */
  let currentPath = ''
  let position = 2

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    /**
     * 네임스페이스 세그먼트 건너뛰기
     * /fortune/decade → "Fortune"은 스킵하고 "10-Year Fortune"만 표시
     * 하지만 URL 경로(/fortune/decade)는 정확하게 유지
     */
    if (NAMESPACE_ONLY.has(segment) && i < segments.length - 1) {
      continue
    }

    const label =
      BLOG_SLUG_LABELS[segment]?.[locale] ||
      SEGMENT_LABELS[segment]?.[locale] ||
      segment

    items.push({
      '@type': 'ListItem',
      position,
      name: label,
      item: `${BASE_URL}/${locale}${currentPath}`,
    })
    position++
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

/** BreadcrumbList JSON-LD 컴포넌트 — 서버 컴포넌트에서 사용 */
export function BreadcrumbJsonLd({
  pathname,
  locale,
}: {
  pathname: string
  locale: string
}) {
  const data = generateBreadcrumbData(pathname, locale)
  if (!data) return null
  return <JsonLd data={data} />
}
