# create-ai-workspace-template

**한 줄 요약:** 명령 한 번으로 **AI 에이전트 기반 개발 워크플로우**(Cursor 규칙·스킬, 문서 구조, 태스크 보드, Vite+React 앱)가 담긴 모노레포를 만듭니다.

이 저장소 **루트가 npm 패키지**(`create-ai-workspace-template`)이며, GitHub 저장소 이름은 `ai-workspace-template` 입니다.

---

## 지금 바로 시작 (npm 사용자)

1. **터미널에서 실행** (폴더 이름은 원하는 프로젝트명으로 바꿉니다)

   ```bash
   npm create ai-workspace-template@latest my-project
   ```

   또는

   ```bash
   npx create-ai-workspace-template@latest my-project
   ```

2. **생성이 끝나면** 프로젝트 폴더로 이동합니다.

   ```bash
   cd my-project
   ```

3. **다음은 프로젝트 안 `README.md`** 를 열어, Supabase 설정과 개발 서버 실행을 이어갑니다.

스크립트가 템플릿 파일을 복사한 뒤, 같은 폴더에서 `pnpm install` 을 자동으로 실행합니다.

---

## 실행 방법 정리

| 하고 싶은 것 | 명령 |
|--------------|------|
| 새 폴더 `my-project`에 만들기 | `npm create ai-workspace-template@latest my-project` |
| 같은 방식으로 `npx`만 쓰기 | `npx create-ai-workspace-template@latest my-project` |
| **현재 폴더**에 바로 풀기 | `npm create ai-workspace-template@latest` (이름 생략) |

이름을 생략하면 **지금 있는 디렉터리**에 파일이 들어갑니다. 이미 다른 파일이 있으면 덮어쓰지 않도록, 보통은 **새 폴더 이름을 지정**하는 것을 권장합니다.

---

## 미리 준비할 것

- **Node.js** 18 이상
- **pnpm** — 없다면:

  ```bash
  corepack enable
  corepack prepare pnpm@latest --activate
  ```

---

## 생성된 프로젝트에서 할 일

- 프로젝트 루트의 **`README.md`** 에 **웹 앱 실행**, **환경 변수(.env)** 안내가 있습니다.
- Cursor를 쓰는 경우, **프로젝트 폴더를 워크스페이스로 연 상태**에서 `.cursor` 규칙이 적용됩니다.
- 에이전트·문서 구조는 **`AGENTS.md`** 와 `docs/` 를 참고하면 됩니다.

---

## 이 패키지에 무엇이 들어 있나요?

npm에 올라가는 것은 **스캐폴드 CLI**뿐입니다. 실제 폴더 구조·규칙·앱 코드는 실행 시점에 프로젝트로 복사됩니다. 복사되는 내용의 설명은 생성된 프로젝트의 **`README.md`** 와 **`AGENTS.md`** 에 정리되어 있습니다.

---

## 자주 묻는 질문

**Q. `npm create` 와 `npx create-ai-workspace-template` 차이는?**  
둘 다 같은 CLI를 실행합니다. `npm create ai-workspace-template` 은 npm이 내부적으로 `create-ai-workspace-template` 패키지를 실행하도록 연결해 둔 이름입니다.

**Q. pnpm만 되나요?**  
템플릿 모노레포는 pnpm 워크스페이스를 기준으로 작성되어 있습니다. 생성 후에도 `pnpm` 명령을 사용합니다.

**Q. Git 없이 써도 되나요?**  
네. 복사만 하며, 템플릿에 포함된 `.git` 은 복사하지 않습니다. 이후 `git init` 은 선택입니다.

---

## 이 저장소를 clone해 개발·기여하는 경우

1. 저장소를 clone합니다.
2. **저장소 루트**에서 의존성을 설치합니다.

   ```bash
   pnpm install
   ```

3. 웹 앱 개발 서버:

   ```bash
   pnpm --filter web dev
   ```

템플릿 **본문**(스캐폴드에 복사되는 파일)은 **`project-resource/template/`** 에 있습니다. `pnpm-workspace.yaml` 이 루트 패키지와 `project-resource/template/apps/*` 를 워크스페이스로 묶습니다.

| 경로 | 역할 |
|------|------|
| 루트 `package.json` | npm 패키지 `create-ai-workspace-template` (배포 대상) |
| `project-resource/template/` | 스캐폴드에 넣을 ai-workspace 본문 |
| `src/index.js` | 스캐폴드 CLI |
| `project-attachment/script/sync-resource.mjs` | 빌드: 템플릿 → 루트 `resource/` |

---

## 패키지 유지보수자용 (npm 배포)

- 템플릿 원본은 **`project-resource/template/`** 에 있습니다.
- **`npm run build`** 가 위 폴더를 루트의 **`resource/`** 로 복사합니다. (`resource/` 는 `.gitignore` 되어 커밋하지 않습니다.)
- **`npm pack`** / **`npm publish`** 직전에 **`prepack`** 이 `npm run build` 를 자동 실행합니다.

### 배포 전 체크리스트

1. `project-resource/template/` 내용이 배포하고 싶은 상태인지 확인한다.
2. 저장소 **루트**에서 패키징 검증(선택):

   ```bash
   npm run build
   npm pack
   ```

3. npm 로그인 후 배포 (**루트에서**):

   ```bash
   npm login   # 최초 또는 세션 만료 시
   npm run build   # 선택: tarball 내용 미리 맞추기
   npm publish     # 비스코프 패키지는 기본 공개. prepack 이 build 를 한 번 더 실행함
   ```

   tarball에는 `package.json`의 `files`(`src/`, `resource/`)와 npm이 항상 넣는 `README.md`, `LICENSE`가 포함됩니다.

4. 로컬에서 CLI만 시험: `node ./src/index.js 시험용폴더`

5. (선택) 태그: `git tag v0.9.0 && git push origin v0.9.0`
