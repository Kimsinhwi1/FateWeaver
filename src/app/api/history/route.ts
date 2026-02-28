/* ─────────────────────────────────────────
 * 리딩 히스토리 API
 * 비유: "일기장 열기" — 과거 타로 리딩과 운세 기록을 시간순으로 조회
 *
 * 로그인 유저만 사용 가능 — 비로그인 시 401
 * Supabase 미설정 시 목업 데이터 반환 (개발용)
 * ───────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server'

interface HistoryItem {
  id: string
  type: 'tarot' | 'daily_fortune'
  summary: string
  cards?: { name: string; isReversed: boolean }[]
  createdAt: string
}

/** 목업 히스토리 데이터 */
function generateMockHistory(): HistoryItem[] {
  const now = Date.now()
  return [
    {
      id: 'mock-1',
      type: 'tarot',
      summary: 'A reading about your career path revealed the Knight of Wands, The Star, and Four of Cups...',
      cards: [
        { name: 'Knight of Wands', isReversed: false },
        { name: 'The Star', isReversed: false },
        { name: 'Four of Cups', isReversed: true },
      ],
      createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-2',
      type: 'daily_fortune',
      summary: 'Today\'s fortune revealed strong fire energy aligning with your metal day master...',
      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-3',
      type: 'tarot',
      summary: 'The Empress, Eight of Swords (reversed), and The Moon guided your love reading...',
      cards: [
        { name: 'The Empress', isReversed: false },
        { name: 'Eight of Swords', isReversed: true },
        { name: 'The Moon', isReversed: false },
      ],
      createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

export async function GET(request: NextRequest) {
  try {
    // Supabase 미설정 → 목업 데이터
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ items: generateMockHistory() })
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // 현재 로그인한 유저 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 페이지네이션
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = 10
    const offset = (page - 1) * limit

    // 타로 리딩 조회
    const { data: tarotData } = await supabase
      .from('tarot_readings')
      .select('id, cards, interpretation, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 일일 운세 조회
    const { data: fortuneData } = await supabase
      .from('daily_fortunes')
      .select('id, content, fortune_date, zodiac_sign, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 두 결과를 합쳐서 날짜순 정렬
    const items: HistoryItem[] = []

    if (tarotData) {
      for (const row of tarotData) {
        const cards = row.cards as { card: { name: string }; isReversed: boolean }[]
        items.push({
          id: row.id,
          type: 'tarot',
          summary: row.interpretation ? row.interpretation.substring(0, 150) + '...' : '',
          cards: cards?.map((c) => ({
            name: c.card?.name ?? 'Unknown',
            isReversed: c.isReversed,
          })),
          createdAt: row.created_at,
        })
      }
    }

    if (fortuneData) {
      for (const row of fortuneData) {
        items.push({
          id: row.id,
          type: 'daily_fortune',
          summary: row.content ? row.content.substring(0, 150) + '...' : '',
          createdAt: row.created_at,
        })
      }
    }

    // 날짜순 정렬 (최신 먼저)
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ items })
  } catch (error) {
    console.error('히스토리 API 에러:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
