# Cursor 에이전트 설정 가이드

## 현재 구성 요약

이 프로젝트의 에이전트 워크플로우는 다음 파일들로 구성되어 있다:

| 요소 | 위치 | 역할 |
|------|------|------|
| AGENTS.md | 프로젝트 루트 | 프로젝트 메모리·워크플로우·역할·문서 맵 |
| Cursor Rules | `.cursor/rules/*.mdc` | 역할별(기획/디자인/개발/테스트/PM) 규칙 |
| Skills | `.cursor/skills/*/SKILL.md` | 워크플로우 스킬 (태스크 픽업, 리뷰, 피드백 등) |
| 태스크 보드 | `tasks/` | board.json + items/*.md |
| 문서 | `docs/` | 스펙, 아이디어, 아키텍처, runbook, 피드백 |

## 상세

- 역할별 우선순위·동료 리뷰·컨텍스트 공유 원칙은 `AGENTS.md` 참조.
- 태스크 상태·스키마는 `tasks/README.md` 참조.
- 개발 스택·환경 변수는 `docs/architecture/stack.md`, `docs/architecture/env-template.md` 참조.
- 실행·테스트·빌드 절차는 `docs/runbook/runbook.md` 참조.
- 에이전트 피드백 채널은 `docs/feedback/README.md` 참조.

## 규칙 목록

| 규칙 파일 | globs | 설명 |
|-----------|-------|------|
| `project-defaults.mdc` | alwaysApply | 공통 규칙 |
| `planning.mdc` | docs/specs/\*\*, docs/ideas/\*\*, tasks/items/\*\* | 기획 |
| `design.mdc` | design/\*\* | 디자인 |
| `development.mdc` | apps/\*\*, \*\*.ts, \*\*.tsx | 개발 |
| `testing.mdc` | \*\*.test.\*, \*\*/tests/\*\* | 테스트 |
| `pm.mdc` | tasks/\*\* | PM |

## 스킬 목록

| 스킬 | 트리거 예시 |
|------|-------------|
| `intent-to-task` | "~ 하고 싶어", "기획해줘" |
| `ideation` | "아이디에이션 해줘" |
| `task-pickup` | "pending 처리해줘" |
| `peer-review` | "리뷰해줘" |
| `test-and-verify` | "in_test 검증해줘" |
| `flow-orchestration` | "보드 상태 봐줘" |
| `raise-feedback` | 문제 발견 시 자동, "피드백 남겨줘" |
