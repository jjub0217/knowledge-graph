import { NextResponse } from 'next/server'
import { parseVelogUrl, fetchVelogMarkdown } from '@/lib/velog'

// 응답은 NextResponse 사용 — 이 라우트만 보면 표준 Response로도 충분하지만,
// Next.js 관례를 따르고 쿠키·리다이렉트 등 확장 여지를 남기려 NextResponse를 쓴다.
export async function POST(req: Request) {
  const { url } = await req.json() // 입구: 클라이언트가 보낸 본문에서 url 꺼냄
  const velogRef = parseVelogUrl(url ?? '')
  if (!velogRef) return NextResponse.json({ error: 'velog 주소가 아니에요' }, { status: 400 })
  try {
    const markdown = await fetchVelogMarkdown(velogRef)
    return NextResponse.json({ markdown })
  } catch {
    return NextResponse.json({ error: 'velog에서 글을 가져오지 못했어요' }, { status: 502 })
  }
}
