/* ─────────────────────────────────────────
 * 리딩 결과 표시 컴포넌트
 * 비유: 오라클이 읽어준 해석을 "두루마리"처럼 보여주는 UI
 *
 * AI 해석 텍스트를 문단별로 분리하여 가독성 좋게 렌더링한다.
 * 마지막 문단은 "행동 제안"이므로 시각적으로 구분해준다.
 * ───────────────────────────────────────── */

'use client'

interface ReadingResultProps {
  interpretation: string
}

export default function ReadingResult({ interpretation }: ReadingResultProps) {
  // AI 해석 텍스트를 문단별로 분리하여 렌더링
  const paragraphs = interpretation.split('\n\n').filter(Boolean)

  // 마지막 문단은 행동 제안 — 시각적으로 강조
  const mainParagraphs = paragraphs.slice(0, -1)
  const actionAdvice = paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : null

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-gold-500/20 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-6 shadow-xl shadow-mystic-950/50 backdrop-blur-sm sm:p-8">
      {/* 장식 — 상단 구분선 */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-500/30" />
        <span className="text-gold-500/50 text-sm">&#x2726;</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-500/30" />
      </div>

      {/* 해석 본문 */}
      <div className="space-y-4">
        {mainParagraphs.map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed text-slate-300">
            {paragraph}
          </p>
        ))}
      </div>

      {/* 행동 제안 — 마지막 문단을 강조 카드로 표시 */}
      {actionAdvice && (
        <div className="mt-6 rounded-xl border border-mystic-500/20 bg-mystic-950/30 px-5 py-4">
          <p className="text-sm font-medium leading-relaxed text-mystic-300">
            {actionAdvice}
          </p>
        </div>
      )}

      {/* 장식 — 하단 구분선 */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-500/30" />
        <span className="text-gold-500/50 text-sm">&#x2726;</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-500/30" />
      </div>
    </div>
  )
}
