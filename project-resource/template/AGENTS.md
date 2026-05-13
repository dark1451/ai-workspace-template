# ai-workspace 에이전트 가이드

## 프로젝트 개요

- **ai-workspace**: AI 에이전트 기반 개발 워크플로우 보일러플레이트 모노레포
- 에이전트는 **아이디에이션 → 기획 → 디자인 → 개발 → 테스트 → 배포** 순서를 인지하고, 단계별 규칙·산출물 위치·태스크 보드를 따른다.
- **Cursor 기반 최적화**: 이 템플릿은 **Cursor IDE + `cursor-agent` CLI** 환경을 1차 타깃으로 설계되었다. `.cursor/rules/*.mdc` 와 `.cursor/skills/*` 가 자동으로 적용되고, `.cursor/role-prompts/<role>.md` 가 역할 에이전트의 시작 지시문이며, 사용자 프로젝트의 `pnpm work:<role>` 과 템플릿 저장소의 `pnpm test:scenario:<role>` 이 **같은 코드(`scripts/agent-runner.mjs`)·같은 프롬프트 파일**을 공유한다. 다른 에디터에서도 파일들은 그대로 쓸 수 있지만, 자동 발동·실시간 채팅·창 통합 등 일부 기능은 Cursor 에 의존한다.

## 태스크 보드

- **단일 소스**: `tasks/board.json` + `tasks/items/*.md`. 상태 변경 시 두 곳을 일치시킨다.
- 스키마·상태·필드 정의는 `tasks/README.md` 참조.
- 한 번에 한 태스크 상태만 변경한다 (동시 편집 충돌 완화).
- 사용자 확인이 필요한 태스크는 `status: waiting_user`로 두어 일반 정체와 구분한다.
- 보드·상태 불일치 발생 시 PM 또는 수동으로 정리한다.
- **병렬 롤 에이전트**: 세션끼리 채팅으로 통신하지 않는다. `docs/coordination-log.md`(역할별 핸드오프) + PM 점검(`flow-orchestration`)으로 **파일 기반 비동기 조율**한다. 개념은 `docs/role-coordination.md`.
- **향후 실시간 채널 (Slack·Teams 등)**: 나중에 실시간 검토·결정을 채널에서 해도 되고, 이 템플릿은 그때도 **보드·`coordination-log`·`next-actions`를 정식 기록**으로 맞추는 전제를 권장한다. Slack 자동 연동은 기본 포함이 아니다. 상세는 `docs/role-coordination.md`의 “현재 세팅 vs 향후 실시간 소통”.

## 진입점

- **역할 활성화 명령**  
  사용자가 **"당신은 개발자입니다 / 디자이너입니다 / 기획자입니다 / 테스트 에이전트입니다 / PM입니다"** 같은 짧은 지시를 주면, 그 즉시 다음을 한다.
  1. 응답 머리에 **`[역할: 개발자]`** 같은 라벨 한 줄.
  2. 해당 역할 규칙(`.cursor/rules/<role>.mdc`)을 명시적으로 읽고 따른다.
  3. 해당 역할의 **주 스킬**을 발동해 첫 액션을 안내·실행한다.
     - 개발자/디자이너 → `task-pickup`
     - 기획자 → `intent-to-task` / `ideation`
     - 테스트 → `test-and-verify`
     - PM → `flow-orchestration`
  4. 컨셉 문서가 비어 있으면 본 작업 대신 `project-concept-interview` 진행.
  
  상세 행동 규칙은 `.cursor/rules/project-defaults.mdc` 의 **역할 활성화 명령** 항목 참조.
- **역할 시작 프롬프트 파일**  
  위 짧은 한 줄 대신 **`.cursor/role-prompts/<role>.md`** 본문을 그대로 첫 메시지로 붙여 넣어도 같은 역할로 활성화된다(좀 더 친절하고 명시적인 시작 지시).  
  사용자 프로젝트에서는 **`pnpm work:<role>`**, 템플릿 저장소에서는 **`pnpm test:scenario:<role>`** 가 이 파일을 **자동으로 첫 메시지에 넣어** `cursor-agent` 를 띄운다. 두 명령은 같은 코어(`scripts/agent-runner.mjs`)와 같은 프롬프트 파일을 공유한다. 사용자가 직접 편집해 팀 컨벤션에 맞출 수 있다. 안내: `docs/role-prompts/README.md`.
