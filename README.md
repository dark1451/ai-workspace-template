# ai-workspace

AI 에이전트가 **아이디에이션 → 기획 → 디자인 → 개발 → 테스트 → 배포** 전 과정을 능동적으로 수행할 수 있도록 설계된 보일러플레이트 모노레포입니다.

## 이 템플릿이 제공하는 것

### 역할 기반 에이전트 워크플로우

에이전트를 **기획자, 디자이너/개발자, 테스트, PM** 네 역할로 나누고, 각 역할이 언제 무엇을 해야 하는지 규칙과 스킬로 정의해 둡니다. 사용자가 "~ 하고 싶어"라고 말하면 기획부터 태스크 등록까지 자동으로 진행됩니다.

### 파일 기반 태스크 보드

외부 도구 없이 `tasks/board.json` + `tasks/items/*.md`만으로 스프린트 보드를 운영합니다. 상태(pending → in_progress → in_test → done → deployed)와 handoff 필드로 에이전트 간 작업 인수인계가 이어집니다.

### 에이전트 피드백 채널

에이전트가 작업 중 발견한 문제(스펙 불명확, 규칙 충돌, 블로커 등)를 `docs/feedback/`에 기록합니다. 사용자가 검토하고 규칙/프로세스를 개선하는 루프를 만듭니다.

### 컨텍스트 공유 구조

모든 에이전트가 같은 문서(`docs/specs/`, `docs/architecture/`, `docs/runbook/`, `design/`)를 읽고 쓰도록 위치를 고정합니다. 작업이 끝날 때마다 다음 역할이 필요한 정보를 태스크 메모에 남깁니다.

### 웹 앱 뼈대

Vite + React + React Router + TypeScript + Supabase + Vitest로 구성된 `apps/web` 뼈대가 포함되어 있어 바로 개발을 시작할 수 있습니다.

## 프로젝트 구조

```
ai-workspace/
├── AGENTS.md                  # 에이전트 가이드 (역할, 규칙, 문서 맵)
├── .cursor/
│   ├── rules/                 # 역할별 규칙 (기획/디자인/개발/테스트/PM)
│   └── skills/                # 워크플로우 스킬 7종
├── docs/
│   ├── specs/                 # 기획 스펙
│   ├── ideas/                 # 아이디에이션
│   ├── architecture/          # 스택 결정, 환경 변수 템플릿
│   ├── runbook/               # 실행·테스트·빌드 절차
│   └── feedback/              # 에이전트 피드백
├── design/                    # 디자인 시스템
├── tasks/                     # 태스크 보드 (board.json + items/)
└── apps/
    └── web/                   # Vite + React + TypeScript 앱
```

## 빠른 시작

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
# .env에 Supabase URL/키 채우기
pnpm --filter web dev
```

## 스킬 목록

| 스킬 | 트리거 예시 |
|------|-------------|
| `intent-to-task` | "~ 하고 싶어", "기획해줘" |
| `ideation` | "아이디에이션 해줘" |
| `task-pickup` | "pending 처리해줘" |
| `peer-review` | "리뷰해줘" |
| `test-and-verify` | "in_test 검증해줘" |
| `flow-orchestration` | "보드 상태 봐줘" |
| `raise-feedback` | 문제 발견 시 자동 기록 |

## 상세 문서

- 에이전트 가이드: [AGENTS.md](AGENTS.md)
- 스택 결정: [docs/architecture/stack.md](docs/architecture/stack.md)
- 실행 가이드: [docs/runbook/runbook.md](docs/runbook/runbook.md)
- 태스크 스키마: [tasks/README.md](tasks/README.md)
- 피드백 채널: [docs/feedback/README.md](docs/feedback/README.md)
