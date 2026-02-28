/* ─────────────────────────────────────────
 * 타로 리딩 API 라우트
 * API 키가 없으면 목업 해석을 반환하여 프론트엔드 개발이 가능하다
 * ───────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server'
import { drawCards } from '@/lib/tarot/draw'
import { calculateSaju } from '@/lib/saju/calculator'
import { parseBirthDate, parseBirthTime } from '@/lib/utils/date'
import { ELEMENT_NAMES_KO, ELEMENT_NAMES_EN } from '@/lib/saju/stems-branches'
import type { DrawnCard, SpreadType } from '@/types/tarot'
import type { SajuData, Element } from '@/types/saju'

interface ReadingRequest {
  birthDate: string
  birthTime: string | null
  birthTimezone: string
  gender?: 'male' | 'female'
  locale: string
  spreadType: SpreadType
  question?: string
}

/**
 * 목업 해석 생성 — Claude API 키가 없을 때 사용
 * 실제 카드 + 사주 데이터를 기반으로 그럴듯한 해석을 생성
 */
function generateMockInterpretation(
  cards: DrawnCard[],
  sajuData: SajuData,
  locale: string
): string {
  const elementName = locale === 'ko'
    ? ELEMENT_NAMES_KO[sajuData.favorableElement]
    : ELEMENT_NAMES_EN[sajuData.favorableElement]

  const dayMasterElement = sajuData.fourPillars.day.element
  const dayMasterName = locale === 'ko'
    ? ELEMENT_NAMES_KO[dayMasterElement]
    : ELEMENT_NAMES_EN[dayMasterElement]

  const [past, present, future] = cards

  if (locale === 'ko') {
    return `${past.card.nameKo} 카드가 당신의 과거에서 조용히 속삭이고 있습니다. ${past.isReversed ? '역방향으로 나타난 이 카드는 아직 풀리지 않은 과거의 매듭이 있음을 암시합니다.' : '이 카드의 에너지는 당신이 지나온 길에 단단한 기반이 있었음을 말해줍니다.'} 당신의 사주에서 ${dayMasterName}의 기운을 가진 사람으로서, 이 과거의 흐름은 자연스러운 것이었습니다.

현재, ${present.card.nameKo} 카드가 당신 앞에 펼쳐져 있습니다. ${present.isReversed ? '역방향의 이 카드는 지금 내면에서 조용한 변화가 일어나고 있음을 보여줍니다.' : '정방향의 이 카드는 지금이야말로 당신의 에너지가 올바른 방향으로 흐르고 있다는 신호입니다.'} 흥미롭게도, 당신의 오행 분포를 보면 ${elementName}의 에너지가 부족합니다. 이 카드는 바로 그 균형을 찾으라는 메시지이기도 합니다.

미래를 향해 ${future.card.nameKo} 카드가 길을 비추고 있습니다. ${future.isReversed ? '이 카드가 역방향으로 나타난 것은 미래가 당신의 예상과는 다른 방식으로 펼쳐질 수 있음을 의미합니다. 하지만 걱정하지 마세요 — 예상 밖의 길이 오히려 당신에게 필요한 ${elementName}의 에너지를 가져다줄 것입니다.' : '이 카드는 밝은 전망을 보여줍니다. 특히 당신처럼 ${dayMasterName}의 기운을 타고난 사람에게, 이 카드의 에너지는 강력한 순풍이 될 것입니다.'}

이번 주, 일상에서 ${elementName}의 에너지를 의식적으로 찾아보세요. 작은 변화가 큰 흐름을 만들어낼 것입니다.`
  }

  return `The ${past.card.name} card whispers from your past. ${past.isReversed ? 'Appearing reversed, it suggests unresolved threads still weaving through your story.' : 'Its energy tells of a solid foundation upon which your journey has been built.'} As someone whose day master carries the essence of ${dayMasterName}, this flow was a natural part of your path.

In the present, the ${present.card.name} card spreads before you. ${present.isReversed ? 'Reversed, it reveals a quiet transformation unfolding within.' : 'Upright, it signals your energy is flowing in the right direction.'} Intriguingly, your elemental balance shows a need for more ${elementName} energy. This card carries that very message of finding equilibrium.

Looking ahead, the ${future.card.name} card illuminates the path forward. ${future.isReversed ? 'Its reversed position suggests the future may unfold differently than expected. But take heart — the unexpected path may bring exactly the ' + elementName + ' energy you need.' : 'This card paints a promising picture. For someone born with the essence of ' + dayMasterName + ', its energy becomes a powerful tailwind.'}

This week, consciously seek out ${elementName} energy in your daily life. Small shifts can create powerful currents of change.`
}

/**
 * 타로 리딩을 DB에 저장 — 로그인 유저의 히스토리 기록
 * 비유: "타로 일기장에 기록" — 나중에 다시 볼 수 있도록
 *
 * 비동기 저장: 실패해도 사용자 응답에는 영향 없음
 */
async function saveReading(
  readingId: string,
  cards: DrawnCard[],
  interpretation: string,
  spreadType?: string,
  question?: string
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return // Supabase 미설정 → 저장 스킵
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    /* 로그인 유저만 저장 — 비로그인이면 히스토리 불필요 */
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('tarot_readings').insert({
      id: readingId,
      user_id: user.id,
      spread_type: spreadType ?? 'daily_3card',
      question: question ?? null,
      cards,           // DrawnCard[] → JSONB 자동 변환
      interpretation,
    })
  } catch {
    // 저장 실패해도 응답에는 영향 없음 — 다음에 다시 시도하면 됨
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ReadingRequest = await request.json()
    const { birthDate, birthTime, locale, question } = body

    /* 입력 검증 — 필수 필드 + 형식 확인 */
    if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      return NextResponse.json({ error: 'Invalid birthDate format (YYYY-MM-DD)' }, { status: 400 })
    }
    if (birthTime && !/^\d{2}:\d{2}$/.test(birthTime)) {
      return NextResponse.json({ error: 'Invalid birthTime format (HH:mm)' }, { status: 400 })
    }

    // 1. 생년월일 파싱
    const { year, month, day } = parseBirthDate(birthDate)
    const hour = birthTime ? parseBirthTime(birthTime) : undefined

    // 2. 사주 계산
    const sajuData = calculateSaju(year, month, day, hour)

    // 3. 타로 카드 3장 뽑기
    const cards = drawCards(3)

    // 4. 해석 생성 — API 키 있으면 Claude, 없으면 목업
    let interpretation: string

    if (process.env.ANTHROPIC_API_KEY) {
      const { generateInterpretation } = await import('@/lib/ai/client')
      const { ORACLE_SYSTEM_PROMPT, buildTarotReadingPrompt } = await import('@/lib/ai/prompts')
      const userPrompt = buildTarotReadingPrompt(cards, sajuData, locale, question)
      interpretation = await generateInterpretation(ORACLE_SYSTEM_PROMPT, userPrompt)
    } else {
      // 목업 모드 — AI 없이도 전체 플로우 확인 가능
      await new Promise((resolve) => setTimeout(resolve, 1500))
      interpretation = generateMockInterpretation(cards, sajuData, locale)
    }

    const readingId = crypto.randomUUID()

    // 5. DB 저장 (비동기 — 로그인 유저만, 실패해도 무관)
    saveReading(readingId, cards, interpretation, body.spreadType, question).catch(() => {})

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
