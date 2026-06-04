'use client'
import { useEffect, useState } from 'react'
import { InputPanel } from '@/components/InputPanel'
import type { Candidate } from '@/lib/types'
import { useGraph } from '@/lib/graph-store'
import { saveGraph, loadGraph } from '@/lib/storage'
import { CandidateReview } from '@/components/CandidateReview'
import { GraphView } from '@/components/GraphView'

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  // const nodes = useGraph((state) => state.nodes)
  const { nodes, edges, setAll } = useGraph()

  // 첫 로드: localStorage에 저장된 그래프 복원
  useEffect(() => {
    const saved = loadGraph()
    setAll(saved.nodes, saved.edges)
  }, [setAll])

  // 변경 시: localStorage에 저장
  useEffect(() => {
    saveGraph({ nodes, edges })
  }, [nodes, edges])

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
      {/* 5. 그래프 — 점 두 번 클릭=연결, 선 클릭=삭제 */}
      <div style={{ height: 300 }}>
        <GraphView />
      </div>
    </main>
  )
}
