# 실행 가이드 (Runbook)

> `apps/web` 기준. 패키지 매니저는 **pnpm**을 사용한다.  
> **권장 스택**: Supabase (PostgreSQL SaaS) + Next.js (프론트·API) + Vercel + GitHub Integration. 상세는 `docs/architecture/stack.md`.

## 사전 요구사항

- Node.js >= 18
- pnpm >= 9 (`corepack enable && corepack prepare pnpm@latest --activate`)
- (권장) [Supabase CLI](https://supabase.com/docs/guides/cli) — 로컬 DB·마이그레이션
- (권장) [Vercel CLI](https://vercel.com/docs/cli) — 로컬 env pull·배포 확인

## 설치

```bash
pnpm install
```

모노레포 루트에서 실행하면 모든 워크스페이스 패키지가 설치된다.

## Supabase·Vercel GitHub 연동 (권장)

수동 env 복사·수동 배포 대신 **GitHub를 단일 소스**로 두고 Vercel·Supabase를 연동하는 것을 기본으로 한다.

### 1. GitHub 리포지토리

```bash
git init
git remote add origin git@github.com:<org>/<repo>.git
git push -u origin main
```

### 2. Supabase 프로젝트 + GitHub Integration

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 New Project 생성 (PostgreSQL SaaS).
2. **Project Settings → Integrations → GitHub**에서 리포지토리 연결.
3. 프로젝트 루트에서 Supabase CLI 초기화(최초 1회):

```bash
npx supabase init
npx supabase link --project-ref <project-ref>
```

4. `supabase/migrations/`에 SQL 마이그레이션을 추가하고 push하면, GitHub Integration 설정에 따라 원격 DB에 반영된다.
5. API Keys(URL, Publishable key, Secret key)는 **Integrations → Vercel**로 넘기거나 Vercel env에 수동 등록한다. Supabase ↔ Vercel 공식 연동을 쓰면 env 동기화가 편하다.

로컬 Supabase가 필요할 때:

```bash
npx supabase start
npx supabase status    # 로컬 URL·키 확인
```

로컬 URL·publishable key를 `.env.local`(Next.js) 또는 `apps/web/.env`(Vite)에 반영한다.

### 3. Vercel 프로젝트 + GitHub Integration

1. [Vercel Dashboard](https://vercel.com/new) → **Import Git Repository** → GitHub 앱 설치·리포 선택.
2. **Root Directory**: `apps/web` (모노레포인 경우).
3. **Framework Preset**: Next.js (전환 후) 또는 Vite (현재 뼈대).
4. **Environment Variables** (변수 목록: `docs/architecture/env-template.md`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` (서버 전용)
   - `NEXT_PUBLIC_APP_URL` (Production 도메인)
5. Production Branch: `main`. PR마다 **Preview Deployment** URL이 자동 생성된다.
6. Supabase Auth → URL Configuration에 Production·Preview 도메인을 Redirect URLs에 추가.

CLI로 env를 가져올 때:

```bash
cd apps/web
vercel link
vercel env pull .env.local
```

### 4. 배포 흐름 요약

| 이벤트 | Vercel | Supabase |
|--------|--------|----------|
| PR 생성/업데이트 | Preview 배포 | (선택) 브랜치 DB |
| `main` merge | Production 배포 | 마이그레이션 auto-apply(Integration 설정 시) |

## 환경 변수 설정

1. `apps/web/.env.example`을 복사해 로컬 env 파일을 만든다.
   - **Next.js(권장)**: `.env.local`
   - **Vite(현재 뼈대)**: `.env`
2. Supabase Dashboard → **API Keys**에서 URL·Publishable key를 채운다.
3. 변수 목록·노출 범위는 `docs/architecture/env-template.md`를 참조한다.

```bash
# Vite 뼈대 (현재 템플릿)
cp apps/web/.env.example apps/web/.env

# Next.js 전환 후
cp apps/web/.env.example apps/web/.env.local
```

## 개발 서버

### Vite (템플릿 현재 뼈대)

```bash
pnpm --filter web dev
```

기본 주소: `http://localhost:5173`

### Next.js (권장, 전환 후)

```bash
pnpm --filter web dev
# package.json scripts: "dev": "next dev"
```

기본 주소: `http://localhost:3000`

## 테스트

### 단위/통합 테스트 (Vitest)

```bash
pnpm --filter web test          # watch 모드
pnpm --filter web test --run    # 단일 실행 (CI용)
```

### E2E 테스트

- 테스트 에이전트가 cursor-ide-browser MCP를 사용해 수행한다.
- 대안: Playwright 스크립트(`apps/web/e2e/`)를 작성해 `pnpm --filter web test:e2e`로 실행.

## 빌드

### Vite (현재)

```bash
pnpm --filter web build
```

산출물: `apps/web/dist/` (정적 HTML/JS/CSS)

### Next.js (권장, 전환 후)

```bash
pnpm --filter web build
```

Vercel이 `next build`를 실행하며, Server/Edge Functions·Route Handlers가 함께 배포된다.

## 린트 / 타입 체크

```bash
pnpm --filter web lint          # ESLint
pnpm --filter web typecheck     # tsc --noEmit
```

## 배포

### Vercel (권장)

- GitHub Integration으로 **push/PR 시 자동 배포**. 수동 배포는 예외 상황에만 사용.
- Preview URL로 PR 검증 → `main` merge 시 Production.
- env·도메인·Root Directory 변경 시 Vercel Project Settings와 이 runbook을 함께 갱신.

### 정적 호스팅 (Vite 뼈대만 해당)

- `apps/web/dist/`를 정적 호스팅에 업로드. API·SSR이 필요하면 Next.js + Vercel로 전환.

## npm create 패키지 배포 (create-ai-workspace-template)

이 템플릿을 `npm create ai-workspace-template`으로 제공하려면:

1. 템플릿 본문은 **`project-resource/template/`** 에 둔다.
2. 저장소 **루트**에서 `npm run build` 후 `npm publish` 한다. (최초 1회: `npm login`)
3. `npm run build` 가 `project-attachment/script/sync-resource.mjs` 를 실행해 `project-resource/template/` 를 루트의 `resource/` 로 복사한다. `npm pack` / `npm publish` 시 `prepack` 이 자동으로 `npm run build` 를 실행한다.

```bash
# 저장소 루트 (ai-workspace-template)
npm version patch   # 필요 시
npm run build
npm publish
```

사용자는 다음으로 템플릿을 세팅할 수 있다.

```bash
npm create ai-workspace-template@latest my-project
# 또는
npx create-ai-workspace-template@latest my-project
```

## 템플릿 업그레이드 (기존 프로젝트)

보일러플레이트(`.cursor` 규칙·스킬, `scripts/`, `AGENTS.md` 등)만 최신 템플릿과 맞춘다.  
**사용자 산출물**(`docs/project-concept.md`, `tasks/items/*`, `apps/web/src` 등)은 건드리지 않는다.

```bash
# 프로젝트 루트에서
npx create-ai-workspace-template@latest upgrade

# 미리보기 (파일 쓰기 없음, 리포트만)
npx create-ai-workspace-template@latest upgrade --dry-run
```

- 충돌은 **덮어쓰지 않고 스킵**한다.
- 템플릿 목표는 원본 **옆** `*.migrate.*` 사이드카 (예: `package.json` → `package.migrate.json`).
- IDE Compare: `파일` ↔ `파일.migrate.ext`. 병합 후 사이드카 삭제.
- 리포트: `docs/upgrade-report-*.md` + `.json` — Myers diff, sha256, migrate 경로 목록.
- `package.json`·`apps/web` 설정은 **merge_manual** (diff만).
