export interface VelogRef {
  username: string
  urlSlug: string
}

// velog 글 주소를 받아 두 조각을 뽑습니다
export function parseVelogUrl(url: string): VelogRef | null {
  const match = url.match(/velog\.io\/@([^/]+)\/([^/?#]+)/)
  if (!match) return null
  //  주소 속 한글·특수문자는 %ED%97%...처럼 인코딩돼 있어요. 이걸 원래 글자로 되돌립니다. (velog 글 제목이 한글이면 slug도 인코딩됨)
  return { username: match[1], urlSlug: decodeURIComponent(match[2]) }
}

// async = "기다리는 함수", await = "올 때까지 기다림".

export async function fetchVelogMarkdown(velogRef: VelogRef): Promise<string> {
  const res = await fetch('https://v2.velog.io/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      //  velog 서버에 "username·url_slug가 이거인 글의 body(본문)를 줘" 라고 묻는 문장.
      query: 'query($username:String,$urlSlug:String){post(username:$username,url_slug:$urlSlug){body}}',
      variables: { username: velogRef.username, urlSlug: velogRef.urlSlug },
    }),
  })
  const json = await res.json()
  const body = json?.data?.post?.body
  if (typeof body !== 'string') throw new Error('velog 본문을 찾지 못함')
  return body
}
