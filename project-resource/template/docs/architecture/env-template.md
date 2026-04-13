# 환경 변수 템플릿

> 이 파일은 변수 이름과 설명만 포함한다. 실제 시크릿은 `.env` 파일에 저장하며 리포에 커밋하지 않는다.

## Supabase

| 변수 | 설명 | 예시 |
|------|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Publishable API 키 (클라이언트·공개용, 구 anon key) | `eyJ...` |
| `SUPABASE_SECRET_KEY` | Supabase Secret API 키 (서버 전용, 구 service_role). **Vite에 넣지 말 것** | `eyJ...` |

## 앱 설정

| 변수 | 설명 | 예시 |
|------|------|------|
| `VITE_APP_URL` | 앱 공개 URL (OAuth 콜백 등) | `http://localhost:5173` |

## .env.example

`apps/web/.env.example` 파일에 위 변수를 빈 값으로 두고 리포에 포함한다:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_APP_URL=http://localhost:5173
# SUPABASE_SECRET_KEY=   # 서버·Edge Functions 전용
```

새 환경 변수가 추가되면 이 문서와 `.env.example`을 함께 갱신한다.
