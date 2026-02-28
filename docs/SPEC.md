# 🔮 AI Fortune Teller — 프로젝트 기획서 (Updated 2026-03-01)

> **변경 이력:** 원본 기획서 대비 실제 구현 현황 반영. ✅=완료, 🔄=부분완료, ❌=미구현, 🔀=계획변경

---

## 1. 제품 개요

**한줄 정의:** FateWeaver — 동양 사주 × 서양 타로를 AI가 융합 해석해주는 글로벌 운세 서비스

**브랜드명: FateWeaver**
"운명을 엮는다" — 동양 사주와 서양 타로, 두 가지 운명 해석 체계를 AI가 엮어주는 서비스

**포지셔닝:**
> "The first AI that reads your fate through both Eastern & Western wisdom"
> 
> Co-Star(별자리)도, 타로 앱도 서양만 다룬다.
> 동양 사주 앱은 한국/중국 로컬에 갇혀 있다.
> 우리는 "둘 다"를 AI가 융합 해석하는 유일한 글로벌 서비스.

**현재 URL:** https://fateweaver.vercel.app

---

## 2. 핵심 기능 설계

### 2-1. 무료 티어 (Free)

| 기능 | 설명 | 상태 | 비고 |
|------|------|------|------|
| **오늘의 타로** | 매일 3장 카드 스프레드 + AI 해석 | ✅ | 1회/일 제한 |
| **오늘의 운세** | 사주 기반 일일 운세 | ✅ | 3회/일 제한 |
| **원형(Archetype) 매칭** | 사주 기반 12원형 성격 분석 | ✅ | 무제한, 바이럴 핵심 기능 |
| ~~간단 사주 프로필~~ | ~~생년월일시 입력 → 사주 기본 성격 분석~~ | 🔀 | 원형 매칭으로 대체 |
| **SEO 블로그** | "What is Saju?", 타로, 별자리 관련 콘텐츠 | ✅ | 3편 작성 완료 |

### 2-2. 프리미엄 티어 ($6.99/월)

| 기능 | 설명 | 상태 | 비고 |
|------|------|------|------|
| **무제한 타로/데일리** | 일일 제한 해제 | ✅ | 프리미엄 게이트 구현 |
| **궁합 분석** | 두 사람의 사주 궁합 AI 해석 | ✅ | 프리미엄 전용 (0회/무료) |
| **10년 대운** | 60갑자 순환 기반 10년 타임라인 | ✅ | 프리미엄 전용 |
| **월간 운세** | 월주 계산 + 4대 영역(연애/재물/건강/커리어) 점수 | ✅ | 프리미엄 전용 |
| **연간 운세** | 년주 분석 + 4분기 시즌 가이드 | ✅ | 프리미엄 전용 |
| **리딩 히스토리** | 과거 리딩 기록 열람 | ✅ | 로그인 유저용 |
| 추가 타로 스프레드 | Love, Career, Celtic Cross, Yes/No | ❌ | 런칭 후 확장 예정 |
| AI 운세 상담 | 고민 → AI가 타로+사주 기반 조언 | ❌ | 런칭 후 확장 예정 |
| ~~Deep Reading 원타임 ($3.99)~~ | ~~1회 심층 리포트~~ | 🔀 | 구독 모델로 통일 |
| ~~연간 구독 ($49.99/년)~~ | ~~40% 할인 연간 플랜~~ | 🔀 | 월간 구독만 운영 중 |

### 2-3. 바이럴 기능

| 기능 | 설명 | 상태 | 비고 |
|------|------|------|------|
| **공유 카드** | 타로 결과 SNS용 이미지 자동 생성 | ❌ | 런칭 후 구현 예정 |
| **궁합 초대** | "나와 궁합 확인해볼래?" 링크 공유 | ❌ | 바이럴 직결, 우선순위 높음 |
| **PWA 푸시 알림** | 매일 아침 운세 푸시 | ❌ | 유저 확보 후 추가 |

### 2-4. 인프라 & 법적 페이지 (SPEC 외 추가 구현)

