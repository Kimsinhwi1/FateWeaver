/* ─────────────────────────────────────────
 * 리딩 결과 표시 컴포넌트
 * 비유: 오라클이 읽어준 해석을 "두루마리"처럼 보여주는 UI
 * ───────────────────────────────────────── */

'use client'

interface ReadingResultProps {
  interpretation: string
}

export default function ReadingResult({ interpretation }: ReadingResultProps) {
  // AI 해석 텍스트를 문단별로 분리하여 렌더링
  const paragraphs = interpretation.split('\n\n').filter(Boolean)

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
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed text-slate-300">
            {paragraph}
          </p>
        ))}
      </div>

      {/* 장식 — 하단 구분선 */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-500/30" />
        <span className="text-gold-500/50 text-sm">&#x2726;</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-500/30" />
      </div>
    </div>
  )
}
