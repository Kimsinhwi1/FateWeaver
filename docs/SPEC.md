# 🔮 AI Fortune Teller — 프로젝트 기획서

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

---

## 2. 핵심 기능 설계

### 2-1. 무료 티어 (Free)

| 기능 | 설명 |
|------|------|
| **오늘의 타로** | 매일 1회, 3장 카드 스프레드 + AI 해석 |
| **간단 사주 프로필** | 생년월일시 입력 → 사주 기본 성격 분석 |
| **오늘의 운세** | 사주 + 별자리 기반 일일 운세 (짧은 버전) |

### 2-2. 프리미엄 티어 ($6.99/월)

| 기능 | 설명 |
|------|------|
| **무제한 타로 리딩** | 원할 때 언제든 + 다양한 스프레드 (연애, 커리어, 재물 등) |
| **심층 사주 분석** | 10년 대운, 올해 운세, 성격 심층 분석 |
| **궁합 분석** | 두 사람의 사주 + 별자리 궁합을 AI가 종합 해석 |
| **월간 운세 리포트** | 매월 AI가 생성하는 상세 월간 예측 |
| **AI 운세 상담** | 고민을 말하면 AI가 타로 + 사주 기반으로 조언 |
| **리딩 히스토리** | 과거 리딩 기록 저장 및 열람 |

### 2-3. 바이럴 기능

| 기능 | 설명 |
|------|------|
| **공유 카드** | 타로 결과를 SNS용 예쁜 이미지로 자동 생성 |
| **궁합 초대** | "나와 궁합 확인해볼래?" 링크 공유 |
| **오늘의 운세 위젯** | PWA 알림으로 매일 아침 운세 푸시 |

---

## 3. 기술 아키텍처

### 3-1. 기술 스택

```
프론트엔드:  Next.js 15 (App Router) + Tailwind CSS
백엔드:      Next.js API Routes + Supabase (DB + Auth)
AI:          Anthropic Claude API (운세 해석 생성)
결제:        Paddle (1순위) / Lemon Squeezy (백업) — 아래 결제 전략 참고
배포:        Cloudflare Pages
다국어:      next-intl (영어, 한국어, 일본어, 중국어 우선)
이미지:      Canvas API / html2canvas (공유카드 생성)
```

### ⚠️ 3-1-1. 결제 게이트웨이 전략 (현실 반영)

**핵심 제약:** 한국 법인/개인사업자로는 Stripe 계정 개설이 불가능하다.
미국/호주/싱가포르 법인이 필요하며, 이는 초기 비용($500+)과 세무 복잡성을 동반한다.

**따라서 Stripe는 "성장 후 전환" 옵션이지, 초기 선택지가 아니다.**

**결제 수단 우선순위 (한국 솔로 개발자 기준):**

| 순위 | 서비스 | 장점 | 단점 | 수수료 |
|------|--------|------|------|--------|
| 1순위 | **Paddle** | MoR 모델(세금 자동처리), 한국에서 사용 가능, 220국 지원 | 심사 있음, 수수료 높음 | ~5% + $0.50 |
| 2순위 | **Lemon Squeezy** | 이미 사용 경험 있음, 연동 익숙함 | HabitGlow에서 승인 지연 경험 | 5% + $0.50 |
| 보조 | **Buy Me a Coffee** | 즉시 사용, 심사 없음 | 정식 구독 기능 제한적 | 5% |
| 성장 후 | **Stripe Atlas** | 업계 표준, 낮은 수수료(2.9%) | 미국 법인 설립 필요 ($500+), 세무 복잡 | 2.9% + $0.30 |

**실행 전략:**
1. MVP 단계 (Week 1-2): 결제 없이 무료 기능으로 트래픽 검증
2. Phase 3 진입 전: Paddle 계정 신청 (심사 2-4주 소요)
3. Paddle 승인 시 → Paddle로 결제 연동
4. Paddle 거절 시 → Lemon Squeezy (기존 경험 활용)
5. 둘 다 실패 시 → Buy Me a Coffee로 임시 수익화 + Stripe Atlas 검토
6. MRR $500 돌파 시 → Stripe Atlas로 미국 법인 설립 후 전환 검토

