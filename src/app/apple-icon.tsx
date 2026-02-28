/* ─────────────────────────────────────────
 * Apple Touch Icon — iOS 홈 화면 아이콘
 * 비유: "앱 아이콘" — 사용자가 홈 화면에 추가할 때 보이는 얼굴
 * Next.js App Router의 apple-icon 컨벤션으로 자동 제공
 * ───────────────────────────────────────── */

import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%)',
          borderRadius: '40px',
        }}
      >
        {/* 금색 4포인트 스타 */}
        <svg viewBox="0 0 32 32" width="120" height="120">
          <path
            d="M16 4 L18.5 13 L28 16 L18.5 19 L16 28 L13.5 19 L4 16 L13.5 13 Z"
            fill="#d4a017"
            opacity="0.9"
          />
          <circle cx="16" cy="16" r="3" fill="#020617" />
          <circle cx="16" cy="16" r="2" fill="#c084fc" opacity="0.8" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
