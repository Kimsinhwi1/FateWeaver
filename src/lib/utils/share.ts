/* ─────────────────────────────────────────
 * SNS 공유 유틸리티 — Pure Canvas 방식
 * 비유: 리딩 결과를 "직접 그려서" 공유할 수 있게 해주는 화가
 *
 * html2canvas 의존성 제거 — 모바일에서 document.write() 차단 문제 근본 해결
 * Canvas 2D API로 공유 카드를 직접 그린다 (gradient, 텍스트, 이미지)
 *
 * 장점:
 *   - CORS/taint 문제 완전 없음 (이미지를 fetch → data URL → drawImage)
 *   - document.write() 사용 없음 — 모바일 100% 호환
 *   - 외부 라이브러리 의존성 없음
 * ───────────────────────────────────────── */

/** 공유 카드에 그릴 데이터 */
export interface ShareCardData {
  cards: {
    id: string
    name: string
    position: string
    isReversed: boolean
  }[]
  summaryText: string
}

/** Canvas 설정 상수 */
const SCALE = 2           // 레티나 대응
const WIDTH = 420          // 논리 너비 (px)
const CARD_W = 72
const CARD_H = 108
const CARD_GAP = 14
const PADDING_X = 28
const PADDING_TOP = 32

/**
 * 이미지 URL → HTMLImageElement 로드
 * 비유: 그림 그리기 전에 "재료(이미지)"를 미리 준비
 *
 * fetch → blob → Object URL 방식으로 CORS 완전 회피
 */
async function loadImage(src: string): Promise<HTMLImageElement> {
  const response = await fetch(src)
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`Image load failed: ${src}`))
    }
    img.src = objectUrl
  })
}

/**
 * 텍스트를 줄바꿈하여 Canvas에 그리기
 * 비유: 줄 노트에 글을 쓸 때 줄 끝에서 자동으로 다음 줄로 가는 것
 *
 * @returns 마지막으로 그린 y좌표 — 다음 요소 배치에 사용
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split('')   // 한글은 글자 단위 줄바꿈이 자연스러움
  let line = ''
  let currentY = y

  for (const char of words) {
    const testLine = line + char
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY)
      line = char
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY)
    currentY += lineHeight
  }

  return currentY
}

/**
 * 둥근 모서리 사각형 그리기 (클리핑 경로용)
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * Pure Canvas로 공유 카드를 직접 그려 Blob으로 변환
 * 비유: 빈 캔버스에 운세 결과를 "직접 그림 그리기"
 *
 * html2canvas 완전 제거 — document.write() 문제 없음, CORS 문제 없음
 */
export async function captureShareCard(data: ShareCardData): Promise<Blob> {
  /** 1) 카드 이미지 사전 로드 — CORS 안전한 Object URL 사용 */
  const cardImages: (HTMLImageElement | null)[] = await Promise.all(
    data.cards.map(async (card) => {
      try {
        return await loadImage(`/images/tarot/${card.id}.jpg`)
      } catch {
        return null
      }
    })
  )

  /** 2) 높이 계산 — 요약 텍스트 길이에 따라 동적 조정 */
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')!
  tempCtx.font = '13px sans-serif'
  const textMaxWidth = WIDTH - PADDING_X * 2 - 16
  let textLines = 1
  let testLine = ''
  for (const char of data.summaryText) {
    testLine += char
    if (tempCtx.measureText(testLine).width > textMaxWidth) {
      textLines++
      testLine = char
    }
  }
  const textBlockHeight = textLines * 20 + 8

  const HEIGHT = PADDING_TOP + 48 + CARD_H + 40 + textBlockHeight + 40

  /** 3) 메인 Canvas 생성 */
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH * SCALE
  canvas.height = HEIGHT * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)

  /** 4) 그라데이션 배경 */
  const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  grad.addColorStop(0, '#020617')
  grad.addColorStop(0.5, '#1e1b4b')
  grad.addColorStop(1, '#020617')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  /** 5) 로고 */
  ctx.textAlign = 'center'
  ctx.fillStyle = '#94a3b8'
  ctx.font = '600 15px sans-serif'
  ctx.fillText('F A T E W E A V E R', WIDTH / 2, PADDING_TOP + 16)

  ctx.fillStyle = '#475569'
  ctx.font = '10px sans-serif'
  ctx.fillText('AI Tarot × Saju Reading', WIDTH / 2, PADDING_TOP + 30)

  /** 6) 카드 3장 그리기 */
  const totalCardsW = 3 * CARD_W + 2 * CARD_GAP
  const startX = (WIDTH - totalCardsW) / 2
  const cardY = PADDING_TOP + 48

  for (let i = 0; i < data.cards.length; i++) {
    const card = data.cards[i]
    const x = startX + i * (CARD_W + CARD_GAP)

    /** 카드 이미지 또는 폴백 색상 */
    const img = cardImages[i]
    if (img) {
      ctx.save()
      roundRect(ctx, x, cardY, CARD_W, CARD_H, 6)
      ctx.clip()

      if (card.isReversed) {
        ctx.translate(x + CARD_W / 2, cardY + CARD_H / 2)
        ctx.rotate(Math.PI)
        ctx.drawImage(img, -CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H)
      } else {
        ctx.drawImage(img, x, cardY, CARD_W, CARD_H)
      }
      ctx.restore()
    } else {
      /** 이미지 로드 실패 시 보라색 폴백 박스 */
      ctx.fillStyle = '#2d0076'
      roundRect(ctx, x, cardY, CARD_W, CARD_H, 6)
      ctx.fill()

      ctx.fillStyle = '#a78bfa'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🃏', x + CARD_W / 2, cardY + CARD_H / 2 + 4)
    }

    /** 카드 테두리 */
    ctx.strokeStyle = card.isReversed
      ? 'rgba(239, 68, 68, 0.5)'
      : 'rgba(192, 132, 252, 0.3)'
    ctx.lineWidth = card.isReversed ? 2 : 1
    roundRect(ctx, x, cardY, CARD_W, CARD_H, 6)
    ctx.stroke()

    /** 포지션 라벨 (과거/현재/미래) */
    ctx.fillStyle = '#a78bfa'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(card.position, x + CARD_W / 2, cardY + CARD_H + 14)

    /** 카드 이름 */
    ctx.fillStyle = '#94a3b8'
    ctx.font = '9px sans-serif'
    const displayName = card.name.length > 10 ? card.name.slice(0, 9) + '…' : card.name
    ctx.fillText(displayName, x + CARD_W / 2, cardY + CARD_H + 26)
  }

  /** 7) 요약 텍스트 */
  const textY = cardY + CARD_H + 44
  ctx.fillStyle = '#cbd5e1'
  ctx.font = '13px sans-serif'
  ctx.textAlign = 'center'
  drawWrappedText(ctx, data.summaryText, WIDTH / 2, textY, textMaxWidth, 20)

  /** 8) 워터마크 */
  ctx.fillStyle = '#475569'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('fateweaver.vercel.app', WIDTH / 2, HEIGHT - 14)

  /** 9) Canvas → PNG Blob */
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas to Blob 변환 실패'))
      },
      'image/png',
      1.0
    )
  })
}

/**
 * Blob을 이미지 파일로 다운로드
 * 비유: "다른 이름으로 저장" 기능
 */
export function downloadImage(blob: Blob, filename: string = 'fateweaver-reading.png'): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Blob을 클립보드에 복사
 * 비유: "복사" 버튼 — SNS에 바로 붙여넣기 가능
 */
export async function copyToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (typeof ClipboardItem === 'undefined') {
      return false
    }

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ])
    return true
  } catch {
    return false
  }
}
