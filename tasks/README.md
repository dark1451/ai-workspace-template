# 태스크 보드

## 구조

- `board.json`: 현재 스프린트/백로그 요약. `items` 배열에 태스크 ID 목록.
- `items/<id>.md`: 태스크 단위 파일. YAML frontmatter + 본문.

## 태스크 상태

| 상태 | 설명 | 담당 |
|------|------|------|
| `pending` | 기획·요구사항 정리됨, 작업 대기 | 기획자가 채움; 디자이너/개발자가 픽업 |
| `in_progress` | 디자인 또는 개발 진행 중 | 디자이너 / 개발자 |
| `in_test` | 구현 완료, 테스트 대기 | 테스트 에이전트 |
| `done` | 테스트 통과 | — |
| `deployed` | 배포 완료 | (수동 또는 파이프라인) |

## 태스크 타입

- `feature`: 기획 → 디자인 → 개발 → 테스트
- `bugfix`: 개발 → 테스트 (디자인 생략 가능)
- `design_system`: 디자인 시스템 작업
- `chore`: 테스트/리팩터/문서 등

## frontmatter 스키마

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 고유 ID (예: feat-001, bug-002) |
| `type` | string | feature / bugfix / design_system / chore |
| `status` | string | pending / in_progress / in_test / done / deployed |
| `priority` | string | high / medium / low (선택) |
| `assignedTo` | string | 픽업한 에이전트/세션 표시 (중복 픽업 완화) |
| `spec` | string | 관련 스펙 경로 (예: docs/specs/xxx.md) |
| `design` | string | 관련 디자인 산출물 경로 |
| `codePaths` | list | 변경된 디렉터리/파일 목록 |
| `testCommand` | string | 테스트 실행 명령 (예: pnpm test -- --run) |
| `runCommand` | string | 앱 실행 명령 (예: pnpm dev) |
| `envNote` | string | 필수 env 또는 .env.example 참조 |
| `testResult` | string | 테스트 결과 요약 (통과/실패, E2E 여부) |
| `reviewedBy` | string | 동료 리뷰한 에이전트/세션 |
| `reviewResult` | string | pass / request-changes |
| `reviewNote` | string | 리뷰 코멘트 요약 |
| `statusChangedAt` | string | 마지막 상태 변경일 (YYYY-MM-DD). PM이 정체 감지에 사용 |
| `created` | string | 생성일 (YYYY-MM-DD) |

## board.json 스키마

```json
{
  "sprint": "string (스프린트 이름 또는 backlog)",
  "updatedAt": "string (마지막 갱신 시각)",
  "items": ["string (태스크 ID 목록)"]
}
```

## 동료 리뷰 파일 (`.review.md`)

상태 전이 전 동료 리뷰 결과를 기록하는 파일. 다음 역할의 에이전트가 컨텍스트로 참고한다.

- **파일명**: `items/<id>.review.md` (태스크 파일과 같은 디렉터리)
- **내용**: 리뷰한 에이전트, 판정(pass / request-changes), 코멘트, 수정 요청 사항 등을 자유 형식으로 기록.

```markdown
<!-- 예시: items/feat-001.review.md -->
## 리뷰

- **reviewedBy**: (리뷰한 에이전트/세션)
- **reviewResult**: pass
- **reviewNote**: 스펙 수용 조건과 구현이 일치함. 테스트 커버리지 양호.

### 코멘트

- (상세 코멘트)
```

## 규칙

- 상태 변경 시 `board.json`과 `items/<id>.md` frontmatter를 **둘 다** 갱신한다.
- 한 번에 한 태스크 상태만 변경한다 (동시 편집 충돌 완화).
- 상태 전이 전 동일 역할 동료 리뷰를 통과해야 한다.
- 리뷰 결과는 태스크 메모 또는 `items/<id>.review.md`에 기록한다.
- **상태 전이 시 handoff 필드**(`spec`, `design`, `codePaths`, `testCommand`, `runCommand`, `envNote`)를 채워 다음 에이전트가 태스크 파일만 읽고도 실행할 수 있도록 한다.
