import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 서버(라우트 핸들러)에서 쓰는 연결 도구. 쿠키로 "이 사람 누구냐"를 읽는다.
// Next 16: cookies()는 async라 await 필요.
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        // 서버 컴포넌트에서 부르면 막힐 수 있어 try로 감쌈(라우트 핸들러에선 정상).
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {}
      },
    },
  })
}
