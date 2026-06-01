'use client'
import { useState } from 'react'
import { extractCandidates } from '@/lib/extractor'
import type { Candidate } from '@/lib/types'

export function InputPanel({ onCandidates }: { onCandidates: (candidates: Candidate[]) => void }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  // .md 파일을 올리면 → 텍스트로 읽어 → 후보 추출
  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const candidates = extractCandidates(text)
    if (candidates.length === 0) setError('뽑을 개념이 없어요')
    onCandidates(candidates)
  }

  // velog 주소로 → 서버 라우트에 본문 요청 → 후보 추출
  async function handleVelog() {
    setError('')
    const res = await fetch('/api/velog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    if (!res.ok) {
      setError('velog를 가져오지 못했어요 (마크다운을 직접 붙여넣어 보세요)')
      return
    }
    const { markdown } = await res.json()
    onCandidates(extractCandidates(markdown))
  }

  return (
    <div className="space-y-2">
      <input type="file" accept=".md" onChange={handleFile} />
      <div className="flex gap-2">
        <input className="border px-2" placeholder="velog 글 주소" value={url} onChange={(event) => setUrl(event.target.value)} />
        <button className="border px-2" onClick={handleVelog}>
          가져오기
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
