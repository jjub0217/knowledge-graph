'use client'
import { useState } from 'react'
import { InputPanel } from '@/components/InputPanel'
import type { Candidate } from '@/lib/types'

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([])

  return (
    <main className="space-y-4 p-4">
      <InputPanel onCandidates={setCandidates} />

      {/* 추출된 후보를 화면에 나열 — InputPanel이 잘 작동하는지 눈으로 확인용 */}
      <ul className="text-sm">
        {candidates.map((candidate) => (
          <li key={candidate.text}>
            {candidate.text} <span className="text-gray-400">({candidate.source})</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
