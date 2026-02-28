/* ─────────────────────────────────────────
 * SNS 공유 유틸리티
 * 비유: 리딩 결과를 "사진 찍어서" 공유할 수 있게 해주는 카메라
 *
 * html2canvas로 DOM → Canvas → Blob 변환
 * 다운로드 또는 클립보드 복사 지원
 *
 * 핵심 포인트:
 *   - 이미지를 Data URL로 사전 변환: CDN/CORS 이슈 완전 회피
 *   - 캡처 전 이미지 로드 완료 대기: 빈 이미지 방지
 *   - onclone: 캡처 직전 DOM 상태를 안전하게 정리
 * ───────────────────────────────────────── */

import html2canvas from 'html2canvas'

/**
 * 캡처 대상 내부의 모든 <img>가 로드될 때까지 대기
 * 비유: 사진 찍기 전에 "모든 사람이 자리 잡을 때까지" 기다리는 것
 */
async function waitForImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img')
  const promises = Array.from(images).map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve()

    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), 3000)
      img.onload = () => { clearTimeout(timeout); resolve() }
      img.onerror = () => { clearTimeout(timeout); resolve() }
    })
  })

  await Promise.all(promises)
}

/**
 * 이미지를 Data URL로 변환 — CORS/taint 문제 완전 회피
 * 비유: 사진을 "디지털 사본"으로 만들어 두는 것
 *
 * Vercel 프로덕션에서 이미지가 CDN을 통해 서빙되면
 * cross-origin으로 취급되어 canvas가 tainted 된다.
 * fetch → blob → FileReader 로 Data URL을 만들면
 * 완전한 same-origin 데이터가 되어 taint 문제가 사라진다.
 */
async function imageToDataUrl(src: string): Promise<string> {
  try {
    const response = await fetch(src)
    const blob = await response.blob()
    return new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve('')
      reader.readAsDataURL(blob)
    })
  } catch {
    return ''
  }
}

/**
 * 캡처 대상의 모든 이미지를 Data URL로 사전 변환
 * 비유: 사진 찍기 전에 모든 소품을 "원본 복사"해 두는 것
 *
 * 반환: [{ originalSrc, dataUrl }] — onclone에서 src 교체에 사용
 */
async function preloadImagesAsDataUrls(
  element: HTMLElement
): Promise<{ src: string; dataUrl: string }[]> {
  const images = element.querySelectorAll('img')
  return Promise.all(
    Array.from(images).map(async (img) => ({
      src: img.src,
      dataUrl: await imageToDataUrl(img.src),
    }))
  )
}

/**
 * DOM 요소를 Canvas로 캡처하여 Blob으로 변환
 * 비유: 화면의 일부를 "스크린샷" 찍는 것
 *
 * 순서: 이미지 로드 대기 → Data URL 사전 변환 → html2canvas 캡처 → Canvas → PNG Blob
 */
export async function captureShareCard(element: HTMLElement): Promise<Blob> {
  /** 1) 캡처 영역 내 모든 이미지가 로드될 때까지 대기 */
  await waitForImages(element)

  /** 2) 모든 이미지를 Data URL로 사전 변환 — CDN/CORS 완전 회피
   *    Vercel 프로덕션에서 static 이미지가 CDN(vercel.app/_next/...)을 통해
   *    서빙되면 cross-origin 취급되어 canvas taint 발생.
   *    fetch → blob → DataURL 변환으로 이 문제를 근본적으로 해결한다.
   */
  const imageDataUrls = await preloadImagesAsDataUrls(element)

  /** 3) html2canvas로 DOM → Canvas 변환
   *    onclone에서 이미지 src를 Data URL로 교체
   */
  const canvas = await html2canvas(element, {
    backgroundColor: '#020617',
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    imageTimeout: 5000,
    onclone: (_doc, clonedElement) => {
      clonedElement.style.overflow = 'visible'

      /** 복제된 DOM의 이미지를 Data URL로 교체 — taint 완전 방지 */
      const clonedImages = clonedElement.querySelectorAll('img')
      clonedImages.forEach((img) => {
        const match = imageDataUrls.find((d) => img.src.includes(d.src) || d.src.includes(img.src))
        if (match?.dataUrl) {
          img.src = match.dataUrl
        }
      })
    },
  })

  /** 4) Canvas → PNG Blob 변환 */
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
