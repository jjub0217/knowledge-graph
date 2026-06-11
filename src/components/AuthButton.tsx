// [내장 고정값] 'use client' — 이 컴포넌트는 브라우저에서 돈다는 표시.
// 클릭 이벤트·useState·useEffect 같은 "브라우저 기능"을 쓰려면 반드시 필요.
'use client'
import { useEffect, useState } from 'react'

// 1단계의 "브라우저용 연결 도구".
import { createClient } from '@/lib/supabase/client'

export function AuthButton() {
  // 브라우저용 supabase 전화기 하나 준비.
  const supabase = createClient()

  // [내가 만든 임의 이름] email — 로그인한 사람의 이메일. null이면 "로그인 안 됨"으로 본다.
  const [email, setEmail] = useState<string | null>(null)

  // [표준 React 기능] useEffect(..., []) — 빈 배열이라 "이 컴포넌트가 처음 화면에 뜰 때 딱 한 번" 실행.
  useEffect(() => {
    // (1) 지금 이미 로그인돼 있나? 현재 사용자를 물어보고, 있으면 이메일을 화면 상태에 넣는다.
    //     ?? null = 값이 없으면(undefined) null로 (옵셔널 체이닝 + 널 병합).
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))

    // (2) 앞으로의 변화도 구독한다 — 로그인/로그아웃이 일어나면 콜백이 불려 이메일을 다시 맞춘다.
    //     4번 callback에서 세션이 생기는 순간, 바로 이 구독이 감지해 화면이 자동 갱신된다.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })

    // [중요] 컴포넌트가 사라질 때 구독을 끊는다(정리 함수). 안 끊으면 메모리 누수·중복 호출.
    return () => sub.subscription.unsubscribe()
    // 아래 줄: supabase를 의존성 배열에 안 넣어서 나는 경고를 끈다. 매 렌더마다 새로 만들어져
    // 무한 루프가 될 수 있어 "처음 한 번만" 의도가 맞기 때문(의도적 예외).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // [내가 만든 임의 이름] login — 어느 제공자(google/kakao)로 로그인할지 받아 OAuth를 시작한다.
  async function login(provider: 'google' | 'kakao') {
    await supabase.auth.signInWithOAuth({
      provider,
      // 로그인 끝나고 구글이 우리를 어디로 돌려보낼지 = 4번에서 만든 /auth/callback.
      // location.origin = 지금 사이트 주소(로컬이면 localhost, 운영이면 vercel 주소)라 양쪽 다 맞음.
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  // 로그아웃 — 세션 쿠키를 지운다. 그러면 위 onAuthStateChange가 감지해 email이 null로 바뀐다.
  async function logout() {
    await supabase.auth.signOut()
  }

  // 로그인된 경우: 이메일 + 로그아웃 버튼을 보여준다.
  if (email) {
    return (
      <span className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">{email}</span>
        <button className="border px-2" onClick={logout}>
          로그아웃
        </button>
      </span>
    )
  }
  // 로그인 안 된 경우: 제공자별 로그인 버튼을 보여준다.
  return (
    <span className="flex items-center gap-2">
      <button className="border px-2" onClick={() => login('google')}>
        Google 로그인
      </button>
      <button className="border px-2" onClick={() => login('kakao')}>
        Kakao 로그인
      </button>
    </span>
  )
}
