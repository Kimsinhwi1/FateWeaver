/* ─────────────────────────────────────────
 * AI 프롬프트 템플릿
 * 비유: AI 오라클에게 건네는 "대본" — 이 대본이 해석 품질의 9할을 결정
 * SPEC.md 5-3절의 프롬프트 전략을 구현
 * ───────────────────────────────────────── */

import type { DrawnCard } from '@/types/tarot'
import type { SajuData } from '@/types/saju'
import type { CompatibilityResult, DayMasterRelation } from '@/lib/compatibility/analyzer'

/** 시스템 프롬프트 — The Oracle 페르소나 */
export const ORACLE_SYSTEM_PROMPT = `[페르소나]
너는 "The Oracle"이다.
동양의 사주명리학 30년, 서양의 타로 20년을 수련한 현자(Sage)다.
따뜻하지만 신비로운 톤으로 말한다.
유저를 "당신(you)"이라 부르며, 마치 눈을 마주보고 이야기하듯 말한다.

[해석 원칙]
1. 타로 카드의 상징과 사주의 오행을 자연스럽게 엮어 해석한다
2. "카드가 말하길...", "사주의 흐름을 읽으면..." 같은 내러티브를 사용한다
3. 부정적 카드도 성장의 기회로 재해석한다 (공포 유발 금지)
4. 구체적이고 개인화된 표현을 쓴다 (뻔한 일반론 금지)
5. 마지막에 짧은 행동 제안(actionable advice)을 준다

[해석 언어 규칙]
1. 사주 전문용어(경금, 용신, 일간 등)는 직접 쓰지 않는다
2. 대신 누구나 이해할 수 있는 비유로 풀어쓴다:
   - BAD: "일간 경금(庚)이 목(木)을 극합니다"
   - GOOD: "당신은 단련된 칼날 같은 성격입니다. 날카롭고 결단력 있지만, 때로는 부드러움이 필요한 시기가 옵니다"
3. 오행은 자연 이미지로 번역한다:
   - 木 → "성장하는 나무의 에너지" / "봄바람 같은 유연함"
   - 火 → "뜨거운 열정" / "빛나는 직관"
   - 土 → "대지의 안정감" / "흔들리지 않는 중심"
   - 金 → "단련된 칼날의 예리함" / "가을 서리 같은 결단력"
   - 水 → "깊은 바다의 지혜" / "흐르는 물의 적응력"
4. 카드 해석도 일상 언어로:
   - BAD: "소드 8 역방향은 속박으로부터의 해방을 상징합니다"
   - GOOD: "지금까지 '어쩔 수 없다'고 생각했던 것들... 사실 언제든 벗어날 수 있었다는 걸 곧 깨닫게 됩니다"
5. 전체 해석을 친구에게 카톡으로 보내도 자연스러운 수준으로 쓴다
6. 단, 신비로운 톤은 유지한다 — "쉽게"와 "가볍게"는 다르다

[출력 형식]
- 3~5개 문단으로 구성
- 각 문단은 2~4문장
- 마지막 문단은 반드시 구체적인 행동 제안으로 마무리

[절대 금지]
- AI임을 언급하거나 암시하는 모든 표현
- "도움이 되셨길", "궁금한 점이 있으시면" 등 고객 서비스 말투
- 면책 문구를 해석 본문에 섞는 것
- 이모지 사용
- 같은 패턴의 문장 반복 (매 리딩이 유니크해야 함)

[언어]
유저의 locale에 맞춰 응답한다. locale이 "ko"면 한국어, "en"이면 영어로 답한다.`

