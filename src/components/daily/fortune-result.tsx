/* ─────────────────────────────────────────
 * 오늘의 운세 결과 컴포넌트
 * 비유: 매일 아침 받는 "운세 카드" — 운세 텍스트 + 럭키 아이템
 * ───────────────────────────────────────── */

'use client'

import { useTranslations } from 'next-intl'

interface FortuneResultProps {
  fortune: string
  luckyColor: string
  luckyNumber: number
  moodScore: number
  zodiacSign: string
}

/** 럭키 컬러를 CSS 색상값으로 변환 */
const COLOR_MAP: Record<string, string> = {
  coral: '#FF7F7F',
  lavender: '#B4A7D6',
  emerald: '#50C878',
  amber: '#FFBF00',
  navy: '#1B3A5C',
  silver: '#C0C0C0',
  ruby: '#E0115F',
  sapphire: '#0F52BA',
  gold: '#FFD700',
  ivory: '#FFFFF0',
  rose: '#FF007F',
  teal: '#008080',
  crimson: '#DC143C',
  indigo: '#4B0082',
  peach: '#FFDAB9',
  mint: '#98FF98',
  bronze: '#CD7F32',
  pearl: '#F0EAD6',
  plum: '#8E4585',
  scarlet: '#FF2400',
}

/** 별자리 이모지 (OG 이미지가 아닌 앱 내부에서만 사용) */
const ZODIAC_EMOJI: Record<string, string> = {
  aries: '\u2648', taurus: '\u2649', gemini: '\u264A',
  cancer: '\u264B', leo: '\u264C', virgo: '\u264D',
  libra: '\u264E', scorpio: '\u264F', sagittarius: '\u2650',
  capricorn: '\u2651', aquarius: '\u2652', pisces: '\u2653',
}

export default function FortuneResult({
  fortune,
  luckyColor,
  luckyNumber,
  moodScore,
  zodiacSign,
}: FortuneResultProps) {
  const t = useTranslations('daily')

  const colorHex = COLOR_MAP[luckyColor.toLowerCase()] || '#C084FC'

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* 별자리 + 날짜 헤더 */}
      <div className="text-center">
        <span className="text-4xl">{ZODIAC_EMOJI[zodiacSign] || '\u2728'}</span>
        <h2 className="mt-2 font-heading text-xl font-semibold text-gold-400">
          {t(`zodiac.${zodiacSign}`)}
        </h2>
      </div>

      {/* 무드 스코어 게이지 */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-slate-400">{t('moodScore')}</span>
          <span className="font-heading text-lg font-bold text-mystic-400">
            {moodScore}/10
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-mystic-600 to-gold-400 transition-all duration-1000"
            style={{ width: `${moodScore * 10}%` }}
          />
        </div>
      </div>

      {/* 운세 본문 */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-4 text-base leading-relaxed text-slate-200">
          {fortune.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* 럭키 아이템 — 컬러 + 넘버 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 럭키 컬러 */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <div
            className="h-10 w-10 shrink-0 rounded-full border-2 border-white/20 shadow-lg"
            style={{ backgroundColor: colorHex, boxShadow: `0 0 20px ${colorHex}40` }}
          />
          <div>
            <p className="text-xs text-slate-500">{t('luckyColor')}</p>
            <p className="font-medium capitalize text-slate-200">{luckyColor}</p>
          </div>
        </div>

        {/* 럭키 넘버 */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mystic-600 to-gold-500 font-heading text-lg font-bold text-white">
            {luckyNumber}
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('luckyNumber')}</p>
            <p className="font-medium text-slate-200">{luckyNumber}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