- **첫 인사·"뭘 할 수 있어?" 류 질문**  
  사용자가 단순 인사("안녕", "hello")만 하거나 에이전트의 정체·능력을 묻는 경우, 컨셉 질문을 곧바로 던지지 말고 **짧은 자기소개 + 시작 질문**을 한 메시지에 함께 보낸다.
  1. **소속**: "여기는 **ai-workspace 템플릿** 기반의 작업 공간"임을 알린다.
  2. **할 수 있는 일** 3~5줄: 아이디에이션 → 기획 → 디자인 → 개발 → 테스트 → 배포 흐름 진행, 프로젝트 컨셉·스펙·태스크·동료 리뷰 관리, 자연어 요청 해석.
  3. **지금 필요한 것**: `docs/project-concept.md`(프로젝트 컨셉) 정의가 먼저라는 점을 안내한다.
  4. **시작 질문**: 마지막에 **"어떤 프로젝트를 진행하시겠습니까?"** 를 한 번만 묻는다.
  - 사용자가 인사와 함께 프로젝트 의도까지 말했다면 자기소개를 1~2줄로 줄이고 바로 컨셉 인터뷰로 들어간다. 상세: `.cursor/rules/project-defaults.mdc`.
- **첫 프로젝트 진행 시(컨셉 문서 없음)**  
  `docs/project-concept.md`가 없거나 비어 있으면:
  1. 위 자기소개가 끝났거나 사용자가 이미 프로젝트 의도를 말했다면, **"어떤 프로젝트를 진행하시겠습니까?"** 라고 묻고 **프로젝트 컨셉 정의 인터뷰**를 진행한다 (project-concept-interview 스킬).
  2. 인터뷰 내용을 바탕으로 `docs/project-concept.md`를 작성·갱신한다. 이때 **작업 진행 모드**(`proactive` / `approval_first`)도 반드시 확정한다.
  3. 컨셉 문서가 채워진 뒤에만 스펙·태스크·디자인·개발을 진행한다. 에이전트는 이 문서를 기준으로 산출물을 낸다.
- **컨셉 문서가 있는 상태에서** 사용자가 "~ 하고 싶어", "이 기능 추가해줘", "기획해줘" 등을 말하면:
  1. `docs/project-concept.md`를 참조해 범위·우선순위와 맞는지 확인한다.
  2. `docs/specs/`에 해당 기능 스펙이 있는지 확인.
  3. 없으면 기획 규칙에 따라 스펙·요구사항 문서 생성 (컨셉 문서 기반).
  4. 작업 진행 모드와 명확성 상태에 따라 `tasks/items/`에 새 태스크 파일을 생성한다. 기본은 `pending`이지만, 사용자 확인이 남아 있으면 `waiting_user`로 두거나 생성 자체를 보류할 수 있다.
- **모호한 점이나 사용자 결정 필요 사항**이 있으면 **task-clarification-interview**를 먼저 진행하고, 답변 전에는 **"현재 사용자 확인 대기 중"**이라고 알린다.
- **대화 중 프로젝트 관련 결정·변경**이 있어 문서에 반영할 내용이 있어 보이면, 먼저 **「문서를 업데이트 할까요?」**라고 묻고(갱신할 항목을 짧게 요약), 동의한 뒤 `docs/project-concept.md`를 갱신하고 변경 이력을 남긴다. 예외는 `.cursor/rules/project-defaults.mdc`의 **확인 질문 생략**과 같다.
- **사용자가 다음 행동을 모호하게 물을 때** ("지금 뭐 해야 하지?", "다음 뭐 할까?", "진행 상황 알려줘" 등):
  1. **`docs/next-actions.md` 를 가장 먼저 확인.** 비어 있지 않으면 PM 이 마지막에 남긴 "역할별 권장 액션"·"사용자 결정 필요" 항목을 요약해 보여 준다.
  2. **`docs/coordination-log.md` 맨 아래** 최근 1~3개 블록을 읽어 병렬 세션 요약·`delta: none` 여부를 짧게 알린다.
  3. `tasks/board.json` 의 상태 분포(`pending` / `in_progress` / `waiting_user` / `in_test` / `done`)를 한 줄 요약.
  4. `docs/feedback/` 의 open / blocker 가 있으면 같이 안내.
  5. `docs/project-concept.md` 가 비어 있으면 본 작업 대신 컨셉 인터뷰부터.
  6. 위 정보로 "이 중 어디로 진행할까요?" 라고 선택지를 제시하고, 답에 따라 `task-clarification-interview` 로 이어간다.
  상세: `.cursor/rules/project-defaults.mdc` 의 "사용자가 다음 행동을 모호하게 물을 때" 항목.
