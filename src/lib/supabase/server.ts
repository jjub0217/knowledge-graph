// createServerClient = "서버(라우트 핸들러)용" 연결 도구를 만드는 함수.
// 브라우저용과 달리, 요청에 딸려온 쿠키를 읽어 "이 요청을 보낸 사람이 누구냐"를 알아낸다.
import { createServerClient } from '@supabase/ssr'

// [내장 고정값] next/headers의 cookies() — 지금 들어온 요청의 쿠키 보관함을 꺼내는 Next 함수.
import { cookies } from 'next/headers'

// 서버(라우트 핸들러)에서 쓰는 연결 도구. 쿠키로 "이 사람 누구냐"를 읽는다.
// Next 16: cookies()는 async라 await 필요.
export async function createClient() {
  // 이번 요청의 쿠키 보관함을 꺼내 온다.
  const cookieStore = await cookies()

  // URL·키는 브라우저용과 같고, 추가로 "쿠키를 어떻게 읽고 쓸지"를 supabase에 알려준다.
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      // getAll = supabase가 "지금 쿠키들 좀 보여줘" 할 때 쓰는 통로 → 보관함 내용을 그대로 넘김.
      getAll() {
        return cookieStore.getAll()
      },
      // setAll = supabase가 "이 쿠키들로 갱신해줘"(예: 토큰 새로고침) 할 때 쓰는 통로.
      setAll(cookiesToSet) {
        // 서버 컴포넌트에서 부르면 막힐 수 있어 try로 감쌈(라우트 핸들러에선 정상).
        // 서버 컴포넌트에서 부르면 쿠키 쓰기가 막혀 에러가 날 수 있어 try로 감싼다.
        // (라우트 핸들러에서 부를 땐 정상 동작 → 그 경우만 실제로 써진다.)
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {}
      },
    },
  })
}
