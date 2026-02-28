/* ─────────────────────────────────────────
 * SNS 공유 유틸리티
 * 비유: 리딩 결과를 "사진 찍어서" 공유할 수 있게 해주는 카메라
 *
 * html2canvas로 DOM → Canvas → Blob 변환
 * 다운로드 또는 클립보드 복사 지원
 * ───────────────────────────────────────── */

import html2canvas from 'html2canvas'

/**
 * DOM 요소를 Canvas로 캡처하여 Blob으로 변환
 * 비유: 화면의 일부를 "스크린샷" 찍는 것
 */
export async function captureShareCard(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    backgroundColor: '#020617',   // slate-950 — 다크 배경
    scale: 2,                      // 레티나 대응 (2x 해상도)
    useCORS: true,                 // 외부 이미지 허용
    logging: false,                // 콘솔 로그 비활성화
  })

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
 * 브라우저 지원 여부에 따라 실패할 수 있음
 */
export async function copyToClipboard(blob: Blob): Promise<boolean> {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ])
    return true
  } catch {
    return false
  }
}
