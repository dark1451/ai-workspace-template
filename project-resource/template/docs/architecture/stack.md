# 개발 스택

## 권장 아키텍처

| 계층 | 선택 | 비고 |
|------|------|------|
| 프론트엔드 | **Next.js (App Router)** | React, SSR/SSG, Server Components |
| 백엔드 API | **Next.js Route Handlers / Server Actions** | Vercel 서버리스 함수로 배포 |
| 배포·호스팅 | **Vercel** | GitHub 연동, Preview/Production 배포 |
| DB / BaaS | **Supabase (PostgreSQL SaaS)** | Auth, RLS, Storage, Realtime, 마이그레이션 |
| 소스·CI 트리거 | **GitHub** | Vercel·Supabase 양쪽 GitHub Integration |

```
GitHub (push / PR)
    ├─→ Vercel GitOps ──→ Next.js (프론트 + app/api/*)
    └─→ Supabase ─────→ PostgreSQL 마이그레이션·브랜치 DB(선택)

Next.js 서버 (Vercel) ── Secret key ──→ Supabase
         ↑
    브라우저는 Supabase에 직접 연결하지 않음
```

## Supabase 접근 원칙 (베스트 프랙티스)

**Publishable(anon) 키를 브라우저에 노출하지 않는다.**

| 하지 않을 것 | 대신 할 것 |
|--------------|------------|
| 클라이언트 컴포넌트에서 `@supabase/supabase-js` 직접 호출 | Route Handlers·Server Actions·Server Components에서만 Supabase 호출 |
| `NEXT_PUBLIC_*` Supabase 키 | 서버 전용 env: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` |
| SPA에서 anon key로 DB 직접 접근 | Next.js 서버가 Secret key로 Supabase 호출 후 결과만 클라이언트에 전달 |

- 서버 클라이언트: `apps/web/lib/supabase/server.ts` (`createServerSupabaseClient`)
- env는 **Vercel Environment Variables** 또는 로컬 `.env.local`에만 둔다.
- 사용자 단위 RLS·세션 쿠키가 필요해지면 `@supabase/ssr`을 **서버 전용**으로 도입한다. 그때도 Publishable 키는 `NEXT_PUBLIC_` 없이 서버 env에만 둔다.

### GitHub 연동 (권장)

| 서비스 | 연동 | 효과 |
|--------|------|------|
| **Vercel** | Import Git Repository → GitHub 앱 | PR Preview, `main` Production 자동 배포 |
| **Supabase** | Integrations → GitHub | `supabase/migrations/` push 시 DB 반영 |

초기 세팅 순서는 `docs/runbook/runbook.md` 참조.

## 웹 애플리케이션 (`apps/web`)

| 영역 | 선택 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | `app/`, `app/api/` |
| 언어 | TypeScript | strict |
| 테스트 | Vitest | 페이지·유틸 단위 |
| E2E | cursor-ide-browser MCP / Playwright | 태스크별 선택 |
| 패키지 매니저 | pnpm | 모노레포 워크스페이스 |

## 백엔드 / BaaS (Supabase)

| 영역 | 선택 | 비고 |
|------|------|------|
| DB | Supabase PostgreSQL (SaaS) | RLS, SQL 마이그레이션 |
| 인증 | Supabase Auth | 콜백 URL에 Vercel 도메인 등록 |
| Storage | Supabase Storage | 서버 경유 업로드·서명 URL 권장 |
| Realtime | Supabase Realtime | 필요 시 서버·웹소켓 프록시 검토 |
| Edge Functions | Supabase Edge Functions | Vercel API로 처리 어려운 보조 로직 |

## 배포 (Vercel)

| 영역 | 선택 | 비고 |
|------|------|------|
| Root Directory | `apps/web` | 모노레포 |
| Framework | Next.js | 자동 감지 |
| env | Vercel Dashboard | `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (서버 전용) |

## 모노레포 구조

```
ai-workspace/
├── AGENTS.md
├── docs/
│   ├── architecture/
│   └── runbook/
├── supabase/
│   └── migrations/
├── apps/
│   └── web/              # Next.js + Vercel
│       ├── app/
│       │   ├── page.tsx
│       │   └── api/
│       └── lib/
│           └── supabase/
│               └── server.ts
└── .cursor/rules/
```

## 환경 변수

`docs/architecture/env-template.md` 참조. **필수 2개만**: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (서버 전용).
