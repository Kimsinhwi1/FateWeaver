/* ─────────────────────────────────────────
 * 10년 대운 API — 향후 10년의 운세 흐름
 * 비유: 10년치 "운세 로드맵" — 각 해의 에너지가 사주와
 *       어떻게 만나는지 분석하여 미래의 큰 그림을 보여준다
 *
 * 프리미엄 전용: 서버에서 인증 + 구독 상태를 검증
 * ───────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server'
import { apiGuard } from '@/lib/api/guard'
import { calculateSaju } from '@/lib/saju/calculator'
import { parseBirthDate, parseBirthTime } from '@/lib/utils/date'
import { getDecadePeriods, getElementDisplayName, getRelationDisplayName } from '@/lib/saju/period'
import { ELEMENT_NAMES_KO, ELEMENT_NAMES_EN } from '@/lib/saju/stems-branches'
import type { SajuData, Element } from '@/types/saju'

interface DecadeRequest {
  birthDate: string       // "YYYY-MM-DD"
  birthTime: string | null
  locale: string          // "ko" | "en"
}

interface DecadeYearResponse {
  year: number
  keyword: string
  description: string
}

interface DecadeResponse {
  years: DecadeYearResponse[]
  overall: string
}

/** 목업 대운 생성 — AI 키 없을 때 */
function generateMockDecade(sajuData: SajuData, locale: string): DecadeResponse {
  const currentYear = new Date().getFullYear()
  const periods = getDecadePeriods(sajuData, currentYear)
  const elementName = locale === 'ko'
    ? ELEMENT_NAMES_KO[sajuData.favorableElement]
    : ELEMENT_NAMES_EN[sajuData.favorableElement]

  const keywords = locale === 'ko'
    ? ['도약', '성장', '안정', '전환', '수확', '도전', '확장', '성찰', '비상', '완성']
    : ['Leap', 'Growth', 'Stability', 'Shift', 'Harvest', 'Challenge', 'Expansion', 'Reflection', 'Soar', 'Completion']

  const years: DecadeYearResponse[] = periods.map((p, idx) => ({
    year: p.year,
    keyword: keywords[idx],
    description: locale === 'ko'
      ? `${p.year}년은 ${getElementDisplayName(p.pillar.element, 'ko')} 에너지가 흐르는 해입니다. ${getRelationDisplayName(p.relation, 'ko')}의 기운이 당신의 삶에 영향을 미칩니다.`
      : `${p.year} carries the energy of ${getElementDisplayName(p.pillar.element, 'en')}. ${getRelationDisplayName(p.relation, 'en')} will influence your life this year.`,
  }))

  const overall = locale === 'ko'
    ? `앞으로 10년간 당신의 사주는 ${elementName}의 보충을 받으며 전체적으로 상승하는 흐름을 보입니다. 처음 3년은 기반을 다지는 시기이고, 중반 4년은 도전과 성장이 공존하며, 마지막 3년은 그동안 쌓아온 것들이 결실을 맺는 기간입니다.\n\n특히 전환기에 해당하는 해에는 새로운 기회가 열리지만, 동시에 과거의 익숙함을 내려놓는 용기가 필요합니다. 변화를 두려워하지 마세요. 당신의 사주가 가진 ${elementName}의 에너지가 안전한 길을 안내할 것입니다.\n\n10년의 여정에서 가장 중요한 것은 흐름에 저항하지 않는 것입니다. 물이 산을 돌아가듯, 때로는 우회가 가장 빠른 길이 됩니다.`
    : `Over the next decade, your birth chart calls for more ${elementName} energy, creating an overall upward trajectory. The first three years build your foundation, the middle four years bring growth through challenges, and the final three years bear the fruits of your efforts.\n\nDuring transition years, new opportunities will open — but you'll need courage to release old comforts. Embrace change without fear. The ${elementName} energy within your chart will guide you along a safe path.\n\nThe most important lesson of these ten years: don't resist the flow. Like water finding its way around a mountain, sometimes the detour becomes the shortest path.`

  return { years, overall }
}

export async function POST(request: NextRequest) {
  try {
    /* 인증 + 프리미엄 + Rate Limit 검사 */
    const guard = await apiGuard(request, { requirePremium: true, feature: 'decade' })
    if (guard.error) return guard.error

    const body: DecadeRequest = await request.json()
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

    /* 2. 10년 대운 기간 계산 */
    const currentYear = new Date().getFullYear()
    const decadePeriods = getDecadePeriods(sajuData, currentYear)

    /* 3. AI 또는 목업으로 해석 생성 */
    let result: DecadeResponse

    if (process.env.ANTHROPIC_API_KEY) {
      const { generateInterpretation } = await import('@/lib/ai/client')
      const { ORACLE_SYSTEM_PROMPT, buildDecadeFortunePrompt } = await import('@/lib/ai/prompts')

      const periodsForPrompt = decadePeriods.map((p) => ({
        year: p.year,
        element: getElementDisplayName(p.pillar.element, locale),
        relation: getRelationDisplayName(p.relation, locale),
      }))

      const userPrompt = buildDecadeFortunePrompt(sajuData, periodsForPrompt, locale)
      const raw = await generateInterpretation(ORACLE_SYSTEM_PROMPT, userPrompt)

      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('AI 응답에서 JSON을 찾을 수 없습니다')
      }

      const parsed = JSON.parse(jsonMatch[0])
      result = {
        years: parsed.years,
        overall: parsed.overall,
      }
    } else {
      /* 목업 모드 — AI 없이도 전체 플로우 확인 가능 */
      await new Promise((resolve) => setTimeout(resolve, 1500))
      result = generateMockDecade(sajuData, locale)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('10년 대운 API 에러:', error)
    return NextResponse.json(
      { error: 'Failed to generate decade fortune' },
      { status: 500 }
    )
  }
}
