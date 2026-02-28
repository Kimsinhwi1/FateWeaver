/* ─────────────────────────────────────────
 * OG Image 생성 API — SNS 공유 시 미리보기 이미지
 * 비유: SNS에 링크를 붙여넣으면 나오는 "간판 이미지"를 서버에서 그려주는 화가
 * next/og의 ImageResponse로 동적 생성 — 별도 라이브러리 불필요
 * ───────────────────────────────────────── */

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#020617',
          backgroundImage: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 상단 장식 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '40px' }}>&#x2728;</div>
          <div style={{ fontSize: '48px' }}>&#x1F52E;</div>
          <div style={{ fontSize: '40px' }}>&#x2728;</div>
        </div>

        {/* 로고 텍스트 */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 700,
            letterSpacing: '6px',
            background: 'linear-gradient(135deg, #c084fc, #fbbf24)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          FateWeaver
        </div>

        {/* 서브텍스트 */}
        <div
          style={{
            fontSize: '28px',
            color: '#94a3b8',
            marginTop: '16px',
            letterSpacing: '2px',
          }}
        >
          Where East Meets West
        </div>

        {/* 카드 일러스트 */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '40px',
          }}
        >
          {['Past', 'Present', 'Future'].map((label) => (
            <div
              key={label}
              style={{
                width: '100px',
                height: '150px',
                borderRadius: '12px',
                border: '2px solid rgba(192, 132, 252, 0.3)',
                background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: '32px' }}>&#x1F0CF;</div>
              <div style={{ fontSize: '12px', color: '#a78bfa', marginTop: '8px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* 하단 태그라인 */}
        <div
          style={{
            fontSize: '18px',
            color: '#64748b',
            marginTop: '36px',
            display: 'flex',
            gap: '8px',
          }}
        >
          <span>AI Tarot</span>
          <span>&#x00B7;</span>
          <span>Eastern Saju</span>
          <span>&#x00B7;</span>
          <span>Fusion Reading</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
