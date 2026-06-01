import type { GraphEdge } from './types'

// 점 하나에 붙은 연결선 개수 (= 연결 수)
export function degree(edges: GraphEdge[], nodeId: string): number {
  return edges.filter((edge) => edge.source === nodeId || edge.target === nodeId).length
}

// 고립됐나? = 연결 수가 0인가
export function isIsolated(edges: GraphEdge[], nodeId: string): boolean {
  return degree(edges, nodeId) === 0
}
