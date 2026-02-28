/* ─────────────────────────────────────────
 * 인증 버튼 — 로그인/프로필 전환
 * 비유: "출입문" — 비회원이면 "로그인" 버튼, 회원이면 프로필 아이콘 표시
 * ───────────────────────────────────────── */

'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useAuth } from '@/components/auth/auth-provider'
import { signInWithGoogle, signOut } from '@/lib/auth/helpers'
import Link from 'next/link'

export default function AuthButton() {
  const { user, loading } = useAuth()
  const locale = useLocale()
  const t = useTranslations('auth')
  const [menuOpen, setMenuOpen] = useState(false)

  // 로딩 중에는 스켈레톤 표시
  if (loading) {
    return (
      <div className="min-h-[44px] min-w-[44px] animate-pulse rounded-full bg-white/10" />
    )
  }

  // 비로그인 상태 — 로그인 버튼
  if (!user) {
    return (
      <button
        onClick={() => signInWithGoogle(locale)}
        className="min-h-[44px] rounded-full border border-mystic-500/40 px-4 py-2 text-xs font-medium text-mystic-400 transition-all hover:border-mystic-400 hover:bg-mystic-500/10 hover:text-mystic-300"
      >
        {t('signIn')}
      </button>
    )
  }

  // 로그인 상태 — 프로필 드롭다운
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const displayName = (user.user_metadata?.full_name as string | undefined)
    ?? user.email?.split('@')[0]
    ?? 'User'

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 transition-colors hover:border-mystic-500/30"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-mystic-600 text-xs font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden text-xs text-slate-300 sm:inline">
          {displayName}
        </span>
      </button>

      {/* 드롭다운 메뉴 */}
      {menuOpen && (
        <>
          {/* 배경 클릭 시 닫기 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-white/10 bg-slate-900 py-2 shadow-xl">
            <Link
              href={`/${locale}/history`}
              className="block px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              {t('history')}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="block px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              {t('pricing')}
            </Link>
            <div className="my-1 border-t border-white/5" />
            <button
              onClick={() => {
                setMenuOpen(false)
                signOut()
              }}
              className="block w-full px-4 py-2 text-left text-sm text-red-400 transition-colors hover:bg-white/5"
            >
              {t('signOut')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
