# ai-workspace

AI 에이전트가 **아이디에이션 → 기획 → 디자인 → 개발 → 테스트 → 배포** 흐름을 따라 일할 수 있도록 만든 **보일러플레이트 모노레포**입니다.  
**Cursor IDE + `cursor-agent` CLI 기반**으로 최적화되어 있고, Cursor 규칙·스킬·역할 시작 프롬프트·태스크 보드·샘플 웹 앱이 한곳에 묶여 있습니다.

> **Cursor 기반 최적화란?**  
> - `.cursor/rules/*.mdc` 와 `.cursor/skills/*` 는 Cursor 에서 **자동으로 적용/발동**됩니다.  
> - `.cursor/role-prompts/<role>.md` 본문은 **`pnpm work:<role>`** 한 줄로 cursor-agent 첫 메시지에 자동 주입됩니다.  
> - 다른 에디터에서도 파일들은 그대로 읽을 수 있지만, 자동화·창 통합·일부 자동 발동은 Cursor 환경을 전제로 합니다.

---

## 처음이신가요? (이 폴더를 방금 만들었다면)

`npm create ai-workspace-template` 으로 이 구조를 만든 경우, 스크립트가 이미 **`pnpm install`** 을 실행했을 수 있습니다. 문제가 없다면 아래부터 이어가면 됩니다.

1. **환경 변수** (Supabase + Vercel 연동 시)

   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

   Supabase URL·Publishable key를 채운다. **권장 스택**은 Next.js + Vercel이며, 변수 목록·Vercel 등록 방법은 `docs/architecture/env-template.md` · GitHub 연동은 `docs/runbook/runbook.md`를 본다.

2. **개발 서버**

   ```bash
   pnpm dev          # = pnpm --filter web dev
   ```

3. **Cursor**를 쓴다면 이 폴더(프로젝트 루트)를 워크스페이스로 연 상태에서 작업하면 `.cursor` 규칙이 적용됩니다.

