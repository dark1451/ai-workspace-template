# 패키지 유지보수

## 구조

- `project-resource/template/` — 스캐폴드에 넣을 템플릿 (단일 소스)
- `project-attachment/script/sync-resource.mjs` — `project-resource/template` → 루트 `resource/` 복사
- `src/index.js` — CLI 구현
- `bin/create-ai-workspace-template.js` — npm `bin` 진입점 (thin wrapper → `src/index.js`)

## 배포

저장소 루트에서:

```bash
npm run build
npm publish
```

`prepack`이 `npm run build`를 다시 실행한다. `resource/`는 `.gitignore`로 커밋하지 않는다.

## 로컬로 CLI만 실행

```bash
npm run build
node ./bin/create-ai-workspace-template.js my-folder
```

## 템플릿 업그레이드 (기존 프로젝트)

충돌 시 **스킵**하고 `docs/upgrade-report-*.md` + JSON 에 unified diff·sha256 를 남긴다.

```bash
npm run build
node ./bin/create-ai-workspace-template.js upgrade [프로젝트-경로]
node ./bin/create-ai-workspace-template.js upgrade --dry-run   # 현재 디렉터리, 적용 없음
```

- **managed**: `.cursor/`, `scripts/`, `AGENTS.md`, runbook 등 — 동일하면 skip, 다르면 충돌 스킵
- **merge_only**: `package.json`, `apps/web/*` 설정 — 자동 복사 없음, diff만 리포트
- **excluded**: `docs/project-concept.md`, `tasks/items/*`, `apps/web/src` 등 사용자 산출물
- 리포트: Myers diff, CRLF 정규화 sha256, 충돌 시 `*.migrate.*` 사이드카(원본 옆), `templateRoot` 실경로

정책 수정: `src/upgrade-policy.js`
