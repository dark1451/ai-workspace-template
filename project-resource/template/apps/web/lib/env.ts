import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} 환경 변수가 필요합니다. docs/architecture/env-template.md 참조.`);
  }
  return value;
}

/** Supabase 서버 전용 env. 클라이언트 번들·NEXT_PUBLIC_ 에 넣지 않는다. */
export function getSupabaseEnv() {
  return {
    url: required("SUPABASE_URL"),
    secretKey: required("SUPABASE_SECRET_KEY"),
  };
}
