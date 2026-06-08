import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // 세션을 한 번 읽어 토큰 갱신(쿠키 재설정)
  await supabase.auth.getUser()
  return response
}

export const config = {
  // api 라우트는 제외 — 라우트가 스스로 인증하므로 중복 세션 확인을 피함(코드리뷰 반영).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