| 기능 | 설명 | 상태 |
|------|------|------|
| **Google OAuth** | 소셜 로그인 | ✅ |
| **Lemon Squeezy 결제** | 프리미엄 구독 결제 | ✅ |
| **Favicon + Manifest** | PWA 기본 설정 | ✅ |
| **SEO** | sitemap (34 URL), robots.txt, OG 이미지 | ✅ |
| **Privacy Policy** | 개인정보 처리방침 (/privacy) | ✅ |
| **Terms of Service** | 이용약관 (/terms) | ✅ |
| **회원탈퇴** | 계정 삭제 기능 (DELETE /api/account) | ✅ |
| **피드백** | 문의하기/피드백 폼 (/feedback) | ✅ |
| **Google Search Console** | 인증 메타태그 추가 | ✅ |
| **hreflang + JSON-LD** | SEO 구조화 데이터 | 🔄 | 프롬프트 준비 완료, 구현 대기 |

---

## 3. 기술 아키텍처

### 3-1. 기술 스택

```
프론트엔드:  Next.js 15 (App Router) + Tailwind CSS
백엔드:      Next.js API Routes + Supabase (DB + Auth)
AI:          Anthropic Claude API (운세 해석 생성)
결제:        Lemon Squeezy ($6.99/월)                    ← 확정
배포:        Vercel                                       ← 확정
다국어:      next-intl (영어 + 한국어)                      ← 2개 언어로 축소
이미지:      미구현 (공유 카드 기능 보류)
```

### ⚠️ 3-1-1. 결제 게이트웨이 전략 — 현황

| 항목 | 계획 | 현재 |
|------|------|------|
| 1순위 | Lemon Squeezy | ✅ **Lemon Squeezy 확정 사용 중** |
| 2순위 | Paddle (백업) | ❌ 불필요 (LS 승인 완료) |
| 보조 | Buy Me a Coffee | ❌ 불필요 |
| 성장 후 | Stripe Atlas | 🔄 MRR $500 이후 검토 |

**결제 추상화 설계:** 구현됨 (PaymentProvider 인터페이스). Lemon Squeezy 웹훅 처리 포함.

### 3-2. 시스템 흐름

```
[유저] → 생년월일시 입력 → [Supabase] 프로필 저장
                              ↓
[유저] → 타로/운세 요청 → [API Route] → 사주 계산 + 카드 추첨
                              ↓
                    [Claude API] → 카드 + 사주 데이터 기반 해석 생성
                              ↓
                    [Supabase] 리딩 결과 저장 → [유저] 결과 표시
                              ↓
                    무료 제한 초과 시 → PremiumGate UI → Lemon Squeezy 결제
```

### 3-3. DB 스키마 (Supabase) — 현재 상태

```sql
-- 유저 프로필 (사주/별자리 기본 정보)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_timezone TEXT DEFAULT 'UTC',
  gender TEXT,
  zodiac_sign TEXT,
  saju_data JSONB,
  locale TEXT DEFAULT 'en',
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 타로 리딩 기록
CREATE TABLE tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  spread_type TEXT NOT NULL,          -- 현재 'daily_3card'만 사용
  question TEXT,
  cards JSONB NOT NULL,
  interpretation TEXT NOT NULL,
  reading_type TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사주 분석 기록
CREATE TABLE saju_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  reading_type TEXT NOT NULL,         -- 'basic', 'yearly', 'monthly', 'decade', 'compatibility'
  target_year INTEGER,
  partner_birth_date DATE,
  partner_birth_time TIME,
  analysis TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 일일 운세 (캐싱용)
CREATE TABLE daily_fortunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  fortune_date DATE NOT NULL,
  content TEXT NOT NULL,
  lucky_color TEXT,
  lucky_number INTEGER,
  mood_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, fortune_date)
);

-- 피드백 (SPEC 외 추가)
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,             -- 'bug', 'feature', 'general', 'other'
  email TEXT,
  message TEXT NOT NULL,
  user_id UUID,                       -- nullable (비로그인도 가능)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책: 모든 테이블에 "자기 데이터만 접근" 적용
-- feedback: INSERT 누구나, SELECT 본인만
```

