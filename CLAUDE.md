# FateWeaver

## 프로젝트 개요
FateWeaver — 동양 사주 × 서양 타로를 AI가 융합 해석하는 글로벌 운세 서비스

## 필수 참고 문서
- 전체 기획서: docs/SPEC.md (반드시 먼저 읽을 것)

## 기술 스택
- Next.js 15 (App Router) + Tailwind CSS
- Supabase (DB + Auth)
- Anthropic Claude API
- Cloudflare Pages 배포
- Paddle (결제)

## 코드 규칙
- 파일 하나에 하나의 역할만
- 한국어 주석으로 "왜(why)"를 설명
- any 사용 금지, 타입 명시
- 코드 작성 후 초보자 눈높이로 원리와 이유를 비유와 함께 설명

## 현재 Phase
Phase 1: 린 MVP (생년월일 입력 → 타로 3카드 + 사주 융합 해석)