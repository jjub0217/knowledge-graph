'use client'
import { useState } from 'react'
import { InputPanel } from '@/components/InputPanel'
import type { Candidate } from '@/lib/types'
import { useGraph } from '@/lib/graph-store'
import { CandidateReview } from '@/components/CandidateReview'

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const nodes = useGraph((state) => state.nodes)

  return (
    <main className="space-y-4 p-4">
      {/* 1. 입력 → 후보 추출 */}
      <InputPanel onCandidates={setCandidates} />

      {/* 2. 후보 채택 → 점 확정 */}
      <CandidateReview candidates={candidates} />
      {/* 3. 확정된 점 목록 — 채택하면 여기 실시간으로 늘어남 (nodes 사용) */}
      <div className="text-sm">
        <p className="font-bold">확정된 점 ({nodes.length}개)</p>
        <ul>
          {nodes.map((node) => (
            <li key={node.id}>
              {node.label} <span className="text-gray-400">[{node.topic}]</span>
            </li>
          ))}
        </ul>
      </div>
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
