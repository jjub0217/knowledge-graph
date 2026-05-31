export interface Candidate {
  text: string
  source: 'heading' | 'code' | 'bold'
}

export interface GraphNode {
  id: string
  label: string
  topic: string
}

export interface GraphEdge {
  id: string
  source: string
  target: string
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
