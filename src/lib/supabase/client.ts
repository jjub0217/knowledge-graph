// @supabase/ssr — Next.js처럼 "서버+브라우저 둘 다 도는" 앱에서 로그인 상태를 쿠키로 주고받게 해주는 supabase 공식 패키지 라이브러리 기능 .
// createBrowserClient = 그중 "브라우저(클라이언트 컴포넌트)용" 연결 도구를 만드는 함수.
import { createBrowserClient } from '@supabase/ssr'

// 브라우저(클라이언트 컴포넌트)에서 쓰는 supabase 연결 도구
// [내가 만든 임의 이름] createClient — 브라우저에서 supabase에 말 거는 "전화기"를 하나 만들어 돌려준다.
// 이걸 부르는 쪽(AuthButton 등)이 로그인·로그아웃·세션 조회에 쓴다.
export function createClient() {
  // 첫 인자 = supabase 프로젝트 주소(URL), 둘째 인자 = 공개 키(publishable key).
  // 둘 다 NEXT_PUBLIC_ 로 시작 → 브라우저에 노출돼도 되는 "공개" 값. (비밀 키 아님)
  // 끝의 ! = [표준 TS 기능] "이 환경변수는 절대 비어(undefined) 있지 않다"고 TS에 약속(non-null 단언).
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
}
