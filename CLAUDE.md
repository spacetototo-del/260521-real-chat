# 프로젝트 컨텍스트

## 프로젝트 개요
팀 전용 익명 실시간 채팅앱 (Next.js + Supabase Realtime + Vercel)

## 기술 스택
- Framework: Next.js (App Router, TypeScript, Tailwind CSS)
- Database: Supabase
- Hosting: Vercel
- 설치된 패키지: @supabase/supabase-js

## 환경변수 (.env.local)
- NEXT_PUBLIC_SUPABASE_URL: Supabase 프로젝트 URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon 키
- 환경변수는 이미 세팅되어 있음. 코드에서 직접 사용하면 됨

## Supabase 테이블 구조

### messages 테이블
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | 자동 생성 (PK) |
| content | text | 메시지 내용 |
| created_at | timestamptz | 자동 생성 |

- Realtime 활성화됨
- RLS 비활성화됨 (익명 접근 허용)

## 앱 구조
- app/page.tsx: 메인 화면 (여기에 작성)
- app/layout.tsx: 레이아웃 (수정 불필요)

## 코드 작성 규칙
- 모든 컴포넌트는 app/page.tsx 하나에 작성
- Supabase 클라이언트는 컴포넌트 외부에서 한 번만 생성
- 모바일 친화적 디자인 (Tailwind CSS 사용)
- TypeScript 타입 명시
