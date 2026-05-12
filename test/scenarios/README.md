# test/scenarios

`project-resource/template/` 의 규칙·문서·태스크 보드를 **임시 대화 환경**으로 띄워 보고,
새 프로젝트 진입 흐름(컨셉 인터뷰, 스킬 발동, 룰 적용 등)을 빠르게 검증하기 위한 폴더입니다.

## 디렉터리

```
test/scenarios/
├── README.md          # 이 파일
└── sandbox/           # test:scenario 가 매번 리셋·재생성 (git ignored)
```

`sandbox/` 는 **언제든 통째로 지워지는 작업 공간**입니다. 그 안에서 한 작업은 git 에
들어가지 않으므로, 유지하고 싶은 결과물은 다른 곳으로 옮겨두세요.

## 명령어

루트에서 실행하세요.

| 명령 | 동작 |
|------|------|
| `pnpm test:scenario` | `sandbox/` 를 리셋하고 다음 액션을 안내 |
| `pnpm test:scenario:open` | 리셋 후 **Cursor 새 창**으로 `sandbox/` 를 연다 (`cursor` CLI 필요) |
| `pnpm test:scenario:agent` | 리셋 후 `sandbox/` 안에서 **`cursor-agent` 인터랙티브 세션** 시작 |

옵션 플래그를 직접 줘도 동일합니다.

```bash
node ./project-attachment/script/test-scenario.mjs --open
node ./project-attachment/script/test-scenario.mjs --agent
```

## 동작

1. **항상 리셋**: 기존 `sandbox/` 가 있으면 삭제하고, `project-resource/template/` 을 그대로 복사합니다.
2. `node_modules/`, `.git/`, `dist/` 등은 복사에서 제외됩니다.
3. `sandbox/.scenario-meta.json` 에 생성 시각·원본 커밋 해시가 기록됩니다 (`--no-meta` 로 비활성화).
4. `--open`: 시스템에 `cursor` CLI 가 있으면 새 창을 띄웁니다. 없으면 수동 경로만 안내합니다.
5. `--agent`: 시스템에 `cursor-agent` 가 있으면 터미널에서 인터랙티브 세션을 띄웁니다. 없으면 설치 안내만 합니다.

## 사용 예

새 프로젝트 진입 시나리오를 한 번 돌려보고 싶을 때:

```bash
pnpm test:scenario:open
```

새 Cursor 창에서 `"안녕? 무슨 프로젝트를 진행할까?"` 같은 식으로 말을 걸면
`project-concept-interview` 스킬이 동작하고, `docs/project-concept.md` 가 채워지는지를
실제로 확인할 수 있습니다.

테스트가 끝나면 다음 실행이 알아서 모두 깨끗이 지웁니다.

## 주의

- `sandbox/` 에서 `pnpm install` 을 실행해 앱을 직접 띄워보고 싶다면, 그 안에 별도로
  `node_modules/` 가 생깁니다. 다음 리셋 시 같이 삭제되니 주의하세요.
- `sandbox/` 는 **루트 pnpm workspace 에 포함되지 않습니다**. 루트의 의존성과는 독립적입니다.
- 시나리오마다 다른 폴더가 필요해지면 이 스크립트를 확장하기보다 새 슬롯(예: `sandbox-a/`,
  `sandbox-b/`) 을 도입하는 PR 을 검토하세요.
