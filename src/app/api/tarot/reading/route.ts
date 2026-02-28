/* ─────────────────────────────────────────
 * 타로 리딩 API 라우트
 * 비유: 고객(프론트엔드)의 주문을 받아 주방(AI)에 전달하고
 *       완성된 요리(해석)를 다시 고객에게 가져다주는 "웨이터"
 * ───────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server'
import { drawCards } from '@/lib/tarot/draw'
import { calculateSaju } from '@/lib/saju/calculator'
import { generateInterpretation } from '@/lib/ai/client'
import { ORACLE_SYSTEM_PROMPT, buildTarotReadingPrompt } from '@/lib/ai/prompts'
import { parseBirthDate, parseBirthTime } from '@/lib/utils/date'
import type { SpreadType } from '@/types/tarot'

/** 요청 바디 타입 */
interface ReadingRequest {
  birthDate: string
  birthTime: string | null
  birthTimezone: string
  gender?: 'male' | 'female'
  locale: string
  spreadType: SpreadType
  question?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ReadingRequest = await request.json()
    const { birthDate, birthTime, locale, question } = body

    // 1. 생년월일 파싱
    const { year, month, day } = parseBirthDate(birthDate)
    const hour = birthTime ? parseBirthTime(birthTime) : undefined

    // 2. 사주 계산
    const sajuData = calculateSaju(year, month, day, hour)

    // 3. 타로 카드 3장 뽑기
    const cards = drawCards(3)

    // 4. AI 프롬프트 구성
    const userPrompt = buildTarotReadingPrompt(cards, sajuData, locale, question)

    // 5. Claude API로 해석 생성
    const interpretation = await generateInterpretation(ORACLE_SYSTEM_PROMPT, userPrompt)

    // 6. 응답 반환 (MVP에서는 DB 저장 생략 — Phase 2에서 추가)
    const readingId = crypto.randomUUID()

    return NextResponse.json({
      readingId,
      cards,
      interpretation,
      sajuData,
    })
  } catch (error) {
    console.error('타로 리딩 API 에러:', error)
    return NextResponse.json(
      { error: 'Failed to generate reading' },
      { status: 500 }
    )
  }
}
