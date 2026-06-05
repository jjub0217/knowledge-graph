'use client'
import { useEffect, useMemo, useState } from 'react'
import { InputPanel } from '@/components/InputPanel'
import type { Candidate } from '@/lib/types'
import { useGraph } from '@/lib/graph-store'
import { filterGraph, uniqueTopics } from '@/lib/graph-ops'
import { saveGraph, loadGraph } from '@/lib/storage'
import { CandidateReview } from '@/components/CandidateReview'
import { GraphView } from '@/components/GraphView'
import { SearchFilter } from '@/components/SearchFilter'
import { Controls } from '@/components/Controls'

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  // const nodes = useGraph((state) => state.nodes)
  const { nodes, edges, setAll } = useGraph()

  // 필터 상태: 검색어 + 켜진 주제 집합(비어있으면 = 전체 표시)
  const [query, setQuery] = useState('')
  const [activeTopics, setActiveTopics] = useState<string[]>([])

  // 보일 점: 라벨에 검색어 포함(대소문자 무시) + 주제가 켜져 있음(빈 active = 전체)
  // const visibleNodes = useMemo(
  //   () =>
  //     nodes.filter(
  //       (node) =>
  //         node.label.toLowerCase().includes(query.toLowerCase()) &&
  //         (activeTopics.length === 0 || activeTopics.includes(node.topic))
  //     ),
  //   [nodes, query, activeTopics]
  // )

  // // 보일 선: 양끝 점이 둘 다 보일 때만
  // const visibleEdges = useMemo(() => {
  //   const visibleIds = visibleNodes.map((node) => node.id)
  //   return edges.filter((edge) => visibleIds.includes(edge.source) && visibleIds.includes(edge.target))
  // }, [edges, visibleNodes])
  const visible = useMemo(() => filterGraph({ nodes, edges }, query, activeTopics), [nodes, edges, query, activeTopics])

  // // 주제 목록(중복 제거) — 토글 버튼 만들 재료
  // const topics = useMemo(() => {
  //   const unique: string[] = []
  //   for (const node of nodes) {
  //     if (!unique.includes(node.topic)) unique.push(node.topic)
  //   }
  //   return unique
  // }, [nodes])
  const topics = useMemo(() => uniqueTopics(nodes), [nodes])

  function toggleTopic(topic: string) {
    setActiveTopics(
      (prev) =>
        prev.includes(topic)
          ? prev.filter((active) => active !== topic) // 이미 켜져 있으면 끔(제거)
          : [...prev, topic] // 꺼져 있으면 켬(추가)
    )
  }

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
      {/* 0. 페이지 컨트롤: 내보내기/가져오기 + 점 삭제 */}
      <Controls />

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
      {/* <ul className="text-sm">
        {candidates.map((candidate) => (
          <li key={candidate.text}>
            {candidate.text} <span className="text-gray-400">({candidate.source})</span>
          </li>
        ))}
      </ul> */}

      {/* 4. 검색 + 주제 필터 */}
      <SearchFilter query={query} onQuery={setQuery} topics={topics} active={activeTopics} onToggle={toggleTopic} />

      {/* 5. 그래프 — 점 두 번 클릭=연결, 선 클릭=삭제 */}
      {/* 5. 그래프 — 거른 점·선을 넘기고, 고립 판정용 전체 선(allEdges)도 함께 */}
      <div style={{ height: 300 }}>
        {/* <GraphView nodes={거른점} edges={거른선} /> */}
        <GraphView nodes={visible.nodes} edges={visible.edges} allEdges={edges} />
      </div>
    </main>
  )
}
