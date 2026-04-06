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