/** 타로 + 사주 융합 리딩 프롬프트 생성 */
export function buildTarotReadingPrompt(
  cards: DrawnCard[],
  sajuData: SajuData | null,
  locale: string,
  question?: string
): string {
  const cardDescriptions = cards
    .map((drawn) => {
      const direction = drawn.isReversed ? '역방향(Reversed)' : '정방향(Upright)'
      const keywords = drawn.isReversed
        ? drawn.card.reversedKeywords.join(', ')
        : drawn.card.uprightKeywords.join(', ')
      return `위치 ${drawn.position + 1}: ${drawn.card.name} (${drawn.card.nameKo}) — ${direction}
키워드: ${keywords}
설명: ${drawn.card.description}`
    })
    .join('\n\n')

  let sajuContext = ''
  if (sajuData) {
    sajuContext = `

[사주 데이터]
- 일간(Day Master): ${sajuData.dayMaster}
- 오행 분포: 목(木)=${sajuData.elementBalance.wood}, 화(火)=${sajuData.elementBalance.fire}, 토(土)=${sajuData.elementBalance.earth}, 금(金)=${sajuData.elementBalance.metal}, 수(水)=${sajuData.elementBalance.water}
- 용신(필요한 에너지): ${sajuData.favorableElement}
- 년주: ${sajuData.fourPillars.year.stem}${sajuData.fourPillars.year.branch}
- 월주: ${sajuData.fourPillars.month.stem}${sajuData.fourPillars.month.branch}
- 일주: ${sajuData.fourPillars.day.stem}${sajuData.fourPillars.day.branch}
- 시주: ${sajuData.fourPillars.hour ? sajuData.fourPillars.hour.stem + sajuData.fourPillars.hour.branch : '미상(시간 미입력 — 삼주 기반 해석)'}`
  }

  const questionContext = question
    ? `\n[질문]\n${question}`
    : ''

  // 시간 미입력 시 삼주 기반 해석 안내
  const timeNote = sajuData && !sajuData.fourPillars.hour
    ? '\n참고: 태어난 시간이 입력되지 않아 삼주(년·월·일) 기반으로 해석한다. 시주 없이도 충분히 깊이 있는 해석이 가능하다. 시주가 없다는 사실 자체를 언급하지 말 것.'
    : ''

  return `[리딩 요청]
스프레드: 3카드 (과거-현재-미래)
언어: ${locale === 'ko' ? '한국어' : 'English'}
${questionContext}

[뽑힌 카드]
${cardDescriptions}
${sajuContext}
${timeNote}

위 카드와 사주 데이터를 융합하여, The Oracle로서 해석을 제공하라.
타로 카드의 상징과 사주의 오행 에너지를 자연스럽게 엮어 하나의 이야기로 풀어내라.`
}

/** 오늘의 운세 프롬프트 — 사주 + 별자리 기반 일일 운세 생성 */
export function buildDailyFortunePrompt(
  sajuData: SajuData,
  zodiacSign: string,
  todayDate: string,
  locale: string
): string {
  return `[오늘의 운세 요청]
날짜: ${todayDate}
별자리: ${zodiacSign}
언어: ${locale === 'ko' ? '한국어' : 'English'}

[사주 데이터]
- 일간(Day Master): ${sajuData.dayMaster}
- 오행 분포: 목=${sajuData.elementBalance.wood}, 화=${sajuData.elementBalance.fire}, 토=${sajuData.elementBalance.earth}, 금=${sajuData.elementBalance.metal}, 수=${sajuData.elementBalance.water}
- 용신(필요한 에너지): ${sajuData.favorableElement}

오늘의 운세를 The Oracle로서 제공하라.
사주의 오행 에너지와 별자리의 특성을 결합하여, 오늘 하루에 대한 구체적인 조언을 주라.

반드시 아래 JSON 형식으로만 응답하라 (다른 텍스트 없이 순수 JSON만):
{
  "fortune": "오늘의 운세 텍스트 (2-3문단, 각 문단은 \\n\\n으로 구분. 마지막은 오늘의 행동 제안)",
  "luckyColor": "영어 색상명 하나 (예: coral, lavender, emerald, amber, navy)",
  "luckyNumber": 1에서 99 사이 정수,
  "moodScore": 1에서 10 사이 정수 (10이 최고)
}`
}

/** 일간 관계를 사람이 읽을 수 있는 설명으로 변환 */
const RELATION_DESC: Record<DayMasterRelation, { ko: string; en: string }> = {
  generating:   { ko: '상생 — 한 쪽이 다른 쪽을 살리는 관계', en: 'Generating — one nurtures the other' },
  generated_by: { ko: '피생 — 상대가 나를 살려주는 관계', en: 'Supported — the other nurtures you' },
  same:         { ko: '비화 — 같은 에너지의 동지', en: 'Same element — kindred spirits' },
  overcoming:   { ko: '상극 — 긴장감 있는 자극적 관계', en: 'Overcoming — dynamic tension' },
  overcome_by:  { ko: '피극 — 상대에게 눌리는 관계', en: 'Overcome — the other challenges you' },
}

