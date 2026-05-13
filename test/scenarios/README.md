# test/scenarios

`project-resource/template/` 의 규칙·문서·태스크 보드를 **임시 대화용 샌드박스**로 복사해,
새 프로젝트 진입 흐름(컨셉 인터뷰, 스킬 발동, 룰 적용 등)을 빠르게 검증하기 위한 폴더입니다.

## 디렉터리

```
test/scenarios/
├── README.md          # 이 파일
└── sandbox/           # test:scenario 가 만드는 작업 공간 (git ignored)
```

`sandbox/` 는 **`--clean` 으로만 통째로 지워지는 작업 공간**입니다. 그 안에서 한 작업은 git
에 들어가지 않으므로, 유지하고 싶은 결과물은 다른 곳으로 옮겨두세요.

## 기본 명령어

루트에서 실행하세요.

| 명령 | 동작 |
|------|------|
| `pnpm test:scenario` | `sandbox/` 준비 후 **`cursor-agent`** 인터랙티브 세션 (대화 이어가기) |
| `pnpm test:scenario:open` | `sandbox/` 준비 후 **Cursor 데스크톱 새 창**으로 열기 |

## 역할 시나리오 (자동 프롬프트)

`--role=<key>` 로 시작하면, cursor-agent 의 **첫 메시지로 역할 지시 프롬프트를 자동 전달**합니다.
프롬프트 본문은 sandbox 안의 **`.cursor/role-prompts/<key>.md` 파일에서 읽어 옵니다.** 콘솔에도 같이
출력되니, 자동 전달이 안 되면 그 텍스트를 복사해 첫 메시지로 붙여 넣으면 됩니다.

| 명령 | 역할 | 프롬프트 파일 |
|------|------|----------------|
| `pnpm test:scenario:dev` | 개발자 | `.cursor/role-prompts/dev.md` |
| `pnpm test:scenario:design` | 디자이너 | `.cursor/role-prompts/design.md` |
| `pnpm test:scenario:plan` | 기획자 | `.cursor/role-prompts/plan.md` |
| `pnpm test:scenario:test` | 테스트 | `.cursor/role-prompts/test.md` |
| `pnpm test:scenario:pm` | PM | `.cursor/role-prompts/pm.md` |

> 프롬프트 본문을 바꾸고 싶으면 sandbox 안의 해당 `.md` 파일 본문(첫 `---` 뒤)을 그대로 편집하세요.
> 다음 `pnpm test:scenario:<role>` 실행부터 새 본문이 전달됩니다. 템플릿 기본값은
> `project-resource/template/.cursor/role-prompts/<role>.md` 에 들어 있고, `--clean` 시 그 값으로 재복사됩니다.
> 사용자/팀이 보기 좋은 안내는 `docs/role-prompts/README.md` 에 있습니다.

직접 노드로:

```bash
node ./project-attachment/script/test-scenario.mjs --role=dev
node ./project-attachment/script/test-scenario.mjs --role=design --clean
node ./project-attachment/script/test-scenario.mjs --role=pm --open
```

## 플래그

| 플래그 | 동작 |
|--------|------|
| `--role=<key>` | 첫 프롬프트로 역할 지시 전달. key: `dev` `design` `plan` `test` `pm` |
| `--open` | 인터랙티브 cursor-agent 대신 Cursor 데스크톱 새 창 열기 |
| `--clean` | 기존 `sandbox/` 를 통째로 삭제 후 템플릿에서 재복사 |
| `--no-meta` | `--clean` 으로 새로 만들 때 `.scenario-meta.json` 생성을 생략 |

사용 예:

```bash
pnpm test:scenario --clean                       # 리셋 후 일반 시작
pnpm test:scenario:dev --clean                   # 리셋 후 개발자 시나리오
pnpm test:scenario:plan --open                   # GUI 새 창 + 기획자 시나리오
pnpm test:scenario --role=test --clean --no-meta # 리셋 + meta 없이 테스트 시나리오
```

## 동작

1. **리셋은 `--clean` 일 때만**: 기존 `sandbox/` 가 있으면 그대로 두고 진입합니다.
2. 새로 만들 때 `node_modules/`, `.git/`, `dist/` 등은 복사에서 제외됩니다.
3. 새로 만들 때 `sandbox/.scenario-meta.json` 에 생성 시각·원본 커밋 해시가 기록됩니다 (`--no-meta` 로 비활성화).
4. 기본 모드는 `cursor-agent` 를 `sandbox/` cwd 로 인터랙티브 시작. `--open` 시 Cursor 데스크톱 새 창.
5. `--role=<key>` 면 시작 직후 첫 메시지로 그 역할의 지시 프롬프트를 전달하고, 콘솔에도 동일 텍스트를 출력합니다. 사용 가능한 key 는 sandbox 안 `.cursor/role-prompts/*.md` 파일 이름으로 결정됩니다 (현재 기본: `dev`, `design`, `plan`, `test`, `pm`). 잘못된 key 를 주면 사용 가능한 목록과 함께 에러를 알려 줍니다.

## 역할 활성화 규칙 (sandbox 안 .cursor/rules/project-defaults.mdc)

샌드박스 안의 공통 규칙에 **"역할 활성화 명령"** 이 박혀 있어, 사용자가
`"당신은 개발자입니다"` 같은 짧은 지시만 줘도 에이전트가:

- 응답 머리에 `[역할: 개발자]` 표시
- `.cursor/rules/development.mdc` + 주 스킬(예: `task-pickup`) 명시적 적용
- 컨셉/모드 점검 후 다음 액션을 제안·실행

하도록 되어 있습니다. `--role=<key>` 는 그 지시를 자동으로 첫 메시지에 넣어 주는 도구입니다.

## 주의

- `sandbox/` 에서 `pnpm install` 을 실행해 앱을 직접 띄워보고 싶다면, 그 안에 별도로
  `node_modules/` 가 생깁니다. `--clean` 시 같이 삭제되니 주의하세요.
- `sandbox/` 는 **루트 pnpm workspace 에 포함되지 않습니다**. 루트의 의존성과는 독립적입니다.
- Cursor 새 창(`--open`)이 sandbox 폴더를 잡고 있는 동안에는 `--clean` 이 EBUSY 로 실패합니다. 해당 창을 닫고 다시 실행하세요.
