'use client'
import { useState } from 'react'
import type { Candidate } from '@/lib/types'
import { useGraph } from '@/lib/graph-store'

export function CandidateReview({ candidates }: { candidates: Candidate[] }) {
  // 스토어에서 addNode 함수만 꺼냅니다.
  // 필요한 것만 구독하면, 다른 게 바뀌어도 불필요한 다시 그리기(리렌더)가 줄어요.
  // (zustand 권장 방식)
  const addNode = useGraph((state) => state.addNode) // 스토어에서 addNode 함수만 꺼냄

  // 현재 주제, 처음엔 '기타'
  const [selectedTopic, setSelectedTopic] = useState('')

  // accept = 채택 버튼이 부르는 함수.
  // 후보를 채택 → 그 후보를 점(노드)으로 스토어에 추가
  function accept(candidate: Candidate) {
    // addNode({ id, label, topic })로 스토어에 점 추가.
    // (id·label은 후보 텍스트, topic은 입력칸 값)
    addNode({ id: candidate.text, label: candidate.text, topic: selectedTopic.trim() || '기타' })
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm">
        <span className="block font-medium">주제 — 채택할 점에 붙일 그룹</span>
        <input
          className="ml-2 border px-2"
          value={selectedTopic}
          onChange={(event) => setSelectedTopic(event.target.value)}
          placeholder="예: React, CSS"
        />
      </label>
      <ul>
        {candidates.map((candidate) => (
          //  후보마다 <li>(텍스트 + "채택" 버튼) 한 줄씩
          <li key={candidate.text} className="flex gap-2">
            <span>{candidate.text}</span>
            <button className="text-blue-500" onClick={() => accept(candidate)}>
              채택
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