- **할 일 없음 보고 흐름(No-work fallback)**: 어떤 역할이든 pending·fallback 후보 모두 없을 때는 새 작업을 만들지 말고 4단계로 마무리한다 — (1) 짧게 알리기 (2) "다음에 하면 좋은 일" 3개 이내 정리 (3) **PM 만** `docs/next-actions.md` 에 누적 기록 (4) 사용자 답 대기. 상세: `.cursor/rules/project-defaults.mdc`.
- **인터뷰·todo**: 새 작업·모호한 결정 시 `task-clarification-interview` 우선. 3단계 이상·여러 파일을 묶는 작업이면 짧은 todo 리스트(3~7개)를 응답에 함께 보여 주며 진행한다 (공통 규칙 "인터뷰 우선" / "투두 기반 진행" 참조).

## 역할 에이전트 띄우기 (work 스크립트)

이 프로젝트는 사용자 루트의 `package.json` 에 **`work:<role>`** 스크립트가 들어 있어, 별도 도구 없이 한 줄로 역할 에이전트 세션을 띄울 수 있다.

| 명령 | 역할 | 첫 메시지 소스 |
|------|------|----------------|
| `pnpm work` | 역할 없이 cursor-agent 인터랙티브 | — |
| `pnpm work:dev` | 개발자 | `.cursor/role-prompts/dev.md` |
| `pnpm work:design` | 디자이너 | `.cursor/role-prompts/design.md` |
| `pnpm work:plan` | 기획자 | `.cursor/role-prompts/plan.md` |
| `pnpm work:test` | 테스트 | `.cursor/role-prompts/test.md` |
| `pnpm work:pm` | PM | `.cursor/role-prompts/pm.md` |
| `pnpm work:open` 또는 `pnpm work -- --open` | (역할 없이) Cursor 데스크톱 새 창 | — |
| `pnpm work:dev -- --open` | 개발자 + Cursor 데스크톱 새 창 | dev.md |

- `cursor-agent` CLI 가 없으면 안내와 함께 수동 실행 방법을 출력한다. 설치: <https://cursor.com/cli>
- 두 번째 cursor-agent 터미널을 열어 다른 역할을 같이 띄우면 **병렬 롤 에이전트**가 된다. 세션끼리 채팅은 없고 `docs/coordination-log.md` 로 비동기 조율한다 (위 "태스크 보드" 섹션 / `docs/role-coordination.md`).
- 템플릿 저장소(이 템플릿을 유지보수하는 쪽)에서는 `pnpm test:scenario:<role>` 가 sandbox 안에서 **같은 코드와 같은 프롬프트**로 동작한다.

## 역할별 우선순위

| 역할 | 주 작업 | 1차 fallback | 그조차 없을 때 |
|------|---------|---------------|----------------|
| **PM / 스크럼 마스터** | 보드 점검, 병목·정체 감지, 역할별 다음 액션 제안, handoff 정리 | open/blocker 피드백 취합 안내 | **`docs/next-actions.md` 누적 기록** + 알림 |
| **기획자** | pending 태스크 구성 (스펙·요구사항, 태스크 분해) | 아이디에이션 (`docs/ideas/` 갱신) | 알림만 (No-work fallback) |
| **디자이너** | feature/design_system 태스크 픽업 → 디자인 산출물 작성 → 동료 리뷰 → 개발 handoff가 있으면 `pending`으로 반환, 없으면 다음 단계 전이 | 디자인 시스템 정리, UI/UX 개선 | 알림만 (No-work fallback) |
| **개발자** | pending 픽업 → 구현 + 테스트 코드 작성 → 동료 리뷰 → in_test | 버그 수정, 테스트 보강, UI/UX 개선, 디자인 시스템 | 알림만 (No-work fallback) |
| **테스트 에이전트** | in_test 처리 (테스트 실행·검증·E2E) → 동료 리뷰 → done | 회귀·E2E 보강 후보 안내 | 알림만 (No-work fallback) |

