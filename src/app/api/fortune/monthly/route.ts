/* ─────────────────────────────────────────
 * 월간 운세 API — 이번 달의 운세
 * 비유: 이번 달의 "에너지 일기예보" — 이달의 천간지지와
 *       사주의 상호작용을 분석하여 맞춤형 운세 제공
 *
 * 프리미엄 전용: 클라이언트에서 isPremium 체크 후 호출
 * ───────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server'
import { calculateSaju } from '@/lib/saju/calculator'
import { parseBirthDate, parseBirthTime } from '@/lib/utils/date'
import { getMonthPillar } from '@/lib/saju/period'
import { ELEMENT_NAMES_KO, ELEMENT_NAMES_EN } from '@/lib/saju/stems-branches'
import type { SajuData, Element } from '@/types/saju'

interface MonthlyRequest {
  birthDate: string       // "YYYY-MM-DD"
  birthTime: string | null
  locale: string          // "ko" | "en"
}

interface MonthlyResponse {
  fortune: string
  categories: {
    love: number
    wealth: number
    health: number
    career: number
  }
  advice: string
}

/** 목업 월간 운세 생성 */
function generateMockMonthly(sajuData: SajuData, locale: string): MonthlyResponse {
  const elementName = locale === 'ko'
    ? ELEMENT_NAMES_KO[sajuData.favorableElement]
    : ELEMENT_NAMES_EN[sajuData.favorableElement]

  const dayMasterName = locale === 'ko'
    ? ELEMENT_NAMES_KO[sajuData.fourPillars.day.element]
    : ELEMENT_NAMES_EN[sajuData.fourPillars.day.element]

  const fortune = locale === 'ko'
    ? `이번 달은 당신의 ${dayMasterName} 에너지가 한층 활발해지는 시기입니다. 그동안 조용히 준비해 온 일들이 서서히 모습을 드러내기 시작합니다. 특히 월 초에 중요한 결정의 순간이 찾아올 수 있으니, 직감을 믿고 행동하세요.\n\n대인 관계에서 새로운 인연이 펼쳐질 수 있습니다. 평소와 다른 분야의 사람들과의 교류가 뜻밖의 기회를 가져다줄 것입니다. 열린 마음으로 다가가되, 무리하지는 마세요.\n\n재물운은 중반 이후 상승세를 보입니다. 큰 지출보다는 작은 투자나 저축에 초점을 맞추면 달 말에 기분 좋은 소식이 있을 것입니다.`
    : `This month, your ${dayMasterName} energy becomes particularly vibrant. Projects you've been quietly nurturing will begin to reveal themselves. Watch for an important decision point early in the month — trust your instincts and act decisively.\n\nNew connections may form in unexpected places. Engaging with people from different fields will open doors you didn't know existed. Approach with an open heart, but don't overextend yourself.\n\nFinancial energy picks up after mid-month. Focus on small investments and savings rather than major expenditures, and pleasant news may arrive by month's end.`

  const advice = locale === 'ko'
    ? `이번 달의 핵심은 ${elementName}의 에너지를 의식적으로 활용하는 것입니다. 아침에 잠시 명상하거나, 자연 속에서 시간을 보내는 것이 당신의 운기를 높이는 열쇠가 됩니다. 특히 중요한 일이 있는 날에는 ${elementName}과 연관된 색상을 착용해 보세요.`
    : `This month's key is to consciously harness ${elementName} energy. Brief morning meditation or spending time in nature will elevate your fortune. On important days, try wearing colors associated with ${elementName} for an extra boost.`

  /* 점수는 사주 균형에 따라 약간의 변화를 줌 */
  const base = 6
  return {
    fortune,
    categories: {
      love: Math.min(10, base + Math.floor(Math.random() * 3)),
      wealth: Math.min(10, base + Math.floor(Math.random() * 3)),
      health: Math.min(10, base + Math.floor(Math.random() * 3) + 1),
      career: Math.min(10, base + Math.floor(Math.random() * 3)),
    },
    advice,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MonthlyRequest = await request.json()
    const { birthDate, birthTime, locale } = body

    /* 입력 검증 */
    if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      return NextResponse.json({ error: 'Invalid birthDate format (YYYY-MM-DD)' }, { status: 400 })
    }
    if (birthTime && !/^\d{2}:\d{2}$/.test(birthTime)) {
      return NextResponse.json({ error: 'Invalid birthTime format (HH:mm)' }, { status: 400 })
    }

    /* 1. 사주 계산 */
    const { year, month, day } = parseBirthDate(birthDate)
    const hour = birthTime ? parseBirthTime(birthTime) : undefined
    const sajuData = calculateSaju(year, month, day, hour)

    /* 2. 이번 달 월주 계산 */
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const monthPillar = getMonthPillar(currentYear, currentMonth)
    const yearMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

    /* 3. AI 또는 목업으로 해석 생성 */
    let result: MonthlyResponse

    if (process.env.ANTHROPIC_API_KEY) {
      const { generateInterpretation } = await import('@/lib/ai/client')
      const { ORACLE_SYSTEM_PROMPT, buildMonthlyFortunePrompt } = await import('@/lib/ai/prompts')

      const pillarForPrompt = {
        stem: monthPillar.stem,
        branch: monthPillar.branch,
        element: locale === 'ko'
          ? ELEMENT_NAMES_KO[monthPillar.element]
          : ELEMENT_NAMES_EN[monthPillar.element],
      }

      const userPrompt = buildMonthlyFortunePrompt(sajuData, yearMonth, pillarForPrompt, locale)
      const raw = await generateInterpretation(ORACLE_SYSTEM_PROMPT, userPrompt)

      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('AI 응답에서 JSON을 찾을 수 없습니다')
      }

      const parsed = JSON.parse(jsonMatch[0])
      result = {
        fortune: parsed.fortune,
        categories: parsed.categories,
        advice: parsed.advice,
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      result = generateMockMonthly(sajuData, locale)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('월간 운세 API 에러:', error)
    return NextResponse.json(
      { error: 'Failed to generate monthly fortune' },
      { status: 500 }
    )
  }
}