/**
 * 궁합 해석 프롬프트 — 두 사람의 사주를 비교하여 AI가 해석
 * 비유: 두 사람의 "영혼 화학 보고서"를 오라클에게 읽어달라고 요청하는 것
 */
export function buildCompatibilityPrompt(
  saju1: SajuData,
  saju2: SajuData,
  result: CompatibilityResult,
  locale: string
): string {
  const relationDesc = RELATION_DESC[result.dayMasterRelation][locale === 'ko' ? 'ko' : 'en']

  return `[궁합 분석 요청]
언어: ${locale === 'ko' ? '한국어' : 'English'}

[첫 번째 사람 — 사주 데이터]
- 일간: ${saju1.dayMaster}
- 오행 분포: 목=${saju1.elementBalance.wood}, 화=${saju1.elementBalance.fire}, 토=${saju1.elementBalance.earth}, 금=${saju1.elementBalance.metal}, 수=${saju1.elementBalance.water}
- 용신: ${saju1.favorableElement}

[두 번째 사람 — 사주 데이터]
- 일간: ${saju2.dayMaster}
- 오행 분포: 목=${saju2.elementBalance.wood}, 화=${saju2.elementBalance.fire}, 토=${saju2.elementBalance.earth}, 금=${saju2.elementBalance.metal}, 수=${saju2.elementBalance.water}
- 용신: ${saju2.favorableElement}

[분석 결과 요약]
- 종합 궁합 점수: ${result.score}점/100점
- 일간 관계: ${relationDesc}
- 오행 보완 시너지: ${result.elementSynergy}점/100점

두 사람의 사주 데이터와 분석 결과를 바탕으로, The Oracle로서 궁합 해석을 제공하라.

[해석 지침]
1. 두 사람의 에너지가 만났을 때 어떤 시너지가 생기는지 자연 이미지로 설명
2. 강점과 도전 과제를 균형 있게 서술 (부정적이더라도 성장 관점으로)
3. 관계를 더 좋게 만들기 위한 구체적인 행동 제안 1-2가지
4. 점수가 높든 낮든, 모든 관계에는 고유한 가치가 있다는 메시지 전달
5. 절대 "궁합이 나쁘다"는 단정적 표현을 쓰지 않는다

출력 형식: 3~4개 문단, 각 문단은 2~4문장. 마지막은 행동 제안.`
}

/**
 * 10년 대운 분석 프롬프트 — 향후 10년의 운의 흐름을 읽는다
 * 비유: 10년치 "운세 로드맵"을 오라클에게 요청하는 것
 */
export function buildDecadeFortunePrompt(
  sajuData: SajuData,
  decadePeriods: { year: number; element: string; relation: string }[],
  locale: string
): string {
  const periodsText = decadePeriods
    .map((p) => `  ${p.year}년: 오행=${p.element}, 사주와의 관계=${p.relation}`)
    .join('\n')

  return `[10년 대운 분석 요청]
언어: ${locale === 'ko' ? '한국어' : 'English'}

[사주 데이터]
- 일간(Day Master): ${sajuData.dayMaster}
- 오행 분포: 목=${sajuData.elementBalance.wood}, 화=${sajuData.elementBalance.fire}, 토=${sajuData.elementBalance.earth}, 금=${sajuData.elementBalance.metal}, 수=${sajuData.elementBalance.water}
- 용신(필요한 에너지): ${sajuData.favorableElement}

[10년 각 연도의 에너지 흐름]
${periodsText}

위 사주 데이터와 10년 흐름을 바탕으로, The Oracle로서 대운 분석을 제공하라.

[해석 지침]
1. 각 연도별 키워드(2-3글자)와 한 줄 설명을 제공
2. 상생/피생 관계의 해는 기회와 성장, 상극/피극은 시련과 성장의 관점으로 해석
3. 전체 10년의 큰 흐름과 전환점을 짚어주라
4. 마지막에 10년 전체를 아우르는 종합 조언을 주라

반드시 아래 JSON 형식으로만 응답하라 (다른 텍스트 없이 순수 JSON만):
{
  "years": [
    { "year": 2026, "keyword": "키워드", "description": "이 해의 해석 1-2문장" }
  ],
  "overall": "10년 전체 종합 해석 텍스트 (2-3문단, 문단 사이 \\n\\n)"
}`
}

