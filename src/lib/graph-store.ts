import { create } from 'zustand'
import type { GraphNode, GraphEdge } from './types'

// 스토어의 모양: 상태(nodes·edges) + 그걸 바꾸는 함수들(actions)
interface GraphState {
  nodes: GraphNode[]
  edges: GraphEdge[]
  addNode: (node: GraphNode) => void
  removeNode: (id: string) => void
  addEdge: (source: string, target: string) => void
  removeEdge: (id: string) => void
  setAll: (nodes: GraphNode[], edges: GraphEdge[]) => void
}

// 스토어를 만들어서 useGraph라는 훅으로 내보냅니다. 나중에 컴포넌트가 useGraph()로 꺼내 씀.
export const useGraph = create<GraphState>((set) => ({
  // set = 상태를 바꾸는 함수 (zustand가 넘겨줌).
  // set에 함수를 주면 현재 상태(state)를 받아 → 바뀔 부분만 돌려줍니다. zustand가 알아서 합쳐요.
  nodes: [],
  edges: [],

  // 점 추가 (같은 id가 이미 있으면 무시 = 중복 방지)
  addNode: (node) =>
    set((state) => {
      if (state.nodes.some((existing) => existing.id === node.id)) return state
      return { nodes: [...state.nodes, node] }
    }),

  // 점 삭제 + 그 점에 붙은 연결선도 함께 정리
  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
    })),

  // 연결선 추가 (자기 자신·중복은 무시)
  addEdge: (source, target) =>
    set((state) => {
      if (source === target) return state // 자기 자신과는 연결 안 함
      const exists = state.edges.some(
        (edge) => (edge.source === source && edge.target === target) || (edge.source === target && edge.target === source)
      )
      if (exists) return state // 이미 이어진 두 점(방향 무관)이면 무시
      return { edges: [...state.edges, { id: `${source}-${target}`, source, target }] }
    }),

  // 연결선 삭제 (id로)
  removeEdge: (id) => set((state) => ({ edges: state.edges.filter((edge) => edge.id !== id) })),

  // 전체 교체 (저장된 그래프 불러올 때 씀)
  setAll: (nodes, edges) => set({ nodes, edges }),
}))