**결제 추상화는 여전히 필수:**
어떤 결제사를 쓰든 갈아끼울 수 있도록 인터페이스를 통일해둔다.

```typescript
// 결제 서비스 추상화 — "콘센트 규격 통일"
// 비유: USB-C 포트처럼, 어떤 충전기(결제사)를 꽂든 작동하는 구조
interface PaymentProvider {
  createCheckout(priceId: string, userId: string): Promise<string>;
  verifySubscription(userId: string): Promise<boolean>;
  handleWebhook(payload: unknown): Promise<void>;
}

// Paddle용 구현
class PaddleProvider implements PaymentProvider { ... }

// Lemon Squeezy용 구현 (백업)
class LemonSqueezyProvider implements PaymentProvider { ... }
```

### 3-2. 시스템 흐름

```
[유저] → 생년월일시 입력 → [Supabase] 프로필 저장
                              ↓
[유저] → 타로 리딩 요청 → [API Route] → 카드 랜덤 선택
                              ↓
                    [Claude API] → 카드 + 사주 데이터 기반 해석 생성
                              ↓
                    [Supabase] 리딩 결과 저장 → [유저] 결과 표시
```

### 3-3. DB 스키마 (Supabase)

```sql
-- 유저 프로필 (사주/별자리 기본 정보)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  birth_date DATE NOT NULL,
  birth_time TIME,                    -- 시간 모르면 NULL
  birth_timezone TEXT DEFAULT 'UTC',  -- 태어난 곳 시간대
  gender TEXT,                        -- 사주 해석에 영향
  zodiac_sign TEXT,                   -- 자동 계산된 별자리
  saju_data JSONB,                    -- 사주 사주팔자 계산 결과 캐싱
  locale TEXT DEFAULT 'en',
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 타로 리딩 기록
CREATE TABLE tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  spread_type TEXT NOT NULL,          -- 'daily_3card', 'love', 'career', 'celtic_cross'
  question TEXT,                      -- 유저가 물어본 질문
  cards JSONB NOT NULL,               -- [{position, card_id, is_reversed}]
  interpretation TEXT NOT NULL,       -- AI가 생성한 해석
  reading_type TEXT DEFAULT 'free',   -- 'free' | 'premium'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사주 분석 기록
CREATE TABLE saju_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  reading_type TEXT NOT NULL,         -- 'basic', 'yearly', 'deep', 'compatibility'
  target_year INTEGER,                -- 연도별 분석일 경우
  partner_birth_date DATE,            -- 궁합일 경우
  partner_birth_time TIME,
  analysis TEXT NOT NULL,             -- AI가 생성한 분석
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 일일 운세 (캐싱용 - 같은 날 같은 유저 재요청 시 재사용)
CREATE TABLE daily_fortunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  fortune_date DATE NOT NULL,
  content TEXT NOT NULL,
  lucky_color TEXT,
  lucky_number INTEGER,
  mood_score INTEGER,                 -- 1-10
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, fortune_date)       -- 하루에 하나만
);

-- RLS 정책: 모든 테이블에 "자기 데이터만 접근" 적용
```