> "그조차 없을 때" 흐름은 공통 규칙(`.cursor/rules/project-defaults.mdc` 의 "할 일 없음 보고 흐름")을 따른다. PM 만 `docs/next-actions.md` 에 누적 기록하고, 다른 역할은 메시지로만 안내한다.

## 동료 리뷰

- 각 역할의 **작업 산출물**은 **같은 역할의 다른 에이전트**가 리뷰한 뒤, 통과 시에만 다음 단계로 전이한다.
- **단일 에이전트 환경**: 새 세션 리뷰, 셀프 체크리스트(사용자 승인 필요), 또는 사용자 직접 승인으로 대체 가능. 상세는 `peer-review` 스킬 참조.
- **병렬 롤 에이전트 환경**: 다른 `cursor-agent`/Cursor 세션을 같은 역할로 띄워 리뷰 담당으로 둘 수 있다. 작성 에이전트는 리뷰 요청을 `docs/coordination-log.md` 와 `tasks/items/<id>.review.md` 에 남기고, 리뷰 에이전트가 다음 실행에서 풀(pull)로 픽업한다.
- 리뷰 결과는 태스크 메모(`reviewedBy`, `reviewResult`, `reviewNote`) 또는 `tasks/items/<id>.review.md`에 기록.
- 수정 요청(request-changes) 시 작성 에이전트가 반영 후 재리뷰 요청.

## 개발 스택

| 영역 | 선택 | 비고 |
|------|------|------|
| 빌드/프레임워크 | Vite + React + React Router | 정적 빌드(SPA/SSG) |
| 언어 | TypeScript | 타입 안전성 |
| 테스트 | Vitest (단위/통합) | Vite 런타임과 동일 환경 |
| 패키지 매니저 | pnpm | 워크스페이스 지원 |
| 백엔드/BaaS | Supabase | Auth, DB, Storage, Realtime |
| 대안 | Next.js (static export) | 필요 시 전환 |

상세: `docs/architecture/stack.md`

## 문서 맵

| 문서/위치 | 주로 쓰는 역할 | 주로 읽는 역할 | 내용 |
|-----------|----------------|----------------|------|
| **`docs/project-concept.md`** | (인터뷰 진행) 모든 역할 | **모든 에이전트** | **프로젝트 단일 기준: 목표·사용자·§5 프로젝트 디자인 컨셉·기능·제약·작업 진행 모드. 없으면 작업 불가. 대화로 바뀐 내용은 반영 전 「문서를 업데이트 할까요?」 확인 후 갱신(규칙 예외는 project-defaults 참조).** |
| `docs/role-coordination.md` | — | 모든 롤·PM·메인 | 병렬 롤 에이전트·비동기 조율 개념(채팅 없음, 파일 풀, PM 주기) |
| `docs/coordination-log.md` | 기획·디자인·개발·테스트 | **PM·메인·모든 롤** | 세션 단위 핸드오프(맨 아래 블록 추가). `delta: none` 으로 유령 작업 방지 |
| `docs/next-actions.md` | PM | 메인·모든 롤 | PM 종합·"다음에 뭐 할지" (전체 유휴 시 등) |
| `docs/specs/` | 기획자 | 개발·테스트·PM | 요구사항·수용 조건 (컨셉 문서 기반) |
| `docs/ideas/` | 기획자 | 기획자·PM | 아이디어·후보 |
| `docs/architecture/` | 개발자(초기)·PM | 모든 에이전트 | 스택·env 템플릿 |
| `docs/runbook/` | 개발자 | 테스트·개발 | 설치·실행·테스트·빌드 절차 |
| `design/` | 디자이너 | 개발자 | 디자인 토큰·컴포넌트 매핑 |
| `tasks/items/<id>.md` | 모든 역할 | 모든 역할 | 상태·링크·handoff 메모 |
| `tasks/items/<id>.review.md` | 리뷰한 에이전트 | 같은/다음 역할 | 동료 리뷰 결과·코멘트 |
| `docs/feedback/` | 모든 에이전트 | PM·사용자 | 문제점·우려·개선 제안 |

## 컨텍스트 공유 원칙