4. **역할 에이전트 띄우기** (`cursor-agent` CLI 설치 후, <https://cursor.com/cli>):

   ```bash
   pnpm work:plan      # 기획자
   pnpm work:design    # 디자이너
   pnpm work:dev       # 개발자
   pnpm work:test      # 테스트
   pnpm work:pm        # PM
   pnpm work           # 역할 없이 일반 cursor-agent
   pnpm work:open      # cursor-agent 대신 Cursor 데스크톱 새 창
   ```

   첫 메시지는 `.cursor/role-prompts/<role>.md` 본문이 자동 전달됩니다. 두 번째 터미널을 띄워 다른 역할을 같이 실행하면 **병렬 롤 에이전트** (파일 기반 비동기 조율: `docs/coordination-log.md`).

5. **에이전트에게 맡길 일**은 `docs/project-concept.md` 부터 채우고, 상세 가이드는 **`AGENTS.md`** 를 보세요.

---

## 이 템플릿이 제공하는 것

### 역할 기반 에이전트 워크플로우

에이전트를 **기획자, 디자이너/개발자, 테스트, PM** 등으로 나누고, 규칙과 스킬로 “언제 무엇을 할지”를 정해 두었습니다. “~ 하고 싶어”처럼 말하면 기획·태스크 단계로 이어지도록 설계되어 있습니다.

### 파일 기반 태스크 보드

`tasks/board.json` 과 `tasks/items/*.md` 만으로 보드를 운영합니다. 상태(pending → in_progress → in_test → done 등)와 handoff 로 인수인계를 남깁니다.

### 에이전트 피드백

스펙 불명확, 규칙 충돌, 블로커 등은 `docs/feedback/` 에 기록하도록 안내합니다.

### 컨텍스트가 모이는 문서 위치

`docs/specs/`, `docs/architecture/`, `docs/runbook/`, `design/` 등 경로가 고정되어 있어, 에이전트와 사람이 같은 곳을 보도록 했습니다.

### 웹 앱 뼈대

`apps/web` — Vite + React + TypeScript + Supabase 클라이언트 + Vitest 최소 뼈대가 포함되어 있습니다.  
**권장 운영 스택**은 Supabase (PostgreSQL SaaS) + **Next.js** (프론트·API) + **Vercel** + GitHub Integration이며, 상세는 `docs/architecture/stack.md`를 참조하세요.

---

## 프로젝트 구조

```
프로젝트 루트/
├── package.json               # 워크스페이스 + work:<role> 스크립트
├── pnpm-workspace.yaml        # apps/* 워크스페이스
├── AGENTS.md                  # 에이전트 가이드 (역할, 규칙, 문서 맵)
├── scripts/
│   ├── agent-runner.mjs       # work / test:scenario 공통 코어 (cursor-agent 실행기)
│   └── work.mjs               # pnpm work:<role> 진입점
├── .cursor/
│   ├── rules/                 # 역할별 규칙 (Cursor 자동 적용)
│   ├── skills/                # 워크플로우 스킬 (Cursor 자동 발동)
│   └── role-prompts/          # 역할 시작 프롬프트 (dev/design/plan/test/pm)
├── docs/
│   ├── project-concept.md     # 프로젝트 단일 기준 (인터뷰로 채움)
│   ├── role-coordination.md   # 병렬 롤 에이전트·비동기 조율 개념
│   ├── coordination-log.md    # 역할 세션 핸드오프 (맨 아래 append)
│   ├── next-actions.md        # PM 종합·"다음에 뭐 할지" (PM 전용 갱신)
│   ├── role-prompts/          # 역할 시작 프롬프트 사용자 안내
│   ├── specs/                 # 기획 스펙
│   ├── ideas/                 # 아이디에이션
│   ├── architecture/          # 스택, 환경 변수 템플릿
│   ├── runbook/               # 실행·테스트·빌드
│   └── feedback/              # 에이전트 피드백
├── design/                    # 디자인 시스템
├── tasks/                     # 태스크 보드
├── supabase/                  # (권장) DB 마이그레이션 — Supabase CLI
└── apps/
    └── web/                   # Vite 뼈대 → Next.js 전환 권장
```

---

## 스킬 이름 빠른 참고

| 스킬 | 말하기 예시 |
|------|----------------|
| `intent-to-task` | "~ 하고 싶어", "기획해줘" |
| `ideation` | "아이디에이션 해줘" |
| `task-pickup` | "pending 처리해줘" |
| `peer-review` | "리뷰해줘" |
| `test-and-verify` | "in_test 검증해줘" |
| `flow-orchestration` | "보드 상태 봐줘" |
| `raise-feedback` | 문제 발견 시 기록 |

---

## 더 읽을 곳

- 에이전트 가이드: [AGENTS.md](AGENTS.md)
- 프로젝트 컨셉(단일 기준): [docs/project-concept.md](docs/project-concept.md) · 안내: [docs/project-concept-README.md](docs/project-concept-README.md)
- 병렬 롤 에이전트 조율: [docs/role-coordination.md](docs/role-coordination.md) · 로그: [docs/coordination-log.md](docs/coordination-log.md)
- PM 종합·다음 행동: [docs/next-actions.md](docs/next-actions.md)
- 역할 시작 프롬프트 사용법: [docs/role-prompts/README.md](docs/role-prompts/README.md)
- 스택: [docs/architecture/stack.md](docs/architecture/stack.md)
- 설치·빌드·테스트: [docs/runbook/runbook.md](docs/runbook/runbook.md)
- 태스크 보드 형식: [tasks/README.md](tasks/README.md)
- 피드백 채널: [docs/feedback/README.md](docs/feedback/README.md)
- cursor-agent CLI 설치: <https://cursor.com/cli> · 환경 설정: [docs/cursor-agent-setup.md](docs/cursor-agent-setup.md)

---

## 참고: 템플릿 저장소를 직접 clone한 경우

이 문서는 **생성된 프로젝트** 기준입니다. **ai-workspace-template** 저장소 전체를 clone해 유지보수하는 경우에는 GitHub 저장소 루트 README를 보세요. (예: [ai-workspace-template 저장소](https://github.com/dark1451/ai-workspace-template) — `project-resource/template/` 와 루트 `pnpm` 워크스페이스 구조가 다릅니다.)
