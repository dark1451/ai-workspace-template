# 개발 스택

## 권장 아키텍처 (기본)

| 계층 | 선택 | 비고 |
|------|------|------|
| 프론트엔드 | **Next.js (App Router)** | React, SSR/SSG, 파일 기반 라우팅 |
| 백엔드 API | **Next.js Route Handlers / Server Actions** | Vercel 서버리스 함수로 배포 |
| 배포·호스팅 | **Vercel** | GitHub 연동, Preview/Production 배포 |
| DB / BaaS | **Supabase (PostgreSQL SaaS)** | Auth, RLS, Storage, Realtime, 마이그레이션 |
| 소스·CI 트리거 | **GitHub** | Vercel·Supabase 양쪽 GitHub Integration |

```
GitHub (push / PR)
    ├─→ Vercel GitOps ──→ Next.js 앱 (프론트 + API Routes)
    └─→ Supabase ─────→ PostgreSQL 마이그레이션·브랜치 DB(선택)

Next.js (Vercel) ──@supabase/supabase-js / @supabase/ssr──→ Supabase
```

- **프론트**: 클라이언트 컴포넌트 + `@supabase/supabase-js`(Publishable key)
- **서버 API**: Route Handlers·Server Actions + `@supabase/ssr` 또는 Secret key(서버 전용 env)
- **DB·인증·스토리지**: Supabase PostgreSQL SaaS에 위임. Edge Functions는 Supabase 측 보조 로직이 필요할 때만 사용

### GitHub 연동 (권장)

수동 배포·env 복붙 대신 **GitHub Integration**을 기본으로 한다.

| 서비스 | 연동 방법 | 효과 |
|--------|-----------|------|
| **Vercel** | Vercel 대시보드 → Import Git Repository → GitHub 앱 설치 | `main` push → Production, PR → Preview URL 자동 생성 |
| **Supabase** | Supabase 대시보드 → Project Settings → Integrations → GitHub | `supabase/migrations/` 변경을 push 시 자동 적용(설정 시), 브랜치별 DB(선택) |

**권장 초기 세팅 순서**

1. GitHub에 모노레포 생성·push
2. [Supabase](https://supabase.com)에서 프로젝트 생성 → GitHub Integration 연결 → `supabase init` / `supabase link`로 마이그레이션 디렉터리 연동
3. [Vercel](https://vercel.com)에서 동일 GitHub 리포 Import → Root Directory를 `apps/web`(또는 Next.js 앱 경로)로 지정
4. Vercel Environment Variables에 Supabase URL·키 등록(Production / Preview / Development 구분)
5. Supabase Auth → URL Configuration에 Vercel Production·Preview 도메인 등록

상세 절차: `docs/runbook/runbook.md`의 **Supabase·Vercel GitHub 연동** 섹션.

## 웹 애플리케이션

| 영역 | 선택 | 비고 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | `app/` 라우트, Route Handlers (`app/api/`) |
| 언어 | TypeScript | 타입 안전성, 에이전트 코드 분석에 유리 |
| 테스트 | Vitest (단위/통합) | 컴포넌트·유틸·API 핸들러 단위 |
| E2E | cursor-ide-browser MCP / Playwright | 태스크 타입별 선택 적용 |
| 패키지 매니저 | pnpm | 워크스페이스 지원 |

## 백엔드 / BaaS (Supabase)

| 영역 | 선택 | 비고 |
|------|------|------|
| DB | Supabase PostgreSQL (SaaS) | RLS, SQL 마이그레이션, `supabase db push` |
| 인증 | Supabase Auth | 이메일/소셜 로그인, Vercel 도메인 콜백 |
| Storage | Supabase Storage | 파일 업로드/다운로드 |
| Realtime | Supabase Realtime | 필요 시 사용 |
| Edge Functions | Supabase Edge Functions | Vercel API로 처리하기 어려운 장기 작업·웹훅 등 |

서버 비밀(Secret key)은 **Vercel 환경 변수(서버 전용)**에만 두고, 클라이언트 번들·`NEXT_PUBLIC_*`에는 넣지 않는다.

## 배포 (Vercel)

| 영역 | 선택 | 비고 |
|------|------|------|
| 호스팅 | Vercel | Next.js 네이티브 지원 |
| Preview | PR별 자동 Preview | GitHub Integration |
| Production | `main`(또는 지정 브랜치) push | GitHub Integration |
| env | Vercel Dashboard / CLI | Preview·Production 분리 |

## 템플릿 뼈대 (현재 `apps/web`)

템플릿에 포함된 `apps/web`은 **Vite + React SPA** 최소 뼈대다. Supabase 클라이언트 연동 예시·Vitest 설정이 들어 있다.

- **Vercel + Next.js API/프론트**를 쓸 프로젝트는 `apps/web`을 **Next.js App Router로 전환**하는 것을 권장한다.
- 전환 시 `docs/runbook/runbook.md`, `docs/architecture/env-template.md`, Vercel Root Directory·빌드 명령을 함께 갱신한다.
- 단순 정적 SPA·내부 도구처럼 서버 API가 필요 없으면 Vite 뼈대를 그대로 써도 된다(배포는 Vercel Static 또는 다른 정적 호스팅).

### 대안

- **Vite + React (현재 뼈대)**: 서버 API 없이 Supabase 클라이언트만 쓰는 SPA. 빠른 프로토타입·내부 도구에 적합.
- **Supabase Edge Functions 단독**: Next.js API 대신 Edge Functions에 로직을 두는 구성(팀 선호·레이턴시 요구에 따라 선택).

## 모노레포 구조

```
ai-workspace/
├── AGENTS.md
├── docs/
│   ├── specs/
│   ├── ideas/
│   ├── architecture/     # 스택·env 템플릿
│   └── runbook/          # 설치, GitHub 연동, 배포
├── design/
├── tasks/
├── supabase/             # 마이그레이션·시드 (Supabase CLI)
│   └── migrations/
├── apps/
│   └── web/              # Next.js 권장 / 현재는 Vite 뼈대
│       ├── app/          # (Next.js 전환 시) 페이지·API Routes
│       ├── src/
│       └── package.json
└── .cursor/rules/
```

## 환경 변수

환경 변수 템플릿은 `docs/architecture/env-template.md`를 참조한다.

- **Next.js(권장)**: `NEXT_PUBLIC_*`(클라이언트), 서버 전용 변수(Vercel에만 등록)
- **Vite(현재 뼈대)**: `VITE_*` 접두사

실제 시크릿은 `.env` / Vercel Environment Variables에 저장하며 리포에 커밋하지 않는다.
