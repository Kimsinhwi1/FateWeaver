/* ─────────────────────────────────────────
 * 오늘의 운세 API — 사주 + 별자리 기반 일일 운세
 * 비유: 매일 아침 배달되는 "맞춤형 운세 신문"
 *
 * 캐싱 전략:
 *   같은 생년월일 + 같은 날짜 = 같은 운세를 반환
 *   → API 비용 절감 + 빠른 응답
 *   Supabase 미설정 시 캐시 없이 매번 생성 (개발용)
 * ───────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server'
import { calculateSaju } from '@/lib/saju/calculator'
import { parseBirthDate, parseBirthTime, getZodiacSign } from '@/lib/utils/date'
import { ELEMENT_NAMES_KO, ELEMENT_NAMES_EN } from '@/lib/saju/stems-branches'
import type { SajuData, Element } from '@/types/saju'

interface DailyFortuneRequest {
  birthDate: string       // "YYYY-MM-DD"
  birthTime: string | null
  locale: string          // "ko" | "en"
}

interface DailyFortuneResponse {
  fortune: string
  luckyColor: string
  luckyNumber: number
  moodScore: number
  zodiacSign: string
  cached: boolean
}

/** 별자리 이름 매핑 — 사용자에게 보여줄 이름 */
const ZODIAC_NAMES_KO: Record<string, string> = {
  aries: '양자리', taurus: '황소자리', gemini: '쌍둥이자리',
  cancer: '게자리', leo: '사자자리', virgo: '처녀자리',
  libra: '천칭자리', scorpio: '전갈자리', sagittarius: '사수자리',
  capricorn: '염소자리', aquarius: '물병자리', pisces: '물고기자리',
}

const ZODIAC_NAMES_EN: Record<string, string> = {
  aries: 'Aries', taurus: 'Taurus', gemini: 'Gemini',
  cancer: 'Cancer', leo: 'Leo', virgo: 'Virgo',
  libra: 'Libra', scorpio: 'Scorpio', sagittarius: 'Sagittarius',
  capricorn: 'Capricorn', aquarius: 'Aquarius', pisces: 'Pisces',
}

/**
 * 목업 운세 생성 — Claude API 키가 없을 때 사용
 * 실제 사주 데이터를 기반으로 그럴듯한 운세를 생성
 */
function generateMockFortune(
  sajuData: SajuData,
  zodiacSign: string,
  locale: string
): DailyFortuneResponse {
  const elementName = locale === 'ko'
    ? ELEMENT_NAMES_KO[sajuData.favorableElement]
    : ELEMENT_NAMES_EN[sajuData.favorableElement]

  const dayMasterElement = sajuData.fourPillars.day.element
  const dayMasterName = locale === 'ko'
    ? ELEMENT_NAMES_KO[dayMasterElement]
    : ELEMENT_NAMES_EN[dayMasterElement]

  const zodiacName = locale === 'ko'
    ? ZODIAC_NAMES_KO[zodiacSign]
    : ZODIAC_NAMES_EN[zodiacSign]

  // 럭키 컬러 — 용신 오행 기반
  const luckyColorMap: Record<Element, string> = {
    wood: 'emerald', fire: 'coral', earth: 'amber',
    metal: 'silver', water: 'navy',
  }

  const fortune = locale === 'ko'
    ? `오늘, ${zodiacName}의 에너지가 당신의 ${dayMasterName} 기운과 흥미로운 조화를 이룹니다. 평소보다 직감이 날카로워지는 하루가 될 것입니다. 특히 오전 중에 떠오르는 아이디어를 놓치지 마세요.\n\n대인 관계에서 작은 변화의 바람이 불고 있습니다. 오랫동안 연락하지 못했던 사람에게서 소식이 올 수 있습니다. 그 연결 속에 숨겨진 기회가 있습니다.\n\n오늘의 행동 제안: ${elementName}의 에너지를 의식적으로 가까이 하세요. 자연 속을 걷거나, 깊은 대화를 나누거나, 창의적인 작업에 몰두하는 것이 운의 흐름을 타는 열쇠입니다.`
    : `Today, the energy of ${zodiacName} creates an intriguing harmony with your ${dayMasterName} essence. Your intuition will be sharper than usual — pay special attention to ideas that come to you before noon.\n\nA gentle wind of change blows through your relationships. You may hear from someone you've lost touch with. Hidden within that connection lies an unexpected opportunity.\n\nToday's action tip: Consciously embrace ${elementName} energy. Whether through a walk in nature, a meaningful conversation, or immersing yourself in creative work — this is your key to riding today's currents.`

  return {
    fortune,
    luckyColor: luckyColorMap[sajuData.favorableElement],
    luckyNumber: Math.floor(Math.random() * 99) + 1,
    moodScore: Math.floor(Math.random() * 4) + 6, // 6~9 — 목업은 긍정적으로
    zodiacSign,
    cached: false,
  }
}

