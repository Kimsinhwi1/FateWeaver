/* ─────────────────────────────────────────
 * 유저 관련 타입 정의
 * ───────────────────────────────────────── */

import type { SajuData, ZodiacSign } from './saju'

/** 지원 로케일 */
export type Locale = 'en' | 'ko'

/** 유저 프로필 (Supabase user_profiles 테이블 매핑) */
export interface UserProfile {
  id: string
  birthDate: string
  birthTime: string | null
  birthTimezone: string
  gender?: string
  zodiacSign: ZodiacSign | null
  sajuData: SajuData | null
  locale: Locale
  isPremium: boolean
  createdAt: string
  updatedAt: string
}
