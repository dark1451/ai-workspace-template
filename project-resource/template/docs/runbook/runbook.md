# 실행 가이드 (Runbook)

> `apps/web` 기준. 패키지 매니저는 **pnpm**을 사용한다.

## 사전 요구사항

- Node.js >= 18
- pnpm >= 9 (`corepack enable && corepack prepare pnpm@latest --activate`)

## 설치

```bash
pnpm install
```

모노레포 루트에서 실행하면 모든 워크스페이스 패키지가 설치된다.

## 환경 변수 설정

1. `apps/web/.env.example`을 복사해 `apps/web/.env`를 만든다.
2. Supabase 프로젝트 대시보드(API Keys)에서 URL과 Publishable key를 가져와 채운다.
3. 변수 목록은 `docs/architecture/env-template.md`를 참조한다.

```bash
cp apps/web/.env.example apps/web/.env
```

## 개발 서버

```bash
pnpm --filter web dev
```

기본 주소: `http://localhost:5173`

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

```bash
pnpm --filter web build
```

산출물: `apps/web/dist/` (정적 HTML/JS/CSS)

## 린트 / 타입 체크

```bash
pnpm --filter web lint          # ESLint
pnpm --filter web typecheck     # tsc --noEmit
```

## Supabase 로컬 연동

Supabase CLI를 사용한 로컬 개발이 필요한 경우:

```bash
npx supabase init               # 프로젝트 루트에서 (최초 1회)
npx supabase start              # 로컬 Supabase 인스턴스 기동
npx supabase status             # 로컬 URL/키 확인
```

로컬 인스턴스의 URL과 publishable key를 `apps/web/.env`에 반영한다.

## 배포

- 정적 빌드 산출물(`apps/web/dist/`)을 호스팅 서비스에 배포한다.
- CI/CD 파이프라인 설정 시 이 문서의 빌드·테스트 명령과 일치시킨다.

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
