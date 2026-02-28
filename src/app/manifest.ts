/* ─────────────────────────────────────────
 * Web App Manifest — PWA 기본 설정
 * 비유: "명함" — 앱의 이름, 색상, 아이콘을 브라우저에 알려준다
 * Next.js App Router 컨벤션으로 /manifest.webmanifest 자동 제공
 * ───────────────────────────────────────── */

import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FateWeaver — AI Fortune Reading',
    short_name: 'FateWeaver',
    description: 'Eastern Saju × Western Tarot, fused by AI',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#020617',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
