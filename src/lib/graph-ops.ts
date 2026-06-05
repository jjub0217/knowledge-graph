import type { GraphEdge, GraphNode, Graph } from './types'

// 점 하나에 붙은 연결선 개수 (= 연결 수)
export function degree(edges: GraphEdge[], nodeId: string): number {
  return edges.filter((edge) => edge.source === nodeId || edge.target === nodeId).length
}

// 고립됐나? = 연결 수가 0인가
export function isIsolated(edges: GraphEdge[], nodeId: string): boolean {
  return degree(edges, nodeId) === 0
}

// 주제를 중복 없이, 처음 나온 순서대로 모은다 (주제 필터 버튼 재료)
//  예: 점들의 topic이 ['React','React','CSS'] → 결과 ['React','CSS']
export function uniqueTopics(nodes: GraphNode[]): string[] {
  const topics: string[] = [] // 모은 주제를 담을 빈 통 (처음 나온 순서 유지)

  for (const node of nodes) {
    // 아직 통에 없는 주제면 추가 (이미 있으면 건너뜀 → 중복 제거)
    if (!topics.includes(node.topic)) topics.push(node.topic)
  }
  return topics
}

// 검색어·켜진 주제로 점을 거르고, 양 끝 점이 둘 다 남은 선만 남긴다
//  query        : 라벨에 포함되면 통과(대소문자 무시)
//  activeTopics : 비어 있으면 전체, 아니면 그 주제에 속한 점만
export function filterGraph(graph: Graph, query: string, activeTopics: string[]): Graph {
  // 검색어를 미리 소문자로 (점 라벨도 소문자로 맞춰 비교 → 대소문자 무시)
  const lowerQuery = query.toLowerCase()

  // 1) 보일 점 거르기: 두 조건을 동시에(&&) 만족하는 점만
  const nodes = graph.nodes.filter(
    // 조건 A: 라벨에 검색어가 들어 있나 (빈 검색어 ''는 모두 포함 → 통과)
    // 조건 B: 켜진 주제가 없으면(=전체) 통과, 있으면 그 주제에 속할 때만 통과
    (node) => node.label.toLowerCase().includes(lowerQuery) && (activeTopics.length === 0 || activeTopics.includes(node.topic))
  )

  // 2) 살아남은 점들의 id 목록 (선을 거를 때 "이 점 보이나?" 확인용)
  const visibleIds = nodes.map((node) => node.id)

  // 3) 보일 선 거르기: 양 끝(source·target)이 둘 다 보이는 점일 때만 남김
  //    (한쪽 점이 숨으면 그 선도 숨김)
  const edges = graph.edges.filter((edge) => visibleIds.includes(edge.source) && visibleIds.includes(edge.target))
  // 거른 점·선을 묶어서 돌려줌 (Graph 모양 = { nodes, edges })
  return { nodes, edges }
}
