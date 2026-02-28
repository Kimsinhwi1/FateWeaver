import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  /* ─────────────────────────────────────────
   * 이미지 최적화 — next/image가 자동으로 WebP 서빙
   * 비유: "자동 번역기" — JPG를 올려도 브라우저에게는 가벼운 WebP로 전달
   * 78장 타로 카드(~400KB JPG) → WebP(~80KB)로 자동 변환
   * ───────────────────────────────────────── */
  images: {
    formats: ['image/webp'],
    deviceSizes: [375, 640, 768, 1024, 1280],
    imageSizes: [96, 160, 176, 256],
  },
}

export default withNextIntl(nextConfig)
