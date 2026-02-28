/* ─────────────────────────────────────────
 * 타로 카드 관련 타입 정의
 * 비유: 타로 카드의 "설계도" — 카드가 어떤 정보를 담고 있는지 규격을 정한다
 * ───────────────────────────────────────── */

/** 타로 카드 아르카나 분류 */
export type Arcana = 'major' | 'minor'

/** 마이너 아르카나 슈트 (네 가지 문양) */
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles'

/** 타로 카드 한 장의 데이터 */
export interface TarotCard {
  /** 고유 ID (예: "major_0", "wands_ace") */
  id: string
  /** 카드 이름 (영문) */
  name: string
  /** 카드 이름 (한국어) */
  nameKo: string
  /** 메이저/마이너 아르카나 */
  arcana: Arcana
  /** 마이너 아르카나일 때의 슈트 */
  suit?: Suit
  /** 카드 번호 (메이저: 0-21, 마이너: 1-14) */
  number: number
  /** 정방향 키워드 */
  uprightKeywords: string[]
  /** 역방향 키워드 */
  reversedKeywords: string[]
  /** 카드 설명 (AI 프롬프트에 전달용) */
  description: string
}

/** 뽑힌 카드 — 위치와 방향 정보 포함 */
export interface DrawnCard {
  /** 타로 카드 데이터 */
  card: TarotCard
  /** 스프레드에서의 위치 (0부터 시작) */
  position: number
  /** 역방향 여부 (true = 거꾸로 뽑힘) */
  isReversed: boolean
}

/** 스프레드 타입 — 카드 배치 방식 */
export type SpreadType = 'daily_3card' | 'love' | 'career' | 'celtic_cross' | 'yes_no'

/** 스프레드 정의 */
export interface SpreadDefinition {
  type: SpreadType
  /** 스프레드 이름 */
  name: string
  /** 한국어 이름 */
  nameKo: string
  /** 필요한 카드 수 */
  cardCount: number
  /** 각 위치의 의미 */
  positions: string[]
  /** 무료/프리미엄 */
  tier: 'free' | 'premium'
}

/** 타로 리딩 결과 (API 응답 + DB 저장용) */
export interface TarotReading {
  id: string
  /** 스프레드 타입 */
  spreadType: SpreadType
  /** 유저의 질문 (선택) */
  question?: string
  /** 뽑힌 카드들 */
  cards: DrawnCard[]
  /** AI가 생성한 해석 */
  interpretation: string
  /** 무료/프리미엄 */
  readingType: 'free' | 'premium'
  /** 생성 시각 */
  createdAt: string
}
