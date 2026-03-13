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
2. **태스크 읽기**: `tasks/items/<id>.md`에서 스펙, 수용 조건, handoff 메모(codePaths, testCommand, runCommand, envNote)를 확인.
3. **단위/통합 테스트 실행**: `testCommand`를 실행하고 결과를 확인한다.
4. **코드 검증**: 린트(`pnpm lint` 등), 타입 체크(`pnpm typecheck` 등) 실행.
5. **E2E 검증** (feature 타입이고 UI 변경이 있는 경우):
   - `runCommand`로 앱을 기동한다 (이미 실행 중이면 생략).
   - cursor-ide-browser MCP 절차:
     1. `browser_tabs`로 탭 확인
     2. `browser_navigate`로 URL 이동
     3. `browser_snapshot`으로 페이지 구조 확인
     4. 스펙·수용 조건별 시나리오를 `browser_click`, `browser_type` 등으로 실행
     5. 기대 결과 vs 실제 결과 비교 → 통과/실패 판단
6. **결과 기록**: 태스크 메모에 `testResult` 작성 (통과/실패, E2E 여부, 실패 시 사유).

## 상태 전이

- **모두 통과**: 동일 역할(테스트) 에이전트에게 동료 리뷰 요청.
  - 리뷰 통과 시: status를 `done`으로 변경, `board.json` 갱신.
  - 리뷰 수정 요청 시: 검증 절차 재확인 후 재리뷰.
- **실패**: status를 `in_progress`로 되돌리고, 실패 사유를 태스크 메모에 상세히 기록. `board.json` 갱신.
