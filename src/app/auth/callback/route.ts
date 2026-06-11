import { NextResponse } from 'next/server'
// 1단계에서 만든 "서버용 연결 도구"를 가져온다. (@/ = src 폴더 기준 경로 별칭)
import { createClient } from '@/lib/supabase/server'

// [내장 고정값] 폴더 경로 = URL. 이 파일이 app/auth/callback/route.ts → 주소는 /auth/callback.
// GET이라는 이름으로 export하면 이 주소로 GET 요청이 올 때 실행된다.
// (AuthButton에서 redirectTo로 지정한 그 복귀 주소가 바로 여기다.)
export async function GET(request: Request) {
  // 들어온 요청 주소를 뜯어, 검색어(?code=...) 부분과 출처(origin: https://내사이트)를 꺼낸다.
  const { searchParams, origin } = new URL(request.url)

  // 구글이 붙여 보낸 "이 사람 맞다"는 일회용 증표.
  const code = searchParams.get('code')
  if (code) {
    // [라이브러리 기능] 코드를 supabase에 넘기면, 검증 후 "세션"을 발급해 쿠키에 심어준다.
    // 이 순간부터 이 브라우저는 "로그인된 상태"가 된다.
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code) // 코드 → 세션 쿠키
  }
  // 볼일 끝났으니 홈(origin)으로 돌려보낸다. 주소창의 지저분한 ?code=... 도 같이 사라진다.
  return NextResponse.redirect(origin) // 홈으로
}