### 3-4. 프로젝트 디렉토리 구조

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                  # 랜딩 페이지
│   │   ├── tarot/
│   │   │   ├── page.tsx              # 타로 메인 (스프레드 선택)
│   │   │   └── [readingId]/page.tsx  # 리딩 결과
│   │   ├── saju/
│   │   │   ├── page.tsx              # 사주 메인
│   │   │   └── [readingId]/page.tsx  # 분석 결과
│   │   ├── daily/page.tsx            # 오늘의 운세
│   │   ├── compatibility/page.tsx    # 궁합
│   │   ├── history/page.tsx          # 리딩 기록
│   │   ├── profile/page.tsx          # 프로필 설정
│   │   └── pricing/page.tsx          # 요금제
│   └── api/
│       ├── tarot/
│       │   └── reading/route.ts      # 타로 리딩 생성
│       ├── saju/
│       │   └── analysis/route.ts     # 사주 분석 생성
│       ├── daily/
│       │   └── fortune/route.ts      # 일일 운세 생성
│       └── webhooks/
│           └── payments/route.ts     # 결제 웹훅 (Paddle/LemonSqueezy 추상화)
├── components/
│   ├── tarot/
│   │   ├── tarot-card.tsx            # 타로 카드 UI
│   │   ├── card-spread.tsx           # 카드 배치 레이아웃
│   │   └── reading-result.tsx        # 리딩 결과 표시
│   ├── saju/
│   │   ├── saju-chart.tsx            # 사주 차트 시각화
│   │   └── element-badge.tsx         # 오행 뱃지 (木火土金水)
│   ├── shared/
│   │   ├── share-card.tsx            # SNS 공유 카드 생성
│   │   ├── premium-gate.tsx          # 프리미엄 잠금 UI
│   │   └── birth-input-form.tsx      # 생년월일시 입력 폼
│   └── layout/
│       ├── header.tsx
│       └── footer.tsx
├── lib/
│   ├── tarot/
│   │   ├── cards.ts                  # 78장 타로카드 데이터
│   │   ├── spreads.ts                # 스프레드 타입 정의
│   │   └── draw.ts                   # 카드 추첨 로직
│   ├── saju/
│   │   ├── calculator.ts             # 사주팔자 계산 엔진
│   │   ├── elements.ts               # 오행 (木火土金水) 로직
│   │   ├── stems-branches.ts         # 천간지지 데이터
│   │   └── interpretation.ts         # 사주 해석 매핑
│   ├── zodiac/
│   │   └── signs.ts                  # 12별자리 계산
│   ├── ai/
│   │   ├── prompts.ts                # AI 프롬프트 템플릿
│   │   └── client.ts                 # Claude API 클라이언트
│   ├── supabase/
│   │   ├── client.ts                 # Supabase 클라이언트
│   │   └── server.ts                 # 서버 사이드 클라이언트
│   └── utils/
│       ├── date.ts                   # 날짜/시간 유틸
│       └── share.ts                  # 공유 링크 생성
├── types/
│   ├── tarot.ts                      # 타로 관련 타입
│   ├── saju.ts                       # 사주 관련 타입
│   └── user.ts                       # 유저 관련 타입
└── i18n/
    ├── en.json
    ├── ko.json
    ├── ja.json
    └── zh.json
```

---

## 4. 사주팔자 계산 로직 설계

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

### 4-2. 계산 흐름

```
생년월일시 입력
    ↓
음력 변환 (한국 음력 기준)
    ↓
년주 계산: (연도 - 4) % 60 → 60갑자 인덱스
월주 계산: 연간(年干) 기반 월간 + 월지
일주 계산: 만세력 기반 일진 조회
시주 계산: 일간(日干) 기반 시간 + 시지
    ↓
오행 분포 분석 (각 글자의 오행 합산)
    ↓
용신(用神) 판단 (부족한 오행 보완)
    ↓
AI에게 전달하여 자연어 해석 생성
```

### 4-3. AI에게 전달할 사주 데이터 구조

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

### 5-1. 78장 타로 덱 구성

```
메이저 아르카나 (22장): The Fool(0) ~ The World(21)
마이너 아르카나 (56장):
  - Wands(완드/지팡이) Ace~10 + Page, Knight, Queen, King
  - Cups(컵) Ace~10 + Page, Knight, Queen, King
  - Swords(검) Ace~10 + Page, Knight, Queen, King
  - Pentacles(동전) Ace~10 + Page, Knight, Queen, King
