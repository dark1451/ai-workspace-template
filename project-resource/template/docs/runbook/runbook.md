# 실행 가이드 (Runbook)

> `apps/web` — **Next.js + Vercel + Supabase (서버 전용 Secret key)**. 패키지 매니저: **pnpm**.

## 사전 요구사항

- Node.js >= 18
- pnpm >= 9 (`corepack enable && corepack prepare pnpm@latest --activate`)
- (권장) [Supabase CLI](https://supabase.com/docs/guides/cli)
- (권장) [Vercel CLI](https://vercel.com/docs/cli)

## 설치

```bash
pnpm install
```

## 환경 변수

1. 예시 파일 복사:

```bash
cp apps/web/.env.example apps/web/.env.local
```

2. [Supabase Dashboard](https://supabase.com/dashboard) → **API Keys**에서 다음만 채운다:

| 변수 | Dashboard 항목 |
|------|----------------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SECRET_KEY` | Secret key |

Publishable(anon) 키는 **복사·등록하지 않는다**. 상세: `docs/architecture/env-template.md`.

## 개발 서버

```bash
pnpm dev
# 또는
pnpm --filter web dev
```

기본 주소: `http://localhost:3000`

헬스 체크 API: `http://localhost:3000/api/health`

## 테스트

```bash
pnpm --filter web test          # watch
pnpm --filter web test:run      # CI 단일 실행
```

E2E: cursor-ide-browser MCP 또는 Playwright (`apps/web/e2e/` 추가 시).

## 빌드·프로덕션 실행

```bash
pnpm --filter web build
pnpm --filter web start
```

Vercel은 push 시 `next build`를 실행한다.

## 린트 / 타입 체크

```bash
pnpm --filter web lint
pnpm --filter web typecheck
```

## Supabase·Vercel GitHub 연동 (권장)

### 1. GitHub

```bash
git remote add origin git@github.com:<org>/<repo>.git
git push -u origin main
```

### 2. Supabase

1. Supabase에서 프로젝트 생성.
2. **Integrations → GitHub** 연결.
3. CLI 초기화:

```bash
npx supabase init
npx supabase link --project-ref <project-ref>
```

4. `supabase/migrations/` 변경을 push하면 Integration 설정에 따라 DB에 반영.

로컬 DB:

```bash
npx supabase start
npx supabase status
```

로컬 URL·Secret key를 `.env.local`에 반영.

### 3. Vercel

1. [Vercel New Project](https://vercel.com/new) → GitHub 리포 Import.
2. **Root Directory**: `apps/web`
3. **Framework Preset**: Next.js
4. **Environment Variables** (서버 전용):
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
5. Supabase **Integrations → Vercel** 연동을 쓰면 위 env가 자동 동기화될 수 있다. 동기화 시에도 Publishable key는 제외한다.
6. Supabase Auth 사용 시 Redirect URLs에 Vercel Preview·Production 도메인 등록.

CLI:

```bash
cd apps/web
vercel link
vercel env pull .env.local
```

### 배포 흐름

| 이벤트 | Vercel | Supabase |
|--------|--------|----------|
| PR | Preview 배포 | (선택) 브랜치 DB |
| `main` merge | Production | 마이그레이션 apply |

## Supabase 코드 패턴

```typescript
// ✅ Server Action / Route Handler / Server Component
import { createServerSupabaseClient } from "@/lib/supabase/server";

// ❌ 클라이언트 컴포넌트 ("use client") — import 금지
```

## npm create 패키지 배포 (create-ai-workspace-template)

1. 템플릿 본문: `project-resource/template/`
2. 저장소 루트: `npm run build` → `npm publish`

```bash
npm version patch
npm run build
npm publish
```

사용자:

```bash
npm create ai-workspace-template@latest my-project
```

## 템플릿 업그레이드

```bash
npx create-ai-workspace-template@latest upgrade
npx create-ai-workspace-template@latest upgrade --dry-run
```

- 사용자 산출물(`docs/project-concept.md`, `tasks/items/*`, `apps/web/app/*` 등)은 덮어쓰지 않음.
- 충돌 시 `*.migrate.*` 사이드카로 diff.