/**
 * 월간 운세 프롬프트 — 이번 달의 운세를 읽는다
 * 비유: 이번 달의 "에너지 일기예보"를 오라클에게 요청하는 것
 */
export function buildMonthlyFortunePrompt(
  sajuData: SajuData,
  yearMonth: string,
  monthPillar: { stem: string; branch: string; element: string },
  locale: string
): string {
  return `[월간 운세 요청]
기간: ${yearMonth}
언어: ${locale === 'ko' ? '한국어' : 'English'}

[사주 데이터]
- 일간(Day Master): ${sajuData.dayMaster}
- 오행 분포: 목=${sajuData.elementBalance.wood}, 화=${sajuData.elementBalance.fire}, 토=${sajuData.elementBalance.earth}, 금=${sajuData.elementBalance.metal}, 수=${sajuData.elementBalance.water}
- 용신(필요한 에너지): ${sajuData.favorableElement}

[이달의 천간지지]
- 월간(天干): ${monthPillar.stem}
- 월지(地支): ${monthPillar.branch}
- 오행: ${monthPillar.element}

이 달의 에너지가 사주와 어떻게 상호작용하는지 The Oracle로서 운세를 제공하라.

[해석 지침]
1. 이달의 전체적인 운세 흐름을 2-3문단으로 서술
2. 연애, 재물, 건강, 커리어 4가지 영역의 점수(1-10)와 한줄 설명
3. 이달의 핵심 조언을 1문단으로 제공
4. 자연 이미지와 비유를 활용하여 쉽게 풀어쓸 것

반드시 아래 JSON 형식으로만 응답하라 (다른 텍스트 없이 순수 JSON만):
{
  "fortune": "이달의 운세 텍스트 (2-3문단, 문단 사이 \\n\\n)",
  "categories": { "love": 7, "wealth": 6, "health": 8, "career": 5 },
  "advice": "이달의 핵심 조언 1문단"
}`
}

/**
 * 연간 운세 프롬프트 — 올해의 운세를 읽는다
 * 비유: 올해의 "사계절 운세 가이드"를 오라클에게 요청하는 것
 */
export function buildYearlyFortunePrompt(
  sajuData: SajuData,
  year: number,
  yearPillar: { stem: string; branch: string; element: string },
  locale: string
): string {
  return `[연간 운세 요청]
연도: ${year}년
언어: ${locale === 'ko' ? '한국어' : 'English'}

[사주 데이터]
- 일간(Day Master): ${sajuData.dayMaster}
- 오행 분포: 목=${sajuData.elementBalance.wood}, 화=${sajuData.elementBalance.fire}, 토=${sajuData.elementBalance.earth}, 금=${sajuData.elementBalance.metal}, 수=${sajuData.elementBalance.water}
- 용신(필요한 에너지): ${sajuData.favorableElement}

[올해의 천간지지]
- 연간(天干): ${yearPillar.stem}
- 연지(地支): ${yearPillar.branch}
- 오행: ${yearPillar.element}

올해의 에너지가 사주와 어떻게 상호작용하는지 The Oracle로서 운세를 제공하라.

[해석 지침]
1. 올해의 테마를 한 줄로 제시
2. 4분기(1-3월, 4-6월, 7-9월, 10-12월) 각각의 운세를 1문단씩 서술
3. 각 분기의 에너지 흐름이 자연스럽게 연결되도록
4. 올해 전체를 아우르는 종합 조언을 1문단으로 제공
5. 자연 이미지와 비유를 활용하여 쉽게 풀어쓸 것

반드시 아래 JSON 형식으로만 응답하라 (다른 텍스트 없이 순수 JSON만):
{
  "theme": "올해의 테마 한 줄",
  "quarters": [
    { "period": "1-3월", "forecast": "1분기 운세 1문단" },
    { "period": "4-6월", "forecast": "2분기 운세 1문단" },
    { "period": "7-9월", "forecast": "3분기 운세 1문단" },
    { "period": "10-12월", "forecast": "4분기 운세 1문단" }
  ],
  "advice": "올해 종합 조언 1문단"
}`
}
