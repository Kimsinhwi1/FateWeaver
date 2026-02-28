/* ─────────────────────────────────────────
 * Claude API 클라이언트
 * 비유: AI 오라클과 대화하기 위한 "수정구슬 연결기"
 * 서버에서만 사용 — API 키가 노출되면 안 되므로
 * ───────────────────────────────────────── */

import Anthropic from '@anthropic-ai/sdk'

/**
 * Claude API 클라이언트 — 지연 초기화 (Lazy Singleton)
 * 비유: 수정구슬은 실제로 점을 볼 때만 꺼낸다 — 열쇠 없으면 꺼내지도 않음
 * 모듈 로드 시점이 아니라 실제 호출 시점에 생성하여,
 * ANTHROPIC_API_KEY가 없는 환경(목업 모드)에서도 크래시하지 않는다
 */
let _anthropic: Anthropic | null = null

function getClient(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다')
    }
    _anthropic = new Anthropic({ apiKey })
  }
  return _anthropic
}

/** AI에게 운세 해석을 요청하는 함수 */
export async function generateInterpretation(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const anthropic = getClient()
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt },
    ],
  })

  // Claude 응답에서 텍스트 추출
  const textBlock = message.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('AI 응답에서 텍스트를 찾을 수 없습니다')
  }

  return textBlock.text
}

export { getClient as anthropic }
