/* ─────────────────────────────────────────
 * JSON-LD 구조화된 데이터 — Google 리치 결과 강화
 * 비유: "명함" — 검색 엔진에게 페이지가 어떤 종류인지 알려주는 표준 포맷
 * <script type="application/ld+json"> 태그로 삽입
 * ───────────────────────────────────────── */

/** 타입 안전한 JSON-LD 컴포넌트 — data 객체를 <script> 태그로 직렬화 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
