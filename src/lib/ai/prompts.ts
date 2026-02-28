/* ─────────────────────────────────────────
 * AI 프롬프트 템플릿
 * 비유: AI 오라클에게 건네는 "대본" — 이 대본이 해석 품질의 9할을 결정
 * SPEC.md 5-3절의 프롬프트 전략을 구현
 * ───────────────────────────────────────── */

import type { DrawnCard } from '@/types/tarot'
import type { SajuData } from '@/types/saju'

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
