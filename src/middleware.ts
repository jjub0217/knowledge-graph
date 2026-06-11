// [내장 고정값] NextRequest/NextResponse — 미들웨어가 다루는 "들어온 요청 / 내보낼 응답" 객체.
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// [내장 고정값] middleware — 이 이름으로 export하면, 페이지에 닿기 전 "모든 요청"이 여길 먼저 거친다.
// 역할: 로그인 토큰이 만료 직전이면 조용히 새로 고쳐 쿠키에 다시 심어준다(로그인 풀림 방지).
export async function middleware(request: NextRequest) {
  // 일단 "그대로 통과시키는" 기본 응답을 만들어 둔다. (아래서 쿠키가 바뀌면 다시 만든다.)
  let response = NextResponse.next({ request })

  // 여기선 server.ts의 createClient를 안 쓰고 직접 만든다 — 미들웨어는 쿠키를
  // "요청에서 읽고 + 응답에 다시 심는" 양쪽을 동시에 해야 하기 때문.
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      // 읽기: 들어온 요청의 쿠키들을 supabase에 보여준다.
      getAll() {
        return request.cookies.getAll()
      },
      // 쓰기: supabase가 갱신한 쿠키를 (1)요청 쪽과 (2)내보낼 응답 쪽 둘 다에 심는다.
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // 세션을 한 번 읽어 토큰 갱신(쿠키 재설정)
  // 세션을 한 번 읽는 행위 자체가 "토큰 만료 임박이면 갱신"을 작동시킨다. (값은 안 써도 됨)
  await supabase.auth.getUser()
  return response
}

export const config = {
  // api 라우트는 제외 — 라우트가 스스로 인증하므로 중복 세션 확인을 피함(코드리뷰 반영).
  // [내장 고정값] matcher — 이 미들웨어를 "어떤 주소에만" 적용할지 거르는 규칙.
  // 정적 파일(_next/...)·파비콘과 api 라우트는 제외. api는 라우트가 스스로 인증하므로
  // 여기서 또 세션을 확인하면 중복 → 빼서 낭비를 막는다(코드리뷰 반영).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
