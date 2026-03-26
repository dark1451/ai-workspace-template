# 개발 스택

## 웹 프론트엔드

| 영역 | 선택 | 비고 |
|------|------|------|
| 빌드/프레임워크 | Vite + React + React Router | 정적 빌드(SPA/SSG) |
| 언어 | TypeScript | 타입 안전성, 에이전트 코드 분석에 유리 |
| 테스트 | Vitest (단위/통합) | Vite 런타임과 동일 환경 |
| E2E | cursor-ide-browser MCP / Playwright | 태스크 타입별 선택 적용 |
| 패키지 매니저 | pnpm | 워크스페이스 지원, 디스크 효율 |

### 대안

- **Next.js (static export)**: `output: 'export'`로 정적 배포 가능. 파일 기반 라우팅·이미지 최적화가 필요하거나 팀이 Next에 익숙할 때 전환 고려. 전환 시 `apps/web`의 빌드 설정과 `docs/runbook/runbook.md`를 함께 갱신할 것.

## 백엔드 / BaaS

| 영역 | 선택 | 비고 |
|------|------|------|
| 인증 | Supabase Auth | 이메일/소셜 로그인 |
| DB | Supabase (PostgreSQL) | RLS, 마이그레이션 |
| Storage | Supabase Storage | 파일 업로드/다운로드 |
| Realtime | Supabase Realtime | 필요 시 사용 |
| Edge Functions | Supabase Edge Functions | 서버 사이드 로직 필요 시 |

프론트는 정적 앱이므로 Supabase 클라이언트(`@supabase/supabase-js`)만 사용한다.

## 모노레포 구조

```
ai-workspace/
├── AGENTS.md
├── docs/
│   ├── specs/            # 스펙 (기획)
│   ├── ideas/            # 아이디에이션
│   ├── architecture/     # 아키텍처·스택·env 템플릿
│   └── runbook/          # 실행 방법 (설치, 서버, 테스트, 배포)
├── design/               # 디자인 시스템·UI 스펙
├── tasks/                # 태스크 보드
├── apps/
│   └── web/              # Vite + React + React Router 앱
│       ├── src/
│       ├── public/
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── package.json
└── .cursor/rules/
```

## 환경 변수

환경 변수 템플릿은 `docs/architecture/env-template.md`를 참조한다. 실제 시크릿은 `.env` 파일에 저장하며 리포에 커밋하지 않는다.
