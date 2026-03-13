---
name: task-pickup
description: >-
  디자이너/개발자가 pending 태스크를 픽업하고, 구현·테스트 코드 작성 후 동료 리뷰를 거쳐 in_test로 전환하는 워크플로우.
  Use when developer/designer picks up work, or when asked "pending 처리해줘", "다음 태스크 해줘".
---

# 태스크 픽업 워크플로우

## 트리거

- "pending 태스크 처리해줘", "다음 태스크 해줘", "개발 진행해줘"

## 절차

1. **pending 조회**: `tasks/board.json`과 `tasks/items/`에서 `status: pending`인 항목을 찾는다. 여러 건이면 `priority`가 높은 것 우선.
2. **픽업**: 태스크의 `status`를 `in_progress`로 변경, `assignedTo`에 세션 표시. `board.json`도 갱신.
3. **스펙 확인**: 태스크의 `spec` 경로에서 스펙을 읽고 요구사항·수용 조건 파악.
4. **디자인 확인**: `type: feature`이고 `design` 필드가 있으면 디자인 산출물 참조.
5. **구현**: 스펙·디자인에 맞게 코드 작성.
6. **테스트 코드 작성**: 해당 범위의 단위/통합 테스트 코드를 작성한다.
7. **handoff 메모**: 태스크 메모에 `codePaths`, `testCommand`, `runCommand`, `envNote`를 기록한다.
8. **동료 리뷰 요청**: 동일 역할(개발/디자인) 에이전트에게 리뷰를 요청한다.
9. **리뷰 통과 시**: status를 `in_test`로 변경. `board.json` 갱신.
10. **리뷰 수정 요청 시**: 피드백 반영 후 재리뷰 요청.

## pending이 없을 때

다음 중 우선순위를 정해 작업한다:
1. 버그 수정 (기존 이슈나 코드에서 발견한 것)
2. 테스트 보강 (커버리지 부족한 영역)
3. UI/UX 개선
4. 디자인 시스템 정리·표준화
