/* ─────────────────────────────────────────
 * 프리미엄 게이트 모달
 * 비유: "VIP 라운지 입구" — 무료 사용 횟수를 다 쓰거나
 *       프리미엄 전용 기능 클릭 시 나타나는 업그레이드 안내
 *
 * 두 가지 모드:
 *   1. 사용량 초과 → "오늘의 무료 리딩을 모두 사용했습니다"
 *   2. 프리미엄 전용 → "이 기능은 프리미엄 회원 전용입니다"
 * ───────────────────────────────────────── */

'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

interface PremiumGateProps {
  /** 모달 표시 여부 */
  isOpen: boolean
  /** 모달 닫기 */
  onClose: () => void
  /** 게이트 유형 */
  type: 'usage_limit' | 'premium_only'
  /** 기능 이름 (번역 키) */
  featureName?: string
}

export default function PremiumGate({
  isOpen,
  onClose,
  type,
  featureName,
}: PremiumGateProps) {
  const locale = useLocale()
  const t = useTranslations('gate')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 본체 */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gold-500/20 bg-slate-900 p-8 shadow-2xl">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 transition-colors hover:text-white"
        >
          &#x2715;
        </button>

        {/* 아이콘 */}
        <div className="mb-6 text-center text-4xl">
          {type === 'usage_limit' ? '\u23F3' : '\u2728'}
        </div>

        {/* 제목 */}
        <h2 className="mb-3 text-center font-heading text-xl font-bold text-gold-400">
          {type === 'usage_limit' ? t('limitTitle') : t('premiumTitle')}
        </h2>

        {/* 설명 */}
        <p className="mb-6 text-center text-sm leading-relaxed text-slate-400">
          {type === 'usage_limit'
            ? t('limitDescription')
            : t('premiumDescription', { feature: featureName ?? '' })
          }
        </p>

        {/* 프리미엄 혜택 목록 */}
        <ul className="mb-8 space-y-3">
          {['unlimited', 'deepSaju', 'compatibility', 'monthlyReport'].map(
            (key) => (
              <li
                key={key}
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <span className="text-gold-400">&#x2713;</span>
                {t(`benefits.${key}`)}
              </li>
            )
          )}
        </ul>

        {/* CTA 버튼들 */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/${locale}/pricing`}
            className="block rounded-full bg-gradient-to-r from-gold-500 to-gold-600 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition-all hover:from-gold-400 hover:to-gold-500 hover:shadow-lg hover:shadow-gold-500/20"
            onClick={onClose}
          >
            {t('viewPricing')}
          </Link>

          {type === 'usage_limit' && (
            <p className="text-center text-xs text-slate-500">
              {t('resetNotice')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