### 3-4. 프로젝트 디렉토리 구조 — 현재 상태

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                  # ✅ 랜딩 페이지
│   │   ├── tarot/page.tsx            # ✅ 타로 3카드 리딩
│   │   ├── daily/page.tsx            # ✅ 오늘의 운세
│   │   ├── archetype/page.tsx        # ✅ 원형 매칭 (SPEC 외 추가)
│   │   ├── compatibility/page.tsx    # ✅ 궁합 분석
│   │   ├── fortune/
│   │   │   ├── decade/page.tsx       # ✅ 10년 대운 (프리미엄)
│   │   │   ├── monthly/page.tsx      # ✅ 월간 운세 (프리미엄)
│   │   │   └── yearly/page.tsx       # ✅ 연간 운세 (프리미엄)
│   │   ├── history/page.tsx          # ✅ 리딩 기록
│   │   ├── pricing/page.tsx          # ✅ 요금제
│   │   ├── blog/
│   │   │   ├── page.tsx              # ✅ 블로그 인덱스
│   │   │   └── [slug]/page.tsx       # ✅ 블로그 상세 (3편)
│   │   ├── privacy/page.tsx          # ✅ 개인정보 처리방침
│   │   ├── terms/page.tsx            # ✅ 이용약관
│   │   ├── feedback/page.tsx         # ✅ 피드백/문의
│   │   ├── settings/page.tsx         # ✅ 설정 (계정 삭제 포함)
│   │   └── profile/page.tsx          # ❌ 미구현
│   └── api/
│       ├── tarot/reading/route.ts    # ✅ 타로 리딩
│       ├── daily/fortune/route.ts    # ✅ 일일 운세
│       ├── archetype/route.ts        # ✅ 원형 매칭
│       ├── compatibility/route.ts    # ✅ 궁합 분석
│       ├── fortune/
│       │   ├── decade/route.ts       # ✅ 10년 대운
│       │   ├── monthly/route.ts      # ✅ 월간 운세
│       │   └── yearly/route.ts       # ✅ 연간 운세
│       ├── account/route.ts          # ✅ 계정 삭제 (DELETE)
│       ├── feedback/route.ts         # ✅ 피드백 제출 (POST)
│       ├── og/route.ts               # ✅ OG 이미지 생성
│       └── webhooks/
│           └── lemon-squeezy/route.ts # ✅ 결제 웹훅
├── components/
│   ├── tarot/                        # ✅ 카드 UI, 결과 표시
│   ├── fortune/                      # ✅ 대운/월간/연간 결과 컴포넌트
│   ├── shared/
│   │   ├── premium-gate.tsx          # ✅ 프리미엄 잠금 UI
│   │   ├── premium-teaser.tsx        # ✅ 프리미엄 티저 (실제 링크 연결)
│   │   └── birth-input-form.tsx      # ✅ 생년월일시 입력 폼
│   └── layout/
│       ├── header.tsx                # ✅ auth-button 포함
│       └── footer.tsx                # ✅ 전체 페이지 링크
├── lib/
│   ├── tarot/
│   │   ├── cards.ts                  # ✅ 78장 타로카드 데이터
│   │   └── draw.ts                   # ✅ 카드 추첨 로직
│   ├── saju/
│   │   ├── calculator.ts             # ✅ 사주팔자 계산 엔진
│   │   ├── elements.ts               # ✅ 오행 로직
│   │   ├── stems-branches.ts         # ✅ 천간지지 데이터
│   │   ├── period.ts                 # ✅ 대운/년주/월주 계산 (추가)
│   │   └── interpretation.ts         # ✅ 사주 해석 매핑
│   ├── ai/
│   │   ├── prompts.ts                # ✅ AI 프롬프트 6종
│   │   └── client.ts                 # ✅ Claude API 클라이언트
│   ├── payment/
│   │   └── lemon-squeezy.ts          # ✅ Lemon Squeezy 연동
│   ├── supabase/
│   │   ├── client.ts                 # ✅ 클라이언트
│   │   └── server.ts                 # ✅ 서버 사이드
│   └── utils/
│       ├── date.ts                   # ✅ 날짜/시간 유틸
│       └── limit.ts                  # ✅ 무료 사용 제한 관리
├── types/                            # ✅ 타입 정의
└── i18n/
    ├── en.json                       # ✅ 316개 키
    └── ko.json                       # ✅ 316개 키 (EN과 정합성 확인)
```

**원본 SPEC 대비 미구현 파일:**
- `spreads.ts` — Daily 3-Card만 사용 중이라 불필요
- `share.ts` — 공유 카드 기능 보류
- `zodiac/signs.ts` — 사주 중심으로 피벗
- `ja.json`, `zh.json` — 런칭 후 추가
- `profile/page.tsx` — settings로 대체

---

## 4. 사주팔자 계산 로직 설계

*(원본과 동일 — 변경 없음)*

사주(四柱)는 네 개의 기둥으로 이루어지며, 각각 천간(天干)과 지지(地支)의 조합이다.

### 4-1. 핵심 데이터

```
천간(天干) 10개: 甲乙丙丁戊己庚辛壬癸
지지(地支) 12개: 子丑寅卯辰巳午未申酉戌亥

