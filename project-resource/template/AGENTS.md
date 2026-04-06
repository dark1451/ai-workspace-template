# ai-workspace 에이전트 가이드

## 프로젝트 개요

- **ai-workspace**: AI 에이전트 기반 개발 워크플로우 보일러플레이트 모노레포
- 에이전트는 **아이디에이션 → 기획 → 디자인 → 개발 → 테스트 → 배포** 순서를 인지하고, 단계별 규칙·산출물 위치·태스크 보드를 따른다.

## 태스크 보드

- **단일 소스**: `tasks/board.json` + `tasks/items/*.md`. 상태 변경 시 두 곳을 일치시킨다.
- 스키마·상태·필드 정의는 `tasks/README.md` 참조.
- 한 번에 한 태스크 상태만 변경한다 (동시 편집 충돌 완화).
- 사용자 확인이 필요한 태스크는 `status: waiting_user`로 두어 일반 정체와 구분한다.
- 보드·상태 불일치 발생 시 PM 또는 수동으로 정리한다.

## 진입점

- **첫 프로젝트 진행 시(컨셉 문서 없음)**  
  `docs/project-concept.md`가 없거나 비어 있으면:
  1. **"어떤 프로젝트를 진행하시겠습니까?"**라고 묻고, **프로젝트 컨셉 정의 인터뷰**를 진행한다 (project-concept-interview 스킬).
  2. 인터뷰 내용을 바탕으로 `docs/project-concept.md`를 작성·갱신한다. 이때 **작업 진행 모드**(`proactive` / `approval_first`)도 반드시 확정한다.
  3. 컨셉 문서가 채워진 뒤에만 스펙·태스크·디자인·개발을 진행한다. 에이전트는 이 문서를 기준으로 산출물을 낸다.
- **컨셉 문서가 있는 상태에서** 사용자가 "~ 하고 싶어", "이 기능 추가해줘", "기획해줘" 등을 말하면:
  1. `docs/project-concept.md`를 참조해 범위·우선순위와 맞는지 확인한다.
  2. `docs/specs/`에 해당 기능 스펙이 있는지 확인.
  3. 없으면 기획 규칙에 따라 스펙·요구사항 문서 생성 (컨셉 문서 기반).
  4. 작업 진행 모드와 명확성 상태에 따라 `tasks/items/`에 새 태스크 파일을 생성한다. 기본은 `pending`이지만, 사용자 확인이 남아 있으면 `waiting_user`로 두거나 생성 자체를 보류할 수 있다.
- **모호한 점이나 사용자 결정 필요 사항**이 있으면 **task-clarification-interview**를 먼저 진행하고, 답변 전에는 **"현재 사용자 확인 대기 중"**이라고 알린다.
- **대화 중 프로젝트 관련 결정·변경**이 있으면 `docs/project-concept.md`를 갱신하고, 변경 이력을 남긴다.

## 역할별 우선순위

| 역할 | 주 작업 | 할 일 없을 때 |
|------|---------|---------------|
| **PM / 스크럼 마스터** | 보드 점검, 병목·정체 감지, 역할별 다음 액션 제안, handoff 정리 | — |
| **기획자** | pending 태스크 구성 (스펙·요구사항, 태스크 분해) | 아이디에이션 (`docs/ideas/` 갱신) |
| **디자이너** | feature/design_system 태스크 픽업 → 디자인 산출물 작성 → 동료 리뷰 → 개발 handoff가 있으면 `pending`으로 반환, 없으면 다음 단계 전이 | 디자인 시스템 정리, UI/UX 개선 |
| **개발자** | pending 픽업 → 구현 + 테스트 코드 작성 → 동료 리뷰 → in_test | 버그 수정, 테스트 보강, UI/UX 개선, 디자인 시스템 |
| **테스트 에이전트** | in_test 처리 (테스트 실행·검증·E2E) → 동료 리뷰 → done | — |

## 동료 리뷰

- 각 역할의 **작업 산출물**은 **같은 역할의 다른 에이전트**가 리뷰한 뒤, 통과 시에만 다음 단계로 전이한다.
- **단일 에이전트 환경**: 새 세션 리뷰, 셀프 체크리스트(사용자 승인 필요), 또는 사용자 직접 승인으로 대체 가능. 상세는 `peer-review` 스킬 참조.
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
| **`docs/project-concept.md`** | (인터뷰 진행) 모든 역할 | **모든 에이전트** | **프로젝트 단일 기준: 목표·사용자·§5 프로젝트 디자인 컨셉·기능·제약·작업 진행 모드. 없으면 작업 불가. 대화에 따라 지속 갱신.** |
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
