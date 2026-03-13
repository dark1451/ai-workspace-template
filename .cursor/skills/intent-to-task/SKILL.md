---
name: intent-to-task
description: >-
  사용자 의도("~ 하고 싶어", "기능 추가해줘", "기획해줘")를 스펙·태스크로 변환한다.
  스펙이 없으면 생성하고, pending 태스크를 등록한다.
  Use when the user expresses a feature intent, asks for planning, or says "하고 싶어".
---

# 사용자 의도 → 태스크 변환

## 트리거

- "~ 하고 싶어", "이 기능 추가해줘", "기획해줘", "스펙 작성해줘"

## 절차

1. **의도 수집**: 사용자가 원하는 것을 명확히 파악한다.
2. **스펙 확인**: `docs/specs/`에 해당 기능 스펙이 있는지 확인한다.
   - 있으면 → 기존 스펙 참조.
   - 없으면 → `docs/specs/`에 새 스펙 문서를 생성한다 (planning 규칙 준수: 목표, 요구사항, 수용 조건 포함).
3. **태스크 생성**: `tasks/items/<id>.md` 파일을 생성한다.
   - `id`: 타입-번호 (예: `feat-002`, `bug-001`). 기존 items를 확인해 번호 중복 방지.
   - `type`: feature / bugfix / design_system / chore 중 적절한 것.
   - `status`: `pending`
   - `spec`: 위에서 만든(또는 확인한) 스펙 경로.
   - 본문에 요구사항 요약, 수용 조건을 적는다.
4. **보드 갱신**: `tasks/board.json`의 `items` 배열에 새 태스크 ID를 추가하고, `updatedAt`을 갱신한다.
5. **안내**: "스펙이 생성되었고, pending 태스크가 등록됐습니다." 등 안내.

## 주의

- 태스크 타입에 따라 흐름이 다름: feature는 기획→디자인→개발→테스트, bugfix는 디자인 생략 가능.
- 스펙 작성 시 planning 규칙(`.cursor/rules/planning.mdc`)을 따른다.
- 한 번의 의도가 여러 태스크로 분해될 수 있다. 큰 기능이면 하위 태스크로 나눈다.