오행(五行): 木(나무) 火(불) 土(흙) 金(쇠) 水(물)

사주 네 기둥:
- 년주(年柱): 태어난 해 → 천간 + 지지
- 월주(月柱): 태어난 달 → 천간 + 지지
- 일주(日柱): 태어난 날 → 천간 + 지지
- 시주(時柱): 태어난 시간 → 천간 + 지지
```

### 4-2. 계산 흐름 — 현재 구현

```
생년월일시 입력
    ↓
년주 계산: (연도 - 4) % 60 → 60갑자 인덱스         ✅ calculator.ts
월주 계산: 연간(年干) 기반 월간 + 월지              ✅ period.ts
일주 계산: 기준일 기반 일진 계산                    ✅ calculator.ts
시주 계산: 일간(日干) 기반 시간 + 시지              ✅ calculator.ts
    ↓
오행 분포 분석                                     ✅ elements.ts
    ↓
용신(用神) 판단                                    ✅ interpretation.ts
    ↓
대운 계산: 60갑자 순환으로 10년 단위               ✅ period.ts (추가)
관계 분석: 천간지지 간 상생/상극                    ✅ period.ts (추가)
    ↓
AI에게 전달하여 자연어 해석 생성                    ✅ prompts.ts + client.ts
```

### 4-3. AI에게 전달할 사주 데이터 구조

*(원본과 동일)*

```json
{
  "fourPillars": {
    "year": { "stem": "甲", "branch": "子", "element": "wood" },
    "month": { "stem": "丙", "branch": "寅", "element": "fire" },
    "day": { "stem": "庚", "branch": "午", "element": "metal" },
    "hour": { "stem": "壬", "branch": "申", "element": "water" }
  },
  "elementBalance": {
    "wood": 2, "fire": 3, "earth": 1, "metal": 1, "water": 1
  },
  "dayMaster": "庚 (Metal)",
  "favorableElement": "earth",
  "zodiacSign": "capricorn"
}
```

---

## 5. 타로 카드 시스템

### 5-1. 78장 타로 덱 구성 ✅

```
메이저 아르카나 (22장): The Fool(0) ~ The World(21)
마이너 아르카나 (56장):
  - Wands(완드/지팡이) Ace~10 + Page, Knight, Queen, King
  - Cups(컵) Ace~10 + Page, Knight, Queen, King
  - Swords(검) Ace~10 + Page, Knight, Queen, King
  - Pentacles(동전) Ace~10 + Page, Knight, Queen, King
