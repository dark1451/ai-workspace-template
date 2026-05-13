# 역할 시작 프롬프트 (Role prompts)

이 폴더는 **각 역할 에이전트를 한 줄로 띄우기 위한 시작 프롬프트** 의 사용자용 안내입니다.

실제 프롬프트 본문은 `.cursor/role-prompts/<role>.md` 에 들어 있고, `cursor-agent` 가
`--role=<key>` 로 실행될 때 첫 메시지로 자동 전달됩니다.

## 어디에 있나

| 역할 | 키 | 프롬프트 파일 |
|------|----|----------------|
| 개발자 | `dev` | `.cursor/role-prompts/dev.md` |
| 디자이너 | `design` | `.cursor/role-prompts/design.md` |
| 기획자 | `plan` | `.cursor/role-prompts/plan.md` |
| 테스트 | `test` | `.cursor/role-prompts/test.md` |
| PM / 스크럼 마스터 | `pm` | `.cursor/role-prompts/pm.md` |

각 파일의 본문(첫 `---` 다음부터)은 **에이전트에게 그대로 전달되는 텍스트**입니다.
앞부분의 주석/제목은 무시되지 않으므로 그대로 두어도 큰 문제는 없지만, 슬립한 프롬프트가
필요하면 본문만 남겨도 됩니다.

## 어떻게 쓰나

### 1. 사용자 프로젝트에서 `pnpm work:<role>` (프로젝트 루트에서)

이 템플릿으로 만든 프로젝트에는 루트 `package.json` 에 work 스크립트가 들어 있습니다.

```bash
pnpm work:dev      # 개발자
pnpm work:design   # 디자이너
pnpm work:plan     # 기획자
pnpm work:test     # 테스트
pnpm work:pm       # PM
pnpm work          # 역할 없이 일반 cursor-agent
pnpm work:open     # cursor-agent 대신 Cursor 데스크톱 새 창
```

옵션을 더 주려면:

```bash
pnpm work:dev -- --open    # 개발자 + Cursor 새 창
node ./scripts/work.mjs --role=pm --open
```

내부적으로 `scripts/work.mjs` 가 `scripts/agent-runner.mjs` 를 호출해 `cursor-agent` 를
띄우고, 첫 메시지로 `.cursor/role-prompts/<role>.md` 본문을 전달합니다.

### 2. 템플릿 저장소에서 `pnpm test:scenario:<role>` (템플릿 유지보수자)

이 템플릿 저장소(이 템플릿을 만들고 고치는 쪽)에서는 sandbox 환경에서 같은 코드로 실행합니다.

```bash
pnpm test:scenario:dev     # sandbox 에서 개발자
pnpm test:scenario:plan    # sandbox 에서 기획자
pnpm test:scenario --clean # 리셋 후 일반 시작
```

상세 옵션(`--clean` / `--open` / `--no-meta`)은 `test/scenarios/README.md` 참고.

> **work 와 test:scenario 는 같은 코드·같은 프롬프트 파일** 을 씁니다. 프롬프트 텍스트를
> 바꾸고 싶다면 `.cursor/role-prompts/<role>.md` 하나만 편집하면 양쪽에 반영됩니다.

### 3. 일반 Cursor 채팅·다른 IDE 세션에서

`.cursor/role-prompts/<role>.md` 를 열어서 본문 텍스트를 그대로 **첫 메시지**로 복사해 붙여
넣으세요. 그러면 그 세션이 그 역할로 들어갑니다.

### 4. 짧은 한 줄 명령으로

공통 규칙(`.cursor/rules/project-defaults.mdc`)에 **"역할 활성화 명령"** 이 들어 있어, 위
파일 본문을 모르더라도 다음과 같이 짧게 말해도 됩니다.

> "당신은 개발자입니다"  
> "기획자로 진행해줘"  
> "PM으로 보드 점검"

이 경우 에이전트가 알아서 해당 역할의 규칙·주 스킬을 적용하고 시작합니다. 자동 프롬프트는
이 짧은 한 줄을 **좀 더 친절하고 명시적인 시작 지시**로 만들어 둔 것입니다.

> **cursor-agent CLI 설치**: <https://cursor.com/cli> · 환경 설정 (PATH 등) 은
> `docs/cursor-agent-setup.md` 를 참고하세요.

## 편집할 때 주의

- 본문에서 `[역할: …]` 라벨 표시 지시는 그대로 두는 편이 좋습니다. 응답마다 어떤 역할인지
  눈에 보여야 다른 에이전트·사용자가 컨텍스트를 잃지 않습니다.
- 본문에서 **No-work fallback** 절차 부분을 지우지 마세요. 모든 역할 공통 규칙
  (`.cursor/rules/project-defaults.mdc` 의 "할 일 없음 보고 흐름")과 짝을 이루고,
  PM 의 경우 `docs/next-actions.md` 누적 기록과 연결됩니다.
- 본문에서 **인터뷰·todo 권고** 부분도 가급적 유지해 주세요. 모호한 점이 있으면 멈추고
  인터뷰부터, 복잡한 작업이면 짧은 todo 리스트로 진행하는 흐름이 이 템플릿의 기본 합의입니다.