```

### 5-2. 스프레드 타입

| 스프레드 | 카드 수 | 용도 | 티어 |
|---------|---------|------|-----|
| Daily 3-Card | 3장 | 과거-현재-미래 | Free |
| Love Spread | 5장 | 연애/관계 | Premium |
| Career Spread | 5장 | 진로/직장 | Premium |
| Celtic Cross | 10장 | 심층 분석 | Premium |
| Yes/No | 1장 | 빠른 질문 | Free (1일 3회) |

### 5-3. AI 프롬프트 전략 — "프롬프트가 곧 제품" (Gemini 피드백 반영)

운세 앱에서 AI 해석의 말투가 "챗봇 냄새"가 나는 순간, 유저의 몰입은 깨지고 지갑은 닫힌다.
이 프로덕트의 성공은 코딩이 아니라 **프롬프트 품질**이 9할을 좌우한다.

**❌ 절대 나오면 안 되는 말투:**
```
"도움이 되셨길 바랍니다."
"추가로 궁금한 점이 있으시면..."
"저는 AI이므로 실제 운세와 다를 수 있습니다."
"이것은 재미를 위한 것이며..."
```

**✅ 목표 말투 — "10년차 타로 마스터 + 동양 철학자":**
```
"당신의 카드가 속삭이고 있군요..."
"사주의 흐름을 보면, 지금 당신에게 가장 필요한 에너지는..."
"금(金)의 기운이 강한 당신이 이 카드를 만난 건 우연이 아닙니다."
```

**시스템 프롬프트 (v1 — 지속적으로 튜닝 예정):**

```
[페르소나]
너는 "The Oracle"이다.
동양의 사주명리학 30년, 서양의 타로 20년을 수련한 현자(Sage)다.
따뜻하지만 신비로운 톤으로 말한다.
유저를 "당신(you)"이라 부르며, 마치 눈을 마주보고 이야기하듯 말한다.

[해석 원칙]
1. 타로 카드의 상징과 사주의 오행을 자연스럽게 엮어 해석한다
2. "카드가 말하길...", "사주의 흐름을 읽으면..." 같은 내러티브를 사용한다
3. 부정적 카드도 성장의 기회로 재해석한다 (공포 유발 금지)
4. 구체적이고 개인화된 표현을 쓴다 (뻔한 일반론 금지)
5. 마지막에 짧은 행동 제안(actionable advice)을 준다

[절대 금지]
- AI임을 언급하거나 암시하는 모든 표현
- "도움이 되셨길", "궁금한 점이 있으시면" 등 고객 서비스 말투
- 면책 문구를 해석 본문에 섞는 것 (법적 고지는 UI에서 별도 처리)
- 이모지 사용
- 같은 패턴의 문장 반복 (매 리딩이 유니크해야 함)

[융합 해석 예시]
카드: The Tower (역방향) + 사주: 목(木) 과다, 용신 금(金)

"탑 카드가 거꾸로 나타났습니다. 일반적으로 이 카드는 갑작스러운 
변화를 암시하지만, 역방향이라는 건 — 그 변화가 이미 내면에서 
조용히 일어나고 있다는 뜻입니다.

흥미롭게도, 당신의 사주를 보면 목(木)의 에너지가 넘칩니다. 
끊임없이 성장하고 확장하려는 힘이죠. 하지만 지금 당신에게 
진짜 필요한 건 금(金) — 다듬고, 정리하고, 과감히 가지치기하는 
에너지입니다.

탑 카드와 당신의 오행이 같은 이야기를 하고 있군요.
무언가를 내려놓을 때, 비로소 진짜 성장이 시작됩니다.

