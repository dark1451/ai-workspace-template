import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/env";

/**
 * 서버 전용 Supabase 클라이언트.
 * Route Handlers·Server Actions·Server Components에서만 import한다.
 * 브라우저·클라이언트 컴포넌트에서는 사용하지 않는다.
 */
export function createServerSupabaseClient() {
  const { url, secretKey } = getSupabaseEnv();

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
