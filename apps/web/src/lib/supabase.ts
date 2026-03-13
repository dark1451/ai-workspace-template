import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY 환경 변수가 필요합니다. " +
      "apps/web/.env.example을 참고해 .env를 설정하세요.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