- **작업 완료 = 다음 역할이 쓸 문서 갱신**: 기획 → 스펙 경로, 디자인 → design/ 경로, 개발 → 코드 경로·테스트 명령·env 요약, 테스트 → 검증 결과.
- **작업 전 확인**: 모든 역할은 `docs/project-concept.md`의 **작업 진행 모드**를 먼저 확인한다. `approval_first`면 사용자 확인 전까지 다음 단계로 넘어가지 않는다.
- **디자인 기준 공유**: 디자이너는 작업 시작 전 `docs/project-concept.md` **§5 프로젝트 디자인 컨셉**을 반드시 읽고, 태스크 디자인 산출물이 이 기준을 어떻게 반영하는지 `design/` handoff에 남긴다. 개발자도 UI 구현 시 이 기준과 handoff를 함께 따른다.
- **디자인 컨셉 미확정 시 대기**: §5에 사용자에게서 받은 구체 디자인 답변이 없으면 디자이너는 작업을 시작하지 않고, 명확화 인터뷰 후 `waiting_user` 상태로 대기한다.
- **동료 리뷰 통과 후** 상태를 전이하기 전에 태스크 메모의 handoff 필드(`spec`, `design`, `codePaths`, `testCommand`, `runCommand`, `envNote`)를 반드시 채운다.
- 새 스크립트·환경 변수·빌드 절차가 추가되면 `docs/runbook/runbook.md`와 `docs/architecture/env-template.md`를 함께 갱신한다.
- 리뷰 결과는 `tasks/items/<id>.review.md`에 기록해 다음 에이전트가 참고할 수 있게 한다.

## 산출물 위치

| 산출물 | 위치 |
|--------|------|
| **프로젝트 컨셉** | `docs/project-concept.md` (상세: `docs/project-concept-README.md`) |
| **PM 다음 행동 누적 기록** | `docs/next-actions.md` (사용자 "뭐 해야 하지?" 응답의 단일 소스) |
| **병렬 조율 개념** | `docs/role-coordination.md` |
| **역할 세션 핸드오프(append)** | `docs/coordination-log.md` |
| **역할 시작 프롬프트** | `.cursor/role-prompts/<role>.md` (안내: `docs/role-prompts/README.md`) |
| 스펙·기획 | `docs/specs/` |
| 아이디어·개선 후보 | `docs/ideas/` |
| 아키텍처·스택·env 템플릿 | `docs/architecture/` |
| 실행·테스트·빌드 절차 | `docs/runbook/` |
| 디자인 산출물·디자인 시스템 | `design/` |
| 애플리케이션 코드 | `apps/` |
| 태스크 보드 | `tasks/` |
| 에이전트 피드백 | `docs/feedback/` |

## 에이전트 피드백

- 모든 에이전트는 작업 중 문제(스펙 불명확, 규칙 충돌, 기술 우려, 프로세스 병목 등)를 발견하면 `docs/feedback/`에 기록한다.
- 피드백 유형: `spec-unclear`, `rule-conflict`, `process-bottleneck`, `tech-concern`, `improvement`, `blocker`.
- **blocker**는 작업을 즉시 중단하고 사용자에게 알린다.
- 사용자는 주기적으로 피드백을 검토하고, `status`를 갱신하며, 필요 시 규칙·스펙·프로세스를 조정한다.
- PM(flow-orchestration 스킬)이 보드 점검 시 open 피드백도 함께 요약·보고한다.
- 상세: `docs/feedback/README.md`, `raise-feedback` 스킬.

## 규칙·스킬

- 공통: `.cursor/rules/project-defaults.mdc` (alwaysApply)
- 기획: `.cursor/rules/planning.mdc` (docs/specs/**)
- 디자인: `.cursor/rules/design.mdc` (design/**)
- 개발: `.cursor/rules/development.mdc` (apps/**, *.ts, *.tsx)
- 테스트: `.cursor/rules/testing.mdc` (테스트·태스크 관련)
- PM: `.cursor/rules/pm.mdc` (tasks/**)
- 피드백: `.cursor/skills/raise-feedback/` (문제·우려·개선 제안 기록)
- **프로젝트 컨셉**: `.cursor/skills/project-concept-interview/` (컨셉 문서 없을 때 "어떤 프로젝트를 진행하시겠습니까?" → 인터뷰 → 문서 작성·갱신)
- **태스크 명확화**: `.cursor/skills/task-clarification-interview/` (모호한 점이나 사용자 결정 필요 시 인터뷰 후 진행, 답변 전 대기)
- 스킬: `.cursor/skills/` 아래 역할별 워크플로우 스킬

상세 설정은 `docs/cursor-agent-setup.md` 참고.
