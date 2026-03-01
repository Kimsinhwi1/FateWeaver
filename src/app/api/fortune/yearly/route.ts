/* ─────────────────────────────────────────
 * 연간 운세 API — 올해의 운세
 * 비유: 올해의 "사계절 운세 가이드" — 올해 천간지지와
 *       사주의 상호작용을 분석하여 분기별 운세 제공
 *
 * 프리미엄 전용: 서버에서 인증 + 구독 상태를 검증
 * ───────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server'
import { apiGuard } from '@/lib/api/guard'
import { calculateSaju } from '@/lib/saju/calculator'
import { parseBirthDate, parseBirthTime } from '@/lib/utils/date'
import { getYearPillar } from '@/lib/saju/period'
import { ELEMENT_NAMES_KO, ELEMENT_NAMES_EN } from '@/lib/saju/stems-branches'
import type { SajuData, Element } from '@/types/saju'

interface YearlyRequest {
  birthDate: string       // "YYYY-MM-DD"
  birthTime: string | null
  locale: string          // "ko" | "en"
}

interface YearlyQuarter {
  period: string
  forecast: string
}

interface YearlyResponse {
  theme: string
  quarters: YearlyQuarter[]
  advice: string
}

/** 목업 연간 운세 생성 */
function generateMockYearly(sajuData: SajuData, locale: string): YearlyResponse {
  const elementName = locale === 'ko'
    ? ELEMENT_NAMES_KO[sajuData.favorableElement]
    : ELEMENT_NAMES_EN[sajuData.favorableElement]

  const dayMasterName = locale === 'ko'
    ? ELEMENT_NAMES_KO[sajuData.fourPillars.day.element]
    : ELEMENT_NAMES_EN[sajuData.fourPillars.day.element]

  if (locale === 'ko') {
    return {
      theme: `${dayMasterName}의 에너지가 꽃피는 변화의 해`,
      quarters: [
        {
          period: '1-3월',
          forecast: '새해의 시작과 함께 당신의 내면에 잠들어 있던 에너지가 깨어나기 시작합니다. 겨울 동안 준비한 계획들을 실행에 옮기기 좋은 시기입니다. 특히 2월에 중요한 만남이나 기회가 찾아올 수 있으니 열린 마음으로 맞이하세요.',
        },
        {
          period: '4-6월',
          forecast: '봄의 에너지와 함께 대인 관계가 활발해집니다. 새로운 협업이나 파트너십이 형성될 가능성이 높습니다. 재물운도 점차 상승하여 5월경 기분 좋은 소식이 있을 수 있습니다. 건강에도 신경 쓰며 규칙적인 생활을 유지하세요.',
        },
        {
          period: '7-9월',
          forecast: '올해의 전환점이 되는 시기입니다. 상반기에 쌓아온 성과를 바탕으로 더 큰 도전을 시도할 때입니다. 직감이 특히 예리해지는 시기이니, 중요한 결정에서는 머리보다 마음의 소리를 들어보세요.',
        },
        {
          period: '10-12월',
          forecast: '한 해의 마무리를 준비하는 수확의 시기입니다. 올해 노력한 것들이 결실을 맺기 시작합니다. 연말에는 가까운 사람들과의 관계가 더욱 깊어지는 따뜻한 순간들이 찾아옵니다.',
        },
      ],
      advice: `올해는 ${elementName}의 보충이 특히 중요한 해입니다. 의식적으로 ${elementName}과 관련된 활동을 생활에 포함시키세요. 무리하지 않되, 기회가 왔을 때 주저하지 않는 균형 잡힌 자세가 올해의 성공을 이끌 것입니다. 자신을 믿고, 흐름을 타세요.`,
    }
  }

  return {
    theme: `A year of transformation where ${dayMasterName} energy blossoms`,
    quarters: [
      {
        period: 'Jan-Mar',
        forecast: 'As the new year begins, dormant energy within you awakens. This is an excellent time to put plans you\'ve been nurturing into action. Watch for an important meeting or opportunity around February — greet it with an open heart.',
      },
      {
        period: 'Apr-Jun',
        forecast: 'Spring energy activates your social connections. New collaborations and partnerships are likely to form. Financial energy rises gradually, with pleasant news possible around May. Maintain regular routines to support your health.',
      },
      {
        period: 'Jul-Sep',
        forecast: 'This is the year\'s turning point. Build on first-half achievements and attempt bigger challenges. Your intuition is particularly sharp during this period — for important decisions, listen to your heart over your head.',
      },
      {
        period: 'Oct-Dec',
        forecast: 'A season of harvest as you prepare to close the year. Your efforts begin to bear fruit. The year ends with warm moments of deepening connections with those closest to you.',
      },
    ],
    advice: `This year, supplementing ${elementName} energy is especially important. Consciously include ${elementName}-related activities in your daily life. Don't overexert yourself, but when opportunity arrives, don't hesitate — this balanced approach will drive your success this year. Trust yourself, and ride the flow.`,
  }
}

export async function POST(request: NextRequest) {
  try {
    /* 인증 + 프리미엄 + Rate Limit 검사 */
    const guard = await apiGuard(request, { requirePremium: true, feature: 'yearly' })
    if (guard.error) return guard.error

    const body: YearlyRequest = await request.json()
    const { birthDate, birthTime, locale } = body

    /* 입력 검증 */
    if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      return NextResponse.json({ error: 'Invalid birthDate format (YYYY-MM-DD)' }, { status: 400 })
    }
    if (birthTime && !/^\d{2}:\d{2}$/.test(birthTime)) {
      return NextResponse.json({ error: 'Invalid birthTime format (HH:mm)' }, { status: 400 })
    }

    /* 입력값 검증 통과 → 사용량 확정 */
    await guard.confirmUsage()

    /* 1. 사주 계산 */
    const { year, month, day } = parseBirthDate(birthDate)
    const hour = birthTime ? parseBirthTime(birthTime) : undefined
    const sajuData = calculateSaju(year, month, day, hour)

    /* 2. 올해 년주 계산 */
    const currentYear = new Date().getFullYear()
    const yearPillar = getYearPillar(currentYear)

    /* 3. AI 또는 목업으로 해석 생성 */
    let result: YearlyResponse

    if (process.env.ANTHROPIC_API_KEY) {
      const { generateInterpretation } = await import('@/lib/ai/client')
      const { ORACLE_SYSTEM_PROMPT, buildYearlyFortunePrompt } = await import('@/lib/ai/prompts')

      const pillarForPrompt = {
        stem: yearPillar.stem,
        branch: yearPillar.branch,
        element: locale === 'ko'
          ? ELEMENT_NAMES_KO[yearPillar.element]
          : ELEMENT_NAMES_EN[yearPillar.element],
      }

      const userPrompt = buildYearlyFortunePrompt(sajuData, currentYear, pillarForPrompt, locale)
      const raw = await generateInterpretation(ORACLE_SYSTEM_PROMPT, userPrompt)

      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('AI 응답에서 JSON을 찾을 수 없습니다')
      }

      const parsed = JSON.parse(jsonMatch[0])
      result = {
        theme: parsed.theme,
        quarters: parsed.quarters,
        advice: parsed.advice,
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      result = generateMockYearly(sajuData, locale)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('연간 운세 API 에러:', error)
    return NextResponse.json(
      { error: 'Failed to generate yearly fortune' },
      { status: 500 }
    )
  }
}
