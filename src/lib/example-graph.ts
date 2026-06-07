import type { Graph } from './types'

// 첫 방문자에게 보여줄 예시 지식 그래프.
// React(허브 useEffect 포함)·테스트 묶음은 연결돼 주제색으로, flexbox는 고립이라 회색·크게 보인다.
export const EXAMPLE_GRAPH: Graph = {
  nodes: [
    { id: 'useState', label: 'useState', topic: 'React' },
    { id: 'useEffect', label: 'useEffect', topic: 'React' },
    { id: 'props', label: 'props', topic: 'React' },
    { id: 'TDD', label: 'TDD', topic: '테스트' },
    { id: 'RTL', label: 'RTL', topic: '테스트' },
    { id: 'flexbox', label: 'flexbox', topic: 'CSS' }, // 고립 — 강조 데모
  ],
  edges: [
    { id: 'useState-useEffect', source: 'useState', target: 'useEffect' },
    { id: 'useEffect-props', source: 'useEffect', target: 'props' },
    { id: 'TDD-RTL', source: 'TDD', target: 'RTL' },
  ],
}
