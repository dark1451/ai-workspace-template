---
name: flow-orchestration
description: >-
  PM/스크럼 마스터가 보드 상태를 점검하고, 병목·정체를 감지하며, 역할별 다음 액션을 도출·요약한다.
  Use when asked "보드 상태 봐줘", "다음에 뭘 해야 할지 정리해줘", "병목 있어?".
---

# 흐름 조율 (Flow Orchestration)

## 트리거

- "보드 상태 봐줘", "다음에 뭘 해야 할지 정리해줘", "병목 있어?", "스프린트 현황"

## 절차

1. **보드 조회**: `tasks/board.json`의 `items`를 읽고, 각 `tasks/items/<id>.md`의 status를 확인한다.
2. **상태별 집계**: pending / in_progress / waiting_user / in_test / done / deployed 각 몇 건인지 집계.
3. **정체·병목 판단**:
   - pending이 많고 in_progress가 0이면 → "개발자/디자이너 픽업 필요".
   - in_test가 쌓이면 → "테스트 에이전트 검증 필요".
   - waiting_user가 쌓이면 → "사용자 확인/의사결정 대기 중인 태스크가 많음"으로 안내.
   - 특정 태스크의 `statusChangedAt`이 3일 이상 전이면 → 정체로 판단. 단, `waiting_user`는 정체가 아니라 사용자 응답 대기로 구분한다.
   - pending을 만들 건이 없고 기획자가 유휴이면 → "아이디에이션 권장".
4. **역할별 권장 액션 도출**:
   - 각 역할(기획자, 디자이너/개발자, 테스트, PM)에 대해 "지금 뭘 해야 하는지" 1줄 요약.
5. **요약 출력**: 상태별 개수 + 권장 액션을 채팅으로 제공. 필요 시 `docs/`에 기록.

## handoff 점검

- in_progress → in_test 전이한 태스크의 메모에 `testCommand`, `runCommand`, `codePaths`, `envNote`가 있는지 확인. 빠져 있으면 보완 제안.

## 피드백 점검

- `docs/feedback/`에 `status: open`인 피드백이 있는지 확인한다.
- open 피드백이 있으면 요약해 사용자에게 알리고 검토를 권장한다.
- blocker 피드백이 있으면 해당 태스크의 진행이 막혀 있음을 강조한다.

## 주의

- PM은 태스크를 직접 실행하지 않는다. 보드·흐름 점검, 역할별 다음 액션 정리, 피드백 취합에 집중한다.
