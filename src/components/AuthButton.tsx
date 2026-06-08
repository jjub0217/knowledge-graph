'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AuthButton() {
  const supabase = createClient()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    // 현재 로그인 상태 + 변화 구독
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => sub.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(provider: 'google' | 'kakao') {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  async function logout() {
    await supabase.auth.signOut()
  }

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
