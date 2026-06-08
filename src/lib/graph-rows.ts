import type { Graph } from './types'

// DB 행 → 그래프 (화면이 쓰는 모양으로). 저장 방향은 RPC가 처리하므로 불필요.
export function rowsToGraph(
  nodeRows: { id: string; label: string; topic: string }[],
  edgeRows: { id: string; source: string; target: string }[]
): Graph {
  return {
    nodes: nodeRows.map((row) => ({ id: row.id, label: row.label, topic: row.topic })),
    edges: edgeRows.map((row) => ({ id: row.id, source: row.source, target: row.target })),
  }
}