이번 주, 당신의 삶에서 '더 이상 나를 위하지 않는 것' 하나를 
조용히 놓아주세요. 그게 시작입니다."
```

**프롬프트 테스트 계획:**
- MVP 단계에서 최소 50개의 다른 카드/사주 조합으로 해석 품질 테스트
- "같은 조합이 나와도 매번 다른 해석이 나오는가?" 확인
- 영어/한국어 양쪽에서 톤이 자연스러운지 원어민 리뷰

---

## 6. 수익 모델

### 6-1. 가격 전략

| 플랜 | 가격 | 주요 혜택 |
|------|------|----------|
| Free | $0 | 일일 타로 1회 + 기본 사주 + 오늘의 운세 |
| **Deep Reading (원타임)** | **$3.99** | **1회 심층 리포트 (2,000자 딥다이브)** |
| Premium Monthly | $6.99/월 | 전체 기능 무제한 |
| Premium Yearly | $49.99/년 ($4.17/월) | 40% 할인 |

**원타임 결제를 추가한 이유 (Gemini 피드백 반영):**
구독은 허들이 높다. 특히 운세처럼 "지금 당장 궁금한" 충동 구매가 많은 카테고리에서는
$3.99 원타임 결제가 전환율이 훨씬 높을 수 있다.
유저를 "원타임 → 구독"으로 넘기는 퍼널로 활용.

### 6-2. 예상 유닛 이코노믹스

```
Claude API 비용/리딩: ~$0.02 (Haiku 사용 시 더 저렴)
월간 프리미엄 유저 평균 리딩 횟수: ~30회
유저당 월 API 비용: ~$0.60
유저당 월 수익: $6.99
유저당 월 마진: ~$6.39 (91% 마진)
```

---

## 7. 개발 로드맵 (8주) — 린 MVP 전략 적용 (Gemini 피드백 반영)

**원칙:** 거대한 플랫폼을 한 번에 만들지 않는다.
"트래픽 검증 → 결제 검증 → 기능 확장" 순서로 진행한다.

### Phase 1: 린 MVP (Week 1-2) — "돌아가는 최소 제품"
목표: **"생년월일 입력 → 타로 1-3장 + 사주 융합 해석"이 나오는 것**

- [ ] 프로젝트 셋업 (Next.js 15 + Supabase + Cloudflare)
- [ ] 랜딩 페이지 (신비로운 다크 테마, SEO 최적화)
- [ ] 생년월일시 입력 폼 (Auth 없이도 사용 가능하게)
- [ ] 사주팔자 계산 엔진 핵심 로직 (lib/saju/)
- [ ] 타로 카드 데이터 & 추첨 로직 (78장)
- [ ] Daily 3-Card 타로 리딩 + AI 융합 해석
- [ ] **프롬프트 튜닝** (50개 조합 테스트 → 해석 품질 확보)
- [ ] 결과 페이지 하단에 "심층 분석 잠금" 티저 배치
- [ ] 기본 다국어 (EN + KO)

**검증 지표:** 일일 방문자 수, 리딩 완료율, 체류 시간

### Phase 2: 소셜 검증 + 핵심 기능 (Week 3-4)
목표: **바이럴 루프 + 트래픽 확보**

- [ ] SNS 공유 카드 생성 (인스타/틱톡용 이미지)
- [ ] Supabase Auth (Google 소셜 로그인)
- [ ] 오늘의 운세 (사주 + 별자리 기반)
- [ ] 추가 스프레드 (Love, Career)
- [ ] 리딩 히스토리 (로그인 유저용)
- [ ] 숏폼 콘텐츠 제작 & 배포 (틱톡, 인스타 릴스, 레딧)
- [ ] JA, ZH 다국어 추가

**검증 지표:** 공유 횟수, 소셜 유입, 재방문율

### Phase 3: 수익화 (Week 5-6)
목표: **결제 → 첫 매출 달성**

- [ ] **Paddle 연동** (Phase 1 시작과 동시에 계정 신청해둘 것, 심사 2-4주)
- [ ] 프리미엄/무료 기능 분리 (프리미엄 게이트 UI)
- [ ] 심층 사주 분석 (프리미엄 전용)
- [ ] 궁합 분석 기능 (바이럴 + 프리미엄)
- [ ] PWA + 푸시 알림 (오늘의 운세)
- [ ] Paddle 거절 시 Lemon Squeezy 즉시 전환

**검증 지표:** 전환율, MRR, 이탈율

### Phase 4: 성장 최적화 (Week 7-8)
목표: **$500 MRR 달성 기반 마련**

- [ ] Celtic Cross 스프레드 (프리미엄 심층)
- [ ] 월간 운세 리포트 (프리미엄)
- [ ] SEO 콘텐츠 (블로그: "What is Saju?", "Tarot vs Astrology" 등)
- [ ] 성능 최적화 (Core Web Vitals)
- [ ] Product Hunt 런칭
- [ ] A/B 테스트 (가격, CTA, 온보딩 플로우)

### 📱 숏폼 바이럴 전략 (Gemini 피드백 반영)

운세는 틱톡/릴스에서 가장 바이럴이 잘 터지는 소재 중 하나.

**콘텐츠 예시:**
- "이 AI가 내 생년월일만으로 소름끼치게 맞춤 ㄷㄷ"
- "AI mixed my Korean birth chart with Tarot and I'm SHOOK"
- "POV: AI reads your fate using ancient Eastern + Western wisdom"

**실행:**
- Phase 2에서 공유 카드 기능 완성 후 바로 숏폼 제작
- 화면 녹화 → 리액션 형태 → 글로벌(EN) + 한국(KO) 양쪽 배포
- 레딧 r/tarot, r/astrology 커뮤니티에 자연스러운 포스팅

---

## 8. SEO 키워드 전략

### 영어 (메인 타겟)
- "free tarot reading online" — 검색량 매우 높음
- "AI tarot reading" — 성장 중, 경쟁 아직 낮음
- "birth chart analysis" — 안정적 검색량
- "love compatibility test" — 바이럴 잠재력 높음
- "fortune telling AI" — 블루오션 키워드

### 한국어 (서브 타겟)
- "무료 타로" / "AI 타로"
- "사주팔자 무료"
- "궁합 보기"
- "오늘의 운세"

### 일본어 (서브 타겟)
- "タロット占い 無料" / "AI占い"
- "四柱推命"
- "相性占い"

---

## 9. 경쟁사 분석

| 서비스 | 강점 | 약점 | 우리의 차별점 |
|--------|------|------|-------------|
| Co-Star | 별자리 전문, 강력한 브랜드 | 타로/사주 없음, 앱만 | 웹 접근성 + 동양운세 |
| Sanctuary | 라이브 점성술사 | 비용 높음 ($20+/세션) | AI 기반 저렴한 가격 |
| 타로 앱들 | 기본 타로 기능 | AI 해석 없음, 정적 해석 | AI 개인화 해석 |
| 만세력 앱 | 정확한 사주 계산 | 한국만 타겟, UI 구식 | 글로벌 + 모던 UI |

---

## 10. 리스크 & 대응

| 리스크 | 확률 | 심각도 | 대응 |
|--------|------|--------|------|
| **결제 승인 실패 (최우선)** | **중** | **치명적** | **Paddle 1순위 + Lemon Squeezy 백업 + 결제 추상화 설계. Phase 1 시작일에 즉시 Paddle 계정 신청. MRR $500 이후 Stripe Atlas 검토** |
| AI 해석 "챗봇 냄새" | 높 | 높 | 프롬프트 v1부터 철저한 튜닝 + 50개 조합 테스트 + 지속적 개선 |
| AI 해석 품질 불안정 | 중 | 높 | 프롬프트 튜닝 + 해석 템플릿 + A/B 테스트 |
| 사주 계산 오류 | 중 | 중 | 검증된 만세력 데이터 사용 + 단위 테스트 |
| API 비용 폭증 | 낮 | 중 | Haiku 사용 + 캐싱 전략 + 무료 사용 제한 |
| 문화적 민감성 | 중 | 중 | "entertainment purposes" 고지 + 문화 중립 표현 |
| 저작권 (타로 이미지) | 중 | 중 | 퍼블릭 도메인 이미지 또는 AI 생성 이미지 사용 |