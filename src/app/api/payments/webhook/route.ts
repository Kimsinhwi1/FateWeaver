/* ─────────────────────────────────────────
 * Lemon Squeezy 웹훅 수신 API
 * 비유: "택배 수령 창구" — Lemon Squeezy가 결제 이벤트를 보내면
 *       서명을 확인하고 DB를 업데이트한다
 *
 * POST /api/payments/webhook
 * - Lemon Squeezy 대시보드에서 이 URL을 웹훅으로 등록
 * - 시그니처 헤더: X-Signature
 * ───────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server'
import { getPaymentProvider } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    // Raw body 읽기 — 시그니처 검증에 원본 텍스트가 필요
    const rawBody = await request.text()

    // Lemon Squeezy는 X-Signature 헤더로 HMAC-SHA256 서명을 보냄
    const signature = request.headers.get('x-signature') ?? ''

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 401 }
      )
    }

    // 결제 프로바이더의 웹훅 핸들러 호출
    const provider = getPaymentProvider()
    await provider.handleWebhook(rawBody, signature)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('웹훅 처리 에러:', error)
    // 웹훅은 에러 시에도 200을 반환하는 것이 관례 (재시도 방지)
    // 하지만 시그니처 실패는 400으로 구분
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.includes('서명 검증')) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
