/* ─────────────────────────────────────────
 * SNS 공유 카드 — 리딩 결과를 이미지로 변환
 * 비유: 운세 결과를 예쁜 "포토카드"로 만들어주는 스튜디오
 *
 * 공유 방식 4가지:
 *   1. 이미지 저장 (html2canvas → PNG 다운로드)
 *   2. 이미지 복사 (클립보드에 PNG 복사)
 *   3. 텍스트 복사 (해석 전문 텍스트로 복사 — 폴백)
 *   4. 네이티브 공유 (Web Share API — 모바일 전용)
 *
 * html2canvas 호환을 위해 캡처 영역에서는 Next.js <Image> 대신
 * 일반 <img> 태그를 사용한다 (Next.js 이미지 최적화 URL과 호환 문제)
 * ───────────────────────────────────────── */

'use client'

import { useRef, useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { DrawnCard } from '@/types/tarot'
import { captureShareCard, downloadImage, copyToClipboard } from '@/lib/utils/share'

interface ShareCardProps {
  cards: DrawnCard[]
  interpretation: string
  onClose: () => void
}

export default function ShareCard({ cards, interpretation, onClose }: ShareCardProps) {
  const t = useTranslations('tarot')
  const locale = useLocale()
  const cardRef = useRef<HTMLDivElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Web Share API 지원 여부 — SSR에서 navigator 접근 방지 */
  const [canNativeShare, setCanNativeShare] = useState(false)
  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  const isKo = locale === 'ko'

  /** 해석 텍스트에서 첫 2문장만 추출 — 이미지에 넣기엔 전문이 너무 김 */
  const summaryText = interpretation
    .split(/[.!?。]\s/)
    .slice(0, 2)
    .join('. ')
    .trim() + '...'

  const positionLabels = [
    t('positions.past'),
    t('positions.present'),
    t('positions.future'),
  ]

  /** 카드 이름을 locale에 맞게 반환 */
  const cardName = (drawn: DrawnCard): string => {
    const name = isKo ? (drawn.card.nameKo || drawn.card.name) : drawn.card.name
    return drawn.isReversed ? `${name} ↺` : name
  }

  /** 1. 이미지 저장 (다운로드) */
  const handleDownload = async () => {
    if (!cardRef.current) return
    setIsCapturing(true)
    setError(null)
    try {
      const blob = await captureShareCard(cardRef.current)
      downloadImage(blob)
    } catch {
      setError(isKo ? '이미지 저장 실패. 텍스트 복사를 이용해 주세요.' : 'Image save failed. Try copying text instead.')
    } finally {
      setIsCapturing(false)
    }
  }

  /** 2. 이미지 복사 (클립보드) */
  const handleCopyImage = async () => {
    if (!cardRef.current) return
    setIsCapturing(true)
    setError(null)
    try {
      const blob = await captureShareCard(cardRef.current)
      const success = await copyToClipboard(blob)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        setError(isKo ? '이미지 복사 실패. 텍스트 복사를 이용해 주세요.' : 'Image copy failed. Try text copy instead.')
      }
    } catch {
      setError(isKo ? '이미지 복사 실패. 텍스트 복사를 이용해 주세요.' : 'Image copy failed. Try text copy instead.')
    } finally {
      setIsCapturing(false)
    }
  }

  /** 3. 텍스트 복사 — 이미지 복사 실패 시 대안 */
  const handleCopyText = async () => {
    setError(null)
    try {
      const cardLines = cards
        .map((c, i) => `${positionLabels[i]}: ${cardName(c)}`)
        .join('\n')

      const text = [
        '🔮 FateWeaver Tarot Reading',
        '',
        cardLines,
        '',
        interpretation,
        '',
        'fateweaver.vercel.app',
      ].join('\n')

      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError(isKo ? '복사에 실패했습니다.' : 'Copy failed.')
    }
  }

  /** 4. 네이티브 공유 (모바일 Web Share API) */
  const handleNativeShare = async () => {
    if (!navigator.share) return
    try {
      const cardLines = cards
        .map((c, i) => `${positionLabels[i]}: ${cardName(c)}`)
        .join(', ')

      await navigator.share({
        title: 'FateWeaver Tarot Reading',
        text: `${cardLines}\n\n${summaryText}`,
        url: 'https://fateweaver.vercel.app',
      })
    } catch {
      /* 유저가 공유 시트를 닫은 경우 — 무시 */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-gold-400">
            {t('share')}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-300"
            aria-label="Close"
          >
            &#x2715;
          </button>
        </div>

        {/* ── 공유 카드 미리보기 — 이 div가 html2canvas 캡처 대상 ── */}
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
              <div
                style={{
                  fontSize: '16px',
                  color: '#94a3b8',
                  letterSpacing: '4px',
                  fontWeight: 600,
                }}
              >
                FateWeaver
              </div>
              <div style={{ fontSize: '10px', color: '#475569', marginTop: '4px' }}>
                AI Tarot × Saju Reading
              </div>
            </div>

            {/* 카드 3장 — 실제 타로 카드 이미지 사용
                html2canvas가 Next.js <Image>를 제대로 캡처 못하므로
                일반 <img> 태그 + crossOrigin="anonymous" 사용 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              {cards.map((drawn, idx) => (
                <div key={drawn.card.id} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '120px',
                      borderRadius: '8px',
                      border: drawn.isReversed
                        ? '2px solid rgba(239, 68, 68, 0.5)'
                        : '1px solid rgba(192, 132, 252, 0.3)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/tarot/${drawn.card.id}.jpg`}
                      alt={drawn.card.name}
                      width={80}
                      height={120}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top',
                        transform: drawn.isReversed ? 'rotate(180deg)' : 'none',
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#a78bfa',
                      marginTop: '6px',
                    }}
                  >
                    {positionLabels[idx]}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#94a3b8',
                      marginTop: '2px',
                      maxWidth: '80px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cardName(drawn)}
                  </div>
                </div>
              ))}
            </div>

            {/* 한줄 요약 */}
            <div
              style={{
                fontSize: '13px',
                lineHeight: '1.7',
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

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-3 rounded-lg bg-red-500/10 px-4 py-2 text-center text-xs text-red-400">
            {error}
          </div>
        )}

        {/* ── 액션 버튼 ── */}
        <div className="mt-4 flex flex-col gap-2">
          {/* 이미지 저장 / 이미지 복사 */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={isCapturing}
              className="flex h-11 flex-1 items-center justify-center rounded-lg bg-mystic-600 text-sm font-medium text-white transition-colors hover:bg-mystic-500 disabled:opacity-50"
            >
              {isCapturing
                ? '...'
                : isKo ? '\u2B07 \uC774\uBBF8\uC9C0 \uC800\uC7A5' : '\u2B07 Save Image'}
            </button>
            <button
              onClick={handleCopyImage}
              disabled={isCapturing}
              className="flex h-11 flex-1 items-center justify-center rounded-lg border border-white/20 text-sm font-medium text-slate-300 transition-colors hover:border-mystic-400 hover:text-mystic-400 disabled:opacity-50"
            >
              {copied
                ? (isKo ? '\u2714 \uBCF5\uC0AC\uB428!' : '\u2714 Copied!')
                : (isKo ? '\uD83D\uDCCB \uC774\uBBF8\uC9C0 \uBCF5\uC0AC' : '\uD83D\uDCCB Copy Image')}
            </button>
          </div>

          {/* 텍스트 복사 / 네이티브 공유 */}
          <div className="flex gap-3">
            <button
              onClick={handleCopyText}
              className="flex h-11 flex-1 items-center justify-center rounded-lg border border-white/10 text-sm text-slate-400 transition-colors hover:border-gold-500/30 hover:text-gold-400"
            >
              {isKo ? '\uD83D\uDCDD \uD14D\uC2A4\uD2B8 \uBCF5\uC0AC' : '\uD83D\uDCDD Copy Text'}
            </button>
            {canNativeShare && (
              <button
                onClick={handleNativeShare}
                className="flex h-11 flex-1 items-center justify-center rounded-lg border border-gold-500/30 text-sm text-gold-400 transition-colors hover:bg-gold-500/10"
              >
                {isKo ? '\uD83D\uDD17 \uACF5\uC720\uD558\uAE30' : '\uD83D\uDD17 Share'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
