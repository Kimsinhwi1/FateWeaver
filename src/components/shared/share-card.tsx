/* ─────────────────────────────────────────
 * SNS 공유 카드 — 리딩 결과를 이미지로 변환
 * 비유: 운세 결과를 예쁜 "포토카드"로 만들어주는 스튜디오
 *
 * 숨겨진 div에 공유용 레이아웃을 렌더링하고,
 * html2canvas로 캡처 → 다운로드/클립보드 복사
 * ───────────────────────────────────────── */

'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { DrawnCard } from '@/types/tarot'
import { captureShareCard, downloadImage, copyToClipboard } from '@/lib/utils/share'

interface ShareCardProps {
  cards: DrawnCard[]
  interpretation: string
  onClose: () => void
}

export default function ShareCard({ cards, interpretation, onClose }: ShareCardProps) {
  const t = useTranslations('tarot')
  const cardRef = useRef<HTMLDivElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [copied, setCopied] = useState(false)

  // 해석 텍스트에서 첫 2문장만 추출 — 이미지에 넣기엔 전문이 너무 김
  const summaryText = interpretation
    .split(/[.!?。]\s/)
    .slice(0, 2)
    .join('. ')
    .trim() + '...'

  const positionLabels = [t('positions.past'), t('positions.present'), t('positions.future')]

  const handleDownload = async () => {
    if (!cardRef.current) return
    setIsCapturing(true)
    try {
      const blob = await captureShareCard(cardRef.current)
      downloadImage(blob)
    } finally {
      setIsCapturing(false)
    }
  }

  const handleCopy = async () => {
    if (!cardRef.current) return
    setIsCapturing(true)
    try {
      const blob = await captureShareCard(cardRef.current)
      const success = await copyToClipboard(blob)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6">
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-gold-400">
            {t('share')}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 transition-colors hover:text-slate-300"
            aria-label="Close"
          >
            &#x2715;
          </button>
        </div>

        {/* 공유 카드 미리보기 — 이 div가 캡처 대상 */}
        <div
          ref={cardRef}
          className="overflow-hidden rounded-xl"
          style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}
        >
          <div
            style={{
              padding: '32px 24px',
              background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%)',
            }}
          >
            {/* 로고 */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', color: '#94a3b8', letterSpacing: '3px' }}>
                FateWeaver
              </div>
            </div>

            {/* 카드 3장 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
              {cards.map((drawn, idx) => (
                <div key={drawn.card.id} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '120px',
                      borderRadius: '8px',
                      border: '1px solid rgba(192, 132, 252, 0.3)',
                      background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                    }}
                  >
                    &#x1F0CF;
                  </div>
                  <div style={{ fontSize: '10px', color: '#a78bfa', marginTop: '6px' }}>
                    {positionLabels[idx]}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                    {drawn.card.nameKo || drawn.card.name}
                    {drawn.isReversed ? ' (R)' : ''}
                  </div>
                </div>
              ))}
            </div>

            {/* 한줄 요약 */}
            <div
              style={{
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#cbd5e1',
                textAlign: 'center',
                padding: '0 8px',
              }}
            >
              {summaryText}
            </div>

            {/* 워터마크 */}
            <div
              style={{
                textAlign: 'center',
                marginTop: '24px',
                fontSize: '11px',
                color: '#475569',
              }}
            >
              fateweaver.vercel.app
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={isCapturing}
            className="flex-1 rounded-lg bg-mystic-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-mystic-500 disabled:opacity-50"
          >
            {isCapturing ? '...' : '\u2B07 Download'}
          </button>
          <button
            onClick={handleCopy}
            disabled={isCapturing}
            className="flex-1 rounded-lg border border-white/20 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-mystic-400 hover:text-mystic-400 disabled:opacity-50"
          >
            {copied ? '\u2714 Copied!' : '\u{1F4CB} Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
