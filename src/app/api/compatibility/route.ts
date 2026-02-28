/* ─────────────────────────────────────────
 * 궁합 분석 API — 두 사람의 사주를 비교 + AI 해석
 * 비유: 두 사람의 "영혼 지도"를 겹쳐놓고 어디가 맞고 어디가 다른지 분석
 *
 * 흐름:
 *   1. 두 사람의 생년월일시 수신
 *   2. 각각 사주 계산 (calculateSaju)
 *   3. 궁합 분석 (analyzeCompatibility)
 *   4. AI 해석 (Claude) 또는 목업 해석
 *   5. 결과 반환
 * ───────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server'
import { calculateSaju } from '@/lib/saju/calculator'
import { parseBirthDate, parseBirthTime } from '@/lib/utils/date'
import { analyzeCompatibility } from '@/lib/compatibility/analyzer'
import type { CompatibilityResult } from '@/lib/compatibility/analyzer'
import type { SajuData, Element } from '@/types/saju'
import { ELEMENT_NAMES_KO, ELEMENT_NAMES_EN } from '@/lib/saju/stems-branches'

interface CompatibilityRequest {
  person1: {
    birthDate: string       // "YYYY-MM-DD"
    birthTime: string | null
  }
  person2: {
    birthDate: string
    birthTime: string | null
  }
  locale: string            // "ko" | "en"
}

interface CompatibilityResponse {
  score: number
  dayMasterRelation: string
  person1Element: Element
  person2Element: Element
  elementSynergy: number
  strengths: string[]
  challenges: string[]
  interpretation: string
}

/**
 * 목업 궁합 해석 — Claude API 키가 없을 때 사용
 * 실제 분석 결과를 기반으로 자연어 해석을 생성
 */
function generateMockInterpretation(
  saju1: SajuData,
  saju2: SajuData,
  result: CompatibilityResult,
  locale: string
): string {
  const el1Name = locale === 'ko'
    ? ELEMENT_NAMES_KO[result.person1Element]
    : ELEMENT_NAMES_EN[result.person1Element]
  const el2Name = locale === 'ko'
    ? ELEMENT_NAMES_KO[result.person2Element]
    : ELEMENT_NAMES_EN[result.person2Element]

  if (locale === 'ko') {
    return `두 사람의 에너지가 만나는 순간, 흥미로운 흐름이 감지됩니다. ${el1Name}의 기운을 지닌 분과 ${el2Name}의 에너지를 가진 분이 함께할 때, 마치 계절이 바뀌듯 자연스러운 변화의 바람이 불어옵니다.

이 관계에서 가장 빛나는 점은 서로의 부족한 에너지를 채워줄 수 있다는 것입니다. 한 사람이 가진 결단력을 다른 사람의 유연함이 부드럽게 감싸주고, 때로는 그 반대의 역할이 자연스럽게 일어납니다. 이것은 의식적으로 만들어낸 것이 아니라, 두 사람의 타고난 기운이 만들어내는 조화입니다.

물론 모든 관계에는 성장을 위한 과제가 있습니다. 서로의 에너지가 부딪히는 순간이 찾아올 수 있지만, 이는 갈등이 아니라 더 깊은 이해로 나아가는 관문입니다. 그 순간을 두려워하지 마세요.

오늘의 제안: 상대방의 장점을 하나 떠올리고, 그것을 직접 말로 전해보세요. 작은 인정의 말 한마디가 두 사람의 에너지 흐름을 더욱 좋은 방향으로 이끌어줄 것입니다.`
  }

  return `When these two energies meet, an intriguing current emerges. The one carrying ${el1Name} energy and the other with ${el2Name} essence create a dynamic that shifts like changing seasons — natural, inevitable, and full of potential.

What shines brightest in this connection is the ability to complement each other's missing pieces. One person's decisiveness is gently embraced by the other's flexibility, and at times, these roles naturally reverse. This isn't something manufactured — it's the organic harmony of two innate energies meeting.

Every relationship carries challenges that serve as catalysts for growth. There may be moments when your energies collide, but these are not conflicts — they are gateways to deeper understanding. Don't shy away from those moments.

Today's suggestion: Think of one quality you admire in the other person and express it directly. A single word of genuine recognition can redirect the energy flow between you toward something truly beautiful.`
}

export async function POST(request: NextRequest) {
  try {
    const body: CompatibilityRequest = await request.json()
    const { person1, person2, locale } = body

    /* 입력 검증 — 두 사람의 생년월일 필수 */
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    const timeRegex = /^\d{2}:\d{2}$/
    if (!person1?.birthDate || !dateRegex.test(person1.birthDate)) {
      return NextResponse.json({ error: 'Invalid person1.birthDate format (YYYY-MM-DD)' }, { status: 400 })
    }
    if (!person2?.birthDate || !dateRegex.test(person2.birthDate)) {
      return NextResponse.json({ error: 'Invalid person2.birthDate format (YYYY-MM-DD)' }, { status: 400 })
    }
    if (person1.birthTime && !timeRegex.test(person1.birthTime)) {
      return NextResponse.json({ error: 'Invalid person1.birthTime format (HH:mm)' }, { status: 400 })
    }
    if (person2.birthTime && !timeRegex.test(person2.birthTime)) {
      return NextResponse.json({ error: 'Invalid person2.birthTime format (HH:mm)' }, { status: 400 })
    }

    /* 1. 두 사람의 사주 각각 계산 */
    const { year: y1, month: m1, day: d1 } = parseBirthDate(person1.birthDate)
    const h1 = person1.birthTime ? parseBirthTime(person1.birthTime) : undefined
    const saju1: SajuData = calculateSaju(y1, m1, d1, h1)

    const { year: y2, month: m2, day: d2 } = parseBirthDate(person2.birthDate)
    const h2 = person2.birthTime ? parseBirthTime(person2.birthTime) : undefined
    const saju2: SajuData = calculateSaju(y2, m2, d2, h2)

    /* 2. 궁합 분석 (결정론적 — AI 불필요) */
    const result = analyzeCompatibility(saju1, saju2)

    /* 3. AI 해석 또는 목업 */
    let interpretation: string

    if (process.env.ANTHROPIC_API_KEY) {
      const { generateInterpretation } = await import('@/lib/ai/client')
      const { ORACLE_SYSTEM_PROMPT, buildCompatibilityPrompt } = await import('@/lib/ai/prompts')

      const userPrompt = buildCompatibilityPrompt(saju1, saju2, result, locale)
      interpretation = await generateInterpretation(ORACLE_SYSTEM_PROMPT, userPrompt)
    } else {
      /* 목업 모드 — AI 없이도 전체 플로우 확인 가능 */
      await new Promise((resolve) => setTimeout(resolve, 1500))
      interpretation = generateMockInterpretation(saju1, saju2, result, locale)
    }

    /* 4. 응답 반환 */
    const response: CompatibilityResponse = {
      score: result.score,
      dayMasterRelation: result.dayMasterRelation,
      person1Element: result.person1Element,
      person2Element: result.person2Element,
      elementSynergy: result.elementSynergy,
      strengths: result.strengths,
      challenges: result.challenges,
      interpretation,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('궁합 분석 API 에러:', error)
    return NextResponse.json(
      { error: 'Failed to analyze compatibility' },
      { status: 500 }
    )
  }
}
