/* ─────────────────────────────────────────
 * 피드백 API — POST /api/feedback
 * 비유: "건의함에 편지 넣기" — 누구나 피드백을 남길 수 있다
 *
 * Supabase feedback 테이블에 저장
 * 비로그인 유저도 제출 가능 (user_id nullable)
 * ───────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server'

interface FeedbackRequest {
  category: 'bug' | 'feature' | 'general' | 'other'
  email: string | null
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json()
    const { category, email, message } = body

    /* 입력 검증 */
    const validCategories = ['bug', 'feature', 'general', 'other']
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      )
    }
    if (message.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Message must be less than 2000 characters' },
        { status: 400 }
      )
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    /* Supabase 미설정 → 목업 모드 */
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('[Mock] 피드백 수신:', { category, email, message: message.substring(0, 50) })
      return NextResponse.json({ success: true, mock: true })
    }

    /* Supabase에 저장 — admin 클라이언트 사용 (RLS INSERT 정책 우회) */
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    /* 로그인 유저면 user_id 첨부 */
    let userId: string | null = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    } catch {
      /* 비로그인 — userId null로 처리 */
    }

    const { error: insertError } = await supabase
      .from('feedback')
      .insert({
        category,
        email: email || null,
        message: message.trim(),
        user_id: userId,
      })

    if (insertError) {
      console.error('피드백 저장 에러:', insertError.message)
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('피드백 API 에러:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
