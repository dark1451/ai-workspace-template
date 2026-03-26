# ai-workspace

AI 에이전트가 **아이디에이션 → 기획 → 디자인 → 개발 → 테스트 → 배포** 흐름을 따라 일할 수 있도록 만든 **보일러플레이트 모노레포**입니다.  
Cursor 규칙·스킬, 문서 위치, 태스크 보드, 샘플 웹 앱이 한곳에 묶여 있습니다.

---

## 처음이신가요? (이 폴더를 방금 만들었다면)

`npm create ai-workspace-template` 으로 이 구조를 만든 경우, 스크립트가 이미 **`pnpm install`** 을 실행했을 수 있습니다. 문제가 없다면 아래부터 이어가면 됩니다.

1. **환경 변수** (Supabase를 쓸 때)

   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

   `apps/web/.env` 에 Supabase URL·anon key 를 넣습니다. (목록은 `docs/architecture/env-template.md`)

2. **개발 서버**

   ```bash
   pnpm --filter web dev
   ```

3. **Cursor**를 쓴다면 이 폴더(프로젝트 루트)를 워크스페이스로 연 상태에서 작업하면 `.cursor` 규칙이 적용됩니다.

4. **에이전트에게 맡길 일**은 `docs/project-concept.md` 부터 채우고, 상세 가이드는 **`AGENTS.md`** 를 보세요.

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

`apps/web` — Vite, React, React Router, TypeScript, Supabase 클라이언트, Vitest 뼈대가 포함되어 있습니다.

---

## 프로젝트 구조

```
프로젝트 루트/
├── AGENTS.md                  # 에이전트 가이드 (역할, 규칙, 문서 맵)
├── .cursor/
│   ├── rules/                 # 역할별 규칙
│   └── skills/                # 워크플로우 스킬
├── docs/
│   ├── specs/                 # 기획 스펙
│   ├── ideas/                 # 아이디에이션
│   ├── architecture/          # 스택, 환경 변수 템플릿
│   ├── runbook/               # 실행·테스트·빌드
│   └── feedback/              # 에이전트 피드백
├── design/                    # 디자인 시스템
├── tasks/                     # 태스크 보드
└── apps/
    └── web/                   # Vite + React + TypeScript 앱
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
- 스택: [docs/architecture/stack.md](docs/architecture/stack.md)
- 설치·빌드·테스트: [docs/runbook/runbook.md](docs/runbook/runbook.md)
- 태스크 보드 형식: [tasks/README.md](tasks/README.md)
- 피드백 채널: [docs/feedback/README.md](docs/feedback/README.md)

---

## 참고: 템플릿 저장소를 직접 clone한 경우

이 문서는 **생성된 프로젝트** 기준입니다. **ai-workspace-template** 저장소 전체를 clone해 유지보수하는 경우에는 GitHub 저장소 루트 README를 보세요. (예: [ai-workspace-template 저장소](https://github.com/dark1451/ai-workspace-template) — `project-resource/template/` 와 루트 `pnpm` 워크스페이스 구조가 다릅니다.)
