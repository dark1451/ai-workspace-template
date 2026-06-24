# 환경 변수 템플릿

> 이 파일은 변수 이름과 설명만 포함한다. 실제 시크릿은 `.env` / Vercel Environment Variables에 저장하며 리포에 커밋하지 않는다.

권장 스택은 **Next.js + Vercel + Supabase**다. 아래 **Next.js** 섹션을 기본으로 쓰고, 템플릿 Vite 뼈대를 그대로 쓸 때만 **Vite** 섹션을 참조한다.

## Next.js (권장)

### Supabase

| 변수 | 설명 | 노출 | 예시 |
|------|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 클라이언트·서버 | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable API 키 (구 anon key) | 클라이언트·서버 | `eyJ...` |
| `SUPABASE_SECRET_KEY` | Secret API 키 (구 service_role) | **서버 전용** | `eyJ...` |

### 앱·배포

| 변수 | 설명 | 노출 | 예시 |
|------|------|------|------|
| `NEXT_PUBLIC_APP_URL` | 앱 공개 URL (OAuth 콜백 등) | 클라이언트 | `http://localhost:3000` / `https://*.vercel.app` |

Vercel 배포 시 Production·Preview·Development 환경별로 위 변수를 [Vercel Dashboard → Settings → Environment Variables](https://vercel.com/docs/projects/environment-variables)에 등록한다. `SUPABASE_SECRET_KEY`는 Production·Preview에만 서버 변수로 넣고, 클라이언트 번들에 포함되지 않게 한다.

### `.env.local` 예시 (Next.js)

`apps/web/.env.example`에 아래 형태로 두고 리포에 포함한다:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
# SUPABASE_SECRET_KEY=   # Route Handlers·Server Actions 전용 (Vercel 서버 env)
```

## Vite (템플릿 현재 뼈대)

Next.js로 전환 전 `apps/web` Vite SPA용 변수.

| 변수 | 설명 | 예시 |
|------|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable API 키 | `eyJ...` |
| `VITE_APP_URL` | 앱 공개 URL | `http://localhost:5173` |
| `SUPABASE_SECRET_KEY` | Secret API 키. **Vite 클라이언트 번들에 넣지 말 것** | `eyJ...` |

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_APP_URL=http://localhost:5173
# SUPABASE_SECRET_KEY=
```

## Supabase Auth 콜백 URL

Supabase Dashboard → Authentication → URL Configuration:

| 환경 | Site URL / Redirect URLs |
|------|---------------------------|
| 로컬 | `http://localhost:3000` (Next.js) 또는 `http://localhost:5173` (Vite) |
| Vercel Preview | `https://<branch>-<project>.vercel.app/**` |
| Production | `https://<your-domain>/**` |

새 환경 변수가 추가되면 이 문서와 `apps/web/.env.example`을 함께 갱신한다.
