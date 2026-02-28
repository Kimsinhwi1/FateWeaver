/* ─────────────────────────────────────────
 * 푸터 — 하단 고정 영역
 * 법적 고지(면책 문구)는 여기에만 배치 — 해석 본문에 절대 섞지 않는다
 * ───────────────────────────────────────── */

import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('common')

  return (
    <footer className="border-t border-white/5 py-8 text-center">
      <p className="text-xs text-slate-500">
        {t('disclaimer')}
      </p>
      <p className="mt-2 text-xs text-slate-600">
        &copy; 2025 FateWeaver. All rights reserved.
      </p>
    </footer>
  )
}