```

### 5-2. 스프레드 타입 — 현재 상태

| 스프레드 | 카드 수 | 용도 | 티어 | 상태 |
|---------|---------|------|-----|------|
| **Daily 3-Card** | 3장 | 과거-현재-미래 | Free (1회/일) | ✅ |
| Love Spread | 5장 | 연애/관계 | Premium | ❌ 런칭 후 |
| Career Spread | 5장 | 진로/직장 | Premium | ❌ 런칭 후 |
| Celtic Cross | 10장 | 심층 분석 | Premium | ❌ 런칭 후 |
| Yes/No | 1장 | 빠른 질문 | Free (1일 3회) | ❌ 런칭 후 |

### 5-3. AI 프롬프트 전략

*(원본 철학 유지 — "프롬프트가 곧 제품")*

현재 구현된 프롬프트 6종: ✅
1. 타로 3카드 리딩
2. 오늘의 운세
3. 궁합 분석
4. 10년 대운
5. 월간 운세
6. 연간 운세

**시스템 프롬프트 핵심 (변경 없음):**
- 페르소나: "The Oracle" — 동양 사주명리학 30년, 서양 타로 20년 현자
- 절대 금지: AI 언급, 고객서비스 말투, 면책 문구 본문 혼합, 이모지
- 목표: 신비롭고 따뜻한 톤, 개인화된 해석, 행동 제안 포함

---

## 6. 수익 모델 — 현재 상태

### 6-1. 가격 전략 (확정)

| 플랜 | 가격 | 주요 혜택 | 상태 |
|------|------|----------|------|
| Free | $0 | 타로 1회/일 + 운세 3회/일 + 원형 매칭 무제한 | ✅ |
| **Premium Monthly** | **$6.99/월** | 전체 기능 무제한 + 프리미엄 전용 기능 | ✅ |
| ~~Deep Reading~~ | ~~$3.99~~ | ~~원타임 심층 리포트~~ | 🔀 미구현 |
| ~~Premium Yearly~~ | ~~$49.99/년~~ | ~~40% 할인~~ | 🔀 미구현 |

### 6-2. 무료 사용 제한 (limit.ts)

| 기능 | 무료 횟수/일 | 프리미엄 |
|------|-------------|---------|
| 타로 리딩 | 1회 | 무제한 |
| 오늘의 운세 | 3회 | 무제한 |
| 원형 매칭 | 무제한 | 무제한 |
| 궁합 분석 | 0회 | 무제한 |
| 10년 대운 | 0회 | 무제한 |
| 월간 운세 | 0회 | 무제한 |
| 연간 운세 | 0회 | 무제한 |

### 6-3. 예상 유닛 이코노믹스

```
Claude API 비용/리딩: ~$0.02 (Haiku 사용 시 더 저렴)
월간 프리미엄 유저 평균 리딩 횟수: ~30회
유저당 월 API 비용: ~$0.60
유저당 월 수익: $6.99
유저당 월 마진: ~$6.39 (91% 마진)
```

---

## 7. 개발 로드맵 — 실행 결과

### Phase 1: 린 MVP ✅ 완료

- [x] 프로젝트 셋업 (Next.js 15 + Supabase + Vercel)
- [x] 랜딩 페이지 (신비로운 다크 테마, SEO 최적화)
- [x] 생년월일시 입력 폼
- [x] 사주팔자 계산 엔진 핵심 로직
- [x] 타로 카드 데이터 & 추첨 로직 (78장)
- [x] Daily 3-Card 타로 리딩 + AI 융합 해석
- [x] 프롬프트 튜닝
- [x] 결과 페이지 하단에 "심층 분석 잠금" 티저 배치
- [x] 기본 다국어 (EN + KO)

### Phase 2: 소셜 검증 + 핵심 기능 ✅ 대부분 완료

- [x] **원형(Archetype) 매칭** — 사주 기반 12원형 성격 분석 ← 바이럴 핵심
- [ ] ~~SNS 공유 카드 생성~~ → 런칭 후 추가
- [x] Supabase Auth (Google 소셜 로그인)
- [x] 오늘의 운세
- [ ] ~~추가 스프레드 (Love, Career)~~ → 런칭 후 추가
- [x] 리딩 히스토리
- [ ] ~~숏폼 콘텐츠 제작~~ → 런칭 후 마케팅 단계
- [ ] ~~JA, ZH 다국어~~ → 트래픽 검증 후 추가

### Phase 3: 수익화 ✅ 완료

- [x] **Lemon Squeezy 연동**
- [x] 프리미엄/무료 기능 분리 (프리미엄 게이트 UI)
- [x] 궁합 분석 기능
- [x] 10년 대운 / 월간 운세 / 연간 운세 (계획보다 확장)
- [ ] ~~PWA + 푸시 알림~~ → 유저 확보 후
- [x] ~~Paddle 백업~~ → 불필요 (LS 확정)

### Phase 4: 성장 최적화 🔄 부분 완료

- [ ] Celtic Cross 스프레드 → 런칭 후
- [x] ~~월간 운세 리포트~~ → Phase 3에서 조기 구현
- [x] SEO 콘텐츠 (블로그 3편)
- [x] SEO 최적화 (sitemap, robots, OG, Search Console)
- [ ] Product Hunt 런칭 → **다음 단계**
- [ ] A/B 테스트 → 트래픽 확보 후

### Phase 5: 런칭 준비 (SPEC 외 추가) ✅ 완료

- [x] Privacy Policy + Terms of Service
- [x] 회원탈퇴 (계정 삭제) 기능
- [x] 피드백/문의 기능
- [x] Google Search Console 인증
- [x] 모바일 터치 영역 44px 수정
- [x] 블로그 og:image 추가
- [x] 궁합 API 응답 키 통일
- [x] hreflang + JSON-LD 구조화 데이터 프롬프트 준비

---

## 8. SEO 전략 — 현재 상태

### 구현 완료 ✅

- 사이트맵 (34개 URL, priority 설정)
- robots.txt
- OG 이미지 (동적 생성 /api/og)
- 메타데이터 (title, description 전 페이지)
- Google Search Console 인증
- SEO 블로그 3편

### 구현 예정 (프롬프트 준비 완료)

- hreflang 태그 (en↔ko 페이지 연결)
- JSON-LD 구조화 데이터 5종 (WebSite, SoftwareApplication, Article, BreadcrumbList, FAQPage)
- Canonical URL

### 키워드 전략

**영어 (메인 타겟):**
"free tarot reading online", "AI tarot reading", "birth chart analysis", "love compatibility test", "fortune telling AI"

**한국어 (서브 타겟):**
"무료 타로", "AI 타로", "사주팔자 무료", "궁합 보기", "오늘의 운세"

**일본어/중국어:** 언어 추가 시 확장 예정

---

## 9. 경쟁사 분석

*(원본과 동일)*

| 서비스 | 강점 | 약점 | 우리의 차별점 |
|--------|------|------|-------------|
| Co-Star | 별자리 전문, 강력한 브랜드 | 타로/사주 없음, 앱만 | 웹 접근성 + 동양운세 |
| Sanctuary | 라이브 점성술사 | 비용 높음 ($20+/세션) | AI 기반 저렴한 가격 |
| 타로 앱들 | 기본 타로 기능 | AI 해석 없음, 정적 해석 | AI 개인화 해석 |
| 만세력 앱 | 정확한 사주 계산 | 한국만 타겟, UI 구식 | 글로벌 + 모던 UI |

---

## 10. 리스크 & 대응 — 업데이트

| 리스크 | 확률 | 심각도 | 대응 | 현재 상태 |
|--------|------|--------|------|----------|
| ~~결제 승인 실패~~ | ~~중~~ | ~~치명적~~ | ~~LS + Paddle 백업~~ | ✅ **해결됨** |
| AI 해석 "챗봇 냄새" | 높 | 높 | 프롬프트 튜닝 + 테스트 | 🔄 지속 개선 중 |
| AI 해석 품질 불안정 | 중 | 높 | 프롬프트 튜닝 + A/B 테스트 | 🔄 런칭 후 데이터 기반 |
| 사주 계산 오류 | 중 | 중 | 검증된 데이터 + 단위 테스트 | ✅ 빌드/타입 통과 |
| API 비용 폭증 | 낮 | 중 | 캐싱 + 무료 제한 | ✅ limit.ts 구현 |
| 문화적 민감성 | 중 | 중 | "entertainment purposes" 고지 | ✅ Terms 면책 조항 |
| 저작권 (타로 이미지) | 중 | 중 | 텍스트 기반 (이미지 미사용) | ✅ 리스크 없음 |
| **초기 트래픽 부족** | **높** | **높** | **PH + 레딧 + 원형 바이럴** | ⏳ **런칭 필요** |

---

## 11. 다음 단계 (런칭 후 로드맵)

### 즉시 (런칭과 함께)
1. Product Hunt 런칭
2. Reddit r/tarot, r/astrology 포스팅
3. hreflang + JSON-LD 구현

### 단기 (첫 유료 유저 이후)
1. 궁합 초대 링크 (바이럴 직결)
2. SNS 공유 카드 생성
3. Yes/No 타로 스프레드
4. 프로필 페이지

### 중기 (트래픽 월 10,000+ 이후)
1. Love/Career 스프레드 추가
2. JA/ZH 다국어 추가
3. PWA 푸시 알림
4. AI 운세 상담 기능
5. AdSense 검토

### 장기 (MRR $500+ 이후)
1. Celtic Cross 스프레드
2. 연간 구독 플랜
3. Stripe Atlas 전환 검토
4. A/B 테스트 (가격, CTA, 온보딩)

---

## 12. 커밋 히스토리 (주요)

| 커밋 | 내용 |
|------|------|
| `413b4a2` | Google Search Console 인증 메타태그 |
| `5dd20ed` | 법적 페이지 + 계정 삭제 + 피드백 기능 |
| `ae80028` | 프리미엄 기능 3종 (10년 대운/월간/연간 운세) |

---

## 13. 구현 일치율 요약

**PDCA 갭 분석: 78%**

| 카테고리 | 계획 | 완료 | 비율 |
|---------|------|------|------|
| 무료 기능 | 3 | 3 (원형 매칭 대체 포함) | 100% |
| 프리미엄 기능 | 8 | 6 | 75% |
| 바이럴 기능 | 3 | 0 | 0% |
| 인프라 | 5 | 5+ | 100%+ |
| 법적/운영 | 0 (미계획) | 4 | 보너스 |
| SEO | 2 | 5+ | 100%+ |
| 다국어 | 4 | 2 | 50% |

**결론:** MVP로서 런칭 가능 상태. 미구현 항목은 런칭 후 데이터 기반으로 우선순위 결정.