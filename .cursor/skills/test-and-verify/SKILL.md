---
name: test-and-verify
description: >-
  in_test 상태의 태스크를 픽업하고, 테스트 실행·코드 검증·E2E 브라우저 검증을 수행한 뒤 상태를 전이한다.
  Use when asked "in_test 검증해줘", "테스트 진행해줘", or when tester agent picks up work.
---

# 테스트 및 검증 워크플로우

## 트리거

- "in_test 검증해줘", "테스트 진행해줘", "테스트 에이전트 작업해줘"

## 절차

1. **in_test 조회**: `tasks/board.json`에서 `status: in_test`인 항목을 찾는다.
2. **컨셉·진행 모드 확인**: `docs/project-concept.md`에서 작업 진행 모드(`proactive` / `approval_first`)를 확인한다.
3. **태스크 읽기**: `tasks/items/<id>.md`에서 스펙, 수용 조건, handoff 메모(codePaths, testCommand, runCommand, envNote)를 확인한다.
4. **모호성·결정 필요 여부 판단**:
   - 검증 기준이 모호하거나 사용자 판단이 필요한 부분이 있으면 **task-clarification-interview**를 진행한다.
   - 이 경우 태스크 `status`를 `waiting_user`로 변경하고, **"현재 사용자 확인 대기 중"**이라고 알린 뒤 검증을 멈춘다.
5. **단위/통합 테스트 실행**: `testCommand`를 실행하고 결과를 확인한다.
6. **코드 검증**: 린트(`pnpm lint` 등), 타입 체크(`pnpm typecheck` 등) 실행.
7. **E2E 검증** (feature 타입이고 UI 변경이 있는 경우):
   - `runCommand`로 앱을 기동한다 (이미 실행 중이면 생략).
   - cursor-ide-browser MCP 절차:
     1. `browser_tabs`로 탭 확인
     2. `browser_navigate`로 URL 이동
     3. `browser_snapshot`으로 페이지 구조 확인
     4. 스펙·수용 조건별 시나리오를 `browser_click`, `browser_type` 등으로 실행
     5. 기대 결과 vs 실제 결과 비교 → 통과/실패 판단
8. **결과 기록**: 태스크 메모에 `testResult` 작성 (통과/실패, E2E 여부, 실패 시 사유).

## 상태 전이

- **모두 통과**: 동일 역할(테스트) 에이전트에게 동료 리뷰 요청.
  - 작업 진행 모드가 `approval_first`이면 먼저 사용자에게 **어떤 검증을 수행했고 무엇이 통과했는지 1~3줄로 요약**해 확인을 받는다.
  - 확인이나 추가 판단이 필요하면 태스크 `status`를 `waiting_user`로 변경하고, **"현재 사용자 확인 대기 중"**이라고 알린다.
  - 단일 에이전트 환경에서 별도 테스트 리뷰 세션이 없으면, `peer-review` 스킬 규칙에 따라 **사용자 승인**을 리뷰 대체로 사용할 수 있음을 함께 안내한다.
  - 리뷰 통과 시: status를 `done`으로 변경, `board.json` 갱신.
  - 리뷰 수정 요청 시: 검증 절차 재확인 후 재리뷰.
- **실패**: status를 `in_progress`로 되돌리고, 실패 사유를 태스크 메모에 상세히 기록. `board.json` 갱신.
