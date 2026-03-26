---
name: raise-feedback
description: >-
  에이전트가 작업 중 발견한 문제점·우려·개선 제안을 docs/feedback/에 기록한다.
  모든 역할의 에이전트가 사용 가능. Use when encountering unclear specs,
  rule conflicts, process bottlenecks, tech concerns, or blockers.
---

# 피드백 제출 (Raise Feedback)

## 트리거

- 작업 중 스펙이 불명확할 때
- 규칙 간 충돌을 발견했을 때
- 프로세스가 비효율적이라 느낄 때
- 기술적 우려가 있을 때
- 작업 진행이 불가능한 블로커를 만났을 때
- "피드백 남겨줘", "불평 기록해줘" 등 사용자 요청 시

## 절차

1. **유형 판단**: 문제가 어떤 유형인지 판단한다 (spec-unclear, rule-conflict, process-bottleneck, tech-concern, improvement, blocker).
2. **심각도 판단**: low / medium / high / blocker 중 하나.
3. **파일 생성**: `docs/feedback/YYYY-MM-DD-<짧은설명>.md` 형식으로 피드백 파일을 생성한다.
   - frontmatter: type, severity, taskId (해당 시), role, date, status: open
   - 본문: 상황, 문제, 제안
4. **사용자 알림**: 채팅으로 "피드백을 기록했습니다: docs/feedback/xxx.md" 안내.
   - `blocker`이면: "**블로커 발견**: [설명]. 작업을 중단합니다. 확인 후 지시해 주세요."

## blocker 시 행동

- 작업을 즉시 중단한다.
- 태스크 메모에 블로커 사유를 기록한다.
- 사용자에게 알리고 지시를 기다린다.

## 주의

- 피드백 기록은 작업을 대체하지 않는다. blocker가 아닌 한 작업은 계속 진행하되, 문제를 기록해 둔다.
- 같은 문제에 대한 중복 피드백은 기존 파일에 추가하거나, 새 파일에서 기존 파일을 참조한다.
