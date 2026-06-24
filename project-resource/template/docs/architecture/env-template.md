# 환경 변수 템플릿

> 실제 값은 **Vercel Environment Variables** 또는 로컬 `apps/web/.env.local`에만 둔다. 리포에 커밋하지 않는다.

## 원칙

- **필수 env는 2개뿐**: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`
- **Publishable(anon) 키는 사용하지 않는다** — 브라우저·`NEXT_PUBLIC_*`에 넣지 않음
- Supabase 호출은 Next.js **서버**(Route Handlers, Server Actions, Server Components)에서만 수행

## Supabase (서버 전용)

| 변수 | 설명 | 노출 |
|------|------|------|
| `SUPABASE_URL` | Supabase 프로젝트 URL | **서버 전용** |
| `SUPABASE_SECRET_KEY` | Secret API 키 (Dashboard → API Keys) | **서버 전용** |

Vercel에 등록할 때 **Environment Variables**에서 Production / Preview / Development를 구분해 넣는다. 두 변수 모두 **Server** 범주로만 추가하고, 클라이언트 노출 옵션은 켜지 않는다.

## `.env.local` 예시

`apps/web/.env.example`:

```env
SUPABASE_URL=
SUPABASE_SECRET_KEY=
```

로컬:

```bash
cp apps/web/.env.example apps/web/.env.local
```

## Supabase Auth 콜백 (Auth 사용 시)

Supabase Dashboard → Authentication → URL Configuration:

| 환경 | Redirect URLs |
|------|----------------|
| 로컬 | `http://localhost:3000/**` |
| Vercel Preview | `https://<branch>-<project>.vercel.app/**` |
| Production | `https://<your-domain>/**` |

Auth 플로우도 Route Handler·Server Action으로 처리하고, Secret key는 서버 env에만 둔다.

## Vercel CLI로 env 동기화

```bash
cd apps/web
vercel link
vercel env pull .env.local
```

새 변수가 필요해지면 **서버 전용인지** 먼저 검토하고, 이 문서와 `.env.example`을 함께 갱신한다.
