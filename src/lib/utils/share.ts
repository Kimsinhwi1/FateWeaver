/* ─────────────────────────────────────────
 * SNS 공유 유틸리티
 * 비유: 리딩 결과를 "사진 찍어서" 공유할 수 있게 해주는 카메라
 *
 * html2canvas로 DOM → Canvas → Blob 변환
 * 다운로드 또는 클립보드 복사 지원
 *
 * 핵심 포인트:
 *   - allowTaint + useCORS: 같은 도메인 이미지 캡처 보장
 *   - 캡처 전 이미지 로드 완료 대기: 빈 이미지 방지
 *   - onclone: 캡처 직전 DOM 상태를 안전하게 정리
 * ───────────────────────────────────────── */

import html2canvas from 'html2canvas'

/**
 * 캡처 대상 내부의 모든 <img>가 로드될 때까지 대기
 * 비유: 사진 찍기 전에 "모든 사람이 자리 잡을 때까지" 기다리는 것
 *
 * html2canvas는 이미지가 아직 로드 안 된 상태에서 캡처하면
 * 빈 박스가 나오기 때문에 반드시 사전 대기가 필요하다.
 */
async function waitForImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img')
  const promises = Array.from(images).map((img) => {
    /** 이미 로드 완료 & 실제 크기 있음 → 기다릴 필요 없음 */
    if (img.complete && img.naturalWidth > 0) return Promise.resolve()

    return new Promise<void>((resolve) => {
      /** 3초 타임아웃 — 이미지가 영원히 안 오면 넘어간다 */
      const timeout = setTimeout(() => resolve(), 3000)
      img.onload = () => { clearTimeout(timeout); resolve() }
      img.onerror = () => { clearTimeout(timeout); resolve() }
    })
  })

  await Promise.all(promises)
}

/**
 * DOM 요소를 Canvas로 캡처하여 Blob으로 변환
 * 비유: 화면의 일부를 "스크린샷" 찍는 것
 *
 * 순서: 이미지 로드 대기 → html2canvas 캡처 → Canvas → PNG Blob
 */
export async function captureShareCard(element: HTMLElement): Promise<Blob> {
  /** 1) 캡처 영역 내 모든 이미지가 로드될 때까지 대기 */
  await waitForImages(element)

  /** 2) html2canvas로 DOM → Canvas 변환
   *    - useCORS: 이미지를 CORS로 로드하여 캔버스 오염(taint) 방지
   *    - allowTaint: false — tainted canvas는 toBlob() 시 SecurityError 발생
   *      → 같은 도메인 이미지(/images/tarot/*.jpg)는 CORS 없이도 깨끗하게 렌더됨
   *    - onclone: 캡처용 복제 DOM에서 불필요한 스타일을 정리
   */
  const canvas = await html2canvas(element, {
    backgroundColor: '#020617',   // slate-950 — 다크 배경
    scale: 2,                      // 레티나 대응 (2x 해상도)
    useCORS: true,                 // 외부 이미지 CORS 허용
    allowTaint: false,             // taint 금지 — toBlob() 내보내기 가능 유지
    logging: false,                // 콘솔 로그 비활성화
    imageTimeout: 5000,            // 이미지 로드 최대 5초 대기
    onclone: (_doc, clonedElement) => {
      /** 캡처용 복제 DOM에서 overflow를 visible로 — 잘림 방지 */
      clonedElement.style.overflow = 'visible'
    },
  })

  /** 3) Canvas → PNG Blob 변환 */
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
 *
 * <a> 태그를 동적으로 생성 → click() → 즉시 제거
 * URL.revokeObjectURL로 메모리 누수 방지
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
 *
 * ClipboardItem API 사용 — Safari/Chrome 지원
 * Firefox는 일부 버전에서 지원 안 될 수 있어 try-catch 필수
 */
export async function copyToClipboard(blob: Blob): Promise<boolean> {
  try {
    /** ClipboardItem API가 존재하는지 먼저 확인 */
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
