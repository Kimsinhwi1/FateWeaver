/* ─────────────────────────────────────────
 * AuthProvider — 앱 전체에 인증 + 구독 상태를 공급하는 컨텍스트
 * 비유: "출입증 + 멤버십 확인 시스템" — 앱 어디서든
 *       "이 사람 로그인했나? 프리미엄인가?" 확인 가능
 *
 * Supabase의 onAuthStateChange를 구독하여 실시간으로 상태 반영
 * 로그인 시 user_profiles에서 is_premium 확인
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
  /** 프리미엄 상태 다시 확인 (결제 후 새로고침 없이 반영) */
  refreshPremium: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPremium: false,
  refreshPremium: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)

  /** Supabase에서 프리미엄 상태 조회 */
  async function checkPremiumStatus(userId: string) {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data } = await supabase
        .from('user_profiles')
        .select('is_premium, subscription_status, subscription_expires_at')
        .eq('id', userId)
        .single()

      if (data) {
        // 프리미엄 판단: is_premium이 true이고, 만료일이 미래이거나 null(무기한)
        const isActive = data.is_premium === true
        const notExpired = !data.subscription_expires_at ||
          new Date(data.subscription_expires_at) > new Date()

        setIsPremium(isActive && notExpired)
      }
    } catch {
      // 프로필 조회 실패 시 무료 유저로 처리
      setIsPremium(false)
    }
  }

  /** 외부에서 호출 가능한 프리미엄 상태 갱신 */
  async function refreshPremium() {
    if (user) {
      await checkPremiumStatus(user.id)
    }
  }

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

          // 로그인 유저면 프리미엄 상태 확인
          if (session?.user) {
            await checkPremiumStatus(session.user.id)
          }
        }

        // 인증 상태 변경 구독 — 로그인/로그아웃 실시간 반영
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (mounted) {
              setUser(session?.user ?? null)

              if (session?.user) {
                await checkPremiumStatus(session.user.id)
              } else {
                setIsPremium(false)
              }
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
    <AuthContext.Provider value={{ user, loading, isPremium, refreshPremium }}>
      {children}
    </AuthContext.Provider>
  )
}

/** 인증 상태 사용 훅 */
export function useAuth() {
  return useContext(AuthContext)
}