/**
 * Supabase 캐시 확인 — 같은 생년월일 + 오늘 날짜면 캐시 히트
 * Supabase 미설정 시 null 반환 (캐시 스킵)
 *
 * 컬럼 매핑: DB 'content' → 응답 'fortune'
 */
async function checkCache(birthDate: string, today: string): Promise<DailyFortuneResponse | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null // Supabase 미설정 → 캐시 스킵
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data } = await supabase
      .from('daily_fortunes')
      .select('content, lucky_color, lucky_number, mood_score, zodiac_sign')
      .eq('birth_date', birthDate)
      .eq('fortune_date', today)
      .single()

    if (data) {
      return {
        fortune: data.content,
        luckyColor: data.lucky_color,
        luckyNumber: data.lucky_number,
        moodScore: data.mood_score,
        zodiacSign: data.zodiac_sign,
        cached: true,
      }
    }
  } catch {
    // 캐시 조회 실패 → 새로 생성하면 됨
  }

  return null
}

/**
 * Supabase에 운세 저장 — 다음 같은 요청 시 캐시 히트
 * 저장 실패해도 사용자에게 운세는 반환 (비동기 저장)
 *
 * 컬럼 매핑: fortune → DB 'content'
 * user_id: 로그인 유저면 히스토리 조회용으로 함께 저장
 */
async function saveToCache(
  birthDate: string,
  today: string,
  zodiacSign: string,
  result: DailyFortuneResponse,
  userId?: string | null
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return // Supabase 미설정 → 저장 스킵
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    await supabase.from('daily_fortunes').upsert({
      birth_date: birthDate,
      fortune_date: today,
      content: result.fortune,
      lucky_color: result.luckyColor,
      lucky_number: result.luckyNumber,
      mood_score: result.moodScore,
      zodiac_sign: zodiacSign,
      ...(userId ? { user_id: userId } : {}),
    }, {
      onConflict: 'birth_date,fortune_date',
    })
  } catch {
    // 저장 실패해도 응답에는 영향 없음
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: DailyFortuneRequest = await request.json()
    const { birthDate, birthTime, locale } = body

    // 1. 생년월일 파싱 + 사주 계산
    const { year, month, day } = parseBirthDate(birthDate)
    const hour = birthTime ? parseBirthTime(birthTime) : undefined
    const sajuData = calculateSaju(year, month, day, hour)

    // 2. 별자리 계산
    const zodiacSign = getZodiacSign(month, day)

    // 3. 오늘 날짜 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0]

    // 4. 로그인 유저 확인 (히스토리 저장용, 실패해도 계속 진행)
    let userId: string | null = null
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id ?? null
      } catch {
        // 비로그인 또는 Auth 실패 → userId null로 계속
      }
    }

    // 5. 캐시 확인 — 같은 생년월일 + 오늘이면 저장된 운세 반환
    const cached = await checkCache(birthDate, today)
    if (cached) {
      return NextResponse.json(cached)
    }

    // 6. 운세 생성 — API 키 있으면 Claude, 없으면 목업
    let result: DailyFortuneResponse

    if (process.env.ANTHROPIC_API_KEY) {
      const { generateInterpretation } = await import('@/lib/ai/client')
      const { ORACLE_SYSTEM_PROMPT, buildDailyFortunePrompt } = await import('@/lib/ai/prompts')

      const userPrompt = buildDailyFortunePrompt(sajuData, zodiacSign, today, locale)
      const raw = await generateInterpretation(ORACLE_SYSTEM_PROMPT, userPrompt)

      // JSON 파싱 — AI 응답에서 JSON 추출
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('AI 응답에서 JSON을 찾을 수 없습니다')
      }

      const parsed = JSON.parse(jsonMatch[0])
      result = {
        fortune: parsed.fortune,
        luckyColor: parsed.luckyColor,
        luckyNumber: parsed.luckyNumber,
        moodScore: parsed.moodScore,
        zodiacSign,
        cached: false,
      }
    } else {
      // 목업 모드 — AI 없이도 전체 플로우 확인 가능
      await new Promise((resolve) => setTimeout(resolve, 1000))
      result = generateMockFortune(sajuData, zodiacSign, locale)
    }

    // 7. 캐시 저장 (비동기 — 실패해도 무관, 로그인 시 user_id 포함)
    saveToCache(birthDate, today, zodiacSign, result, userId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('오늘의 운세 API 에러:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily fortune' },
      { status: 500 }
    )
  }
}
