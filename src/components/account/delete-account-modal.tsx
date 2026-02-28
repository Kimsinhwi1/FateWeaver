/* ─────────────────────────────────────────
 * 계정 삭제 확인 모달
 * 비유: 은행의 "해지 확인서" — 최종 확인 단계를 거쳐 실수를 방지
 *
 * 버튼 클릭 → 모달 열림 → 확인 클릭 → API 호출 → 랜딩 리다이렉트
 * ───────────────────────────────────────── */

'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const t = useTranslations('account')
  const locale = useLocale()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch('/api/account', { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete account')
      }

      /* 삭제 성공 → 랜딩 페이지로 리다이렉트
       * URL 파라미터로 토스트 메시지 표시를 트리거 */
      router.push(`/${locale}?deleted=true`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('deleteError'))
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isDeleting ? undefined : onClose}
      />

      {/* 모달 본체 */}
      <div className="relative w-full max-w-md rounded-2xl border border-red-500/20 bg-slate-900 p-6 shadow-2xl">
        {/* 경고 아이콘 */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-2xl">
            {'\u26A0\uFE0F'}
          </div>
        </div>

        <h2 className="mb-2 text-center font-heading text-xl font-bold text-red-400">
          {t('deleteTitle')}
        </h2>

        <p className="mb-6 text-center text-sm leading-relaxed text-slate-400">
          {t('deleteWarning')}
        </p>

        {/* 삭제되는 항목 목록 */}
        <ul className="mb-6 space-y-2 rounded-lg bg-red-500/5 p-4">
          {(['profile', 'readings', 'fortunes', 'subscription'] as const).map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-slate-500">
              <span className="text-red-400">{'\u2717'}</span>
              {t(`deleteItems.${item}`)}
            </li>
          ))}
        </ul>

        {error && (
          <p className="mb-4 text-center text-sm text-red-400">{error}</p>
        )}

        {/* 버튼 영역 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            {isDeleting ? t('deleting') : t('confirmDelete')}
          </button>
        </div>
      </div>
    </div>
  )
}
