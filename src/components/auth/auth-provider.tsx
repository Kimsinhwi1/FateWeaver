/* ─────────────────────────────────────────
 * AuthProvider — 앱 전체에 인증 상태를 공급하는 컨텍스트
 * 비유: "출입증 확인 시스템" — 앱 어디서든 "이 사람 로그인했나?" 확인 가능
 *
 * Supabase의 onAuthStateChange를 구독하여 실시간으로 상태 반영
 * ───────────────────────────────────────── */

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  /** 현재 로그인한 유저 (없으면 null) */
  user: User | null
  /** 로딩 중 여부 (초기 세션 확인 중) */
  loading: boolean
  /** 프리미엄 유저 여부 */
  isPremium: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPremium: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // TODO: 실제 구독 상태 확인 로직 (Lemon Squeezy 연동 후)
  const [isPremium] = useState(false)

  useEffect(() => {
    // Supabase 환경변수 없으면 Auth 스킵 (개발용)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setLoading(false)
      return
    }

    let mounted = true

    async function initAuth() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        // 현재 세션 확인
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }

        // 인증 상태 변경 구독 — 로그인/로그아웃 실시간 반영
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (mounted) {
              setUser(session?.user ?? null)
            }
          }
        )

        return () => {
          subscription.unsubscribe()
        }
      } catch {
        // Supabase 초기화 실패 시 비로그인 상태로 계속
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isPremium }}>
      {children}
    </AuthContext.Provider>
  )
}

/** 인증 상태 사용 훅 */
export function useAuth() {
  return useContext(AuthContext)
}
