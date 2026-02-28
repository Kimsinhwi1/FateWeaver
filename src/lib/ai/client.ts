/* ─────────────────────────────────────────
 * Claude API 클라이언트
 * 비유: AI 오라클과 대화하기 위한 "수정구슬 연결기"
 * 서버에서만 사용 — API 키가 노출되면 안 되므로
 * ───────────────────────────────────────── */

import Anthropic from '@anthropic-ai/sdk'

/** Claude API 클라이언트 싱글톤 */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

/** AI에게 운세 해석을 요청하는 함수 */
export async function generateInterpretation(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
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

export { anthropic }
