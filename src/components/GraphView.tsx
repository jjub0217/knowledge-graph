'use client'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { useGraph } from '@/lib/graph-store'
import { isIsolated } from '@/lib/graph-ops'
import type { GraphNode, GraphEdge } from '@/lib/types'

// react-force-graph-2d는 브라우저 전용(canvas) → 서버 렌더 끄고(ssr:false) 동적 import
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

// 주제(topic)별 색: 글자 코드 합을 색 개수로 나눈 나머지 → 같은 주제는 늘 같은 색
const COLORS = ['#4f46e5', '#16a34a', '#dc2626', '#d97706', '#0891b2', '#9333ea']
const colorOf = (topic: string) => COLORS[[...topic].reduce((sum, char) => sum + char.charCodeAt(0), 0) % COLORS.length]

export function GraphView({
  nodes,
  edges,
  allEdges,
}: {
  nodes: GraphNode[] // 거른 점(보일 점)
  edges: GraphEdge[] // 거른 선(보일 선)
  allEdges: GraphEdge[] // 전체 선 — 고립·약연결 판정용(필터와 무관한 진짜 연결 수
}) {
  // const nodes = useGraph((state) => state.nodes)
  // const edges = useGraph((state) => state.edges)
  const addEdge = useGraph((state) => state.addEdge)
  const removeEdge = useGraph((state) => state.removeEdge)

  const [pending, setPending] = useState<string | null>(null) // 연결 시작점(첫 클릭한 점)

  const data = useMemo(
    () => ({
      // weak = 연결이 없거나(고립) 적은(약연결) 점: degree(연결 수) ≤ 1
      // 전체 선(allEdges)으로 판정 → 필터로 선이 숨어도 가짜 고립이 안 생김
      nodes: nodes.map((node) => ({
        id: node.id,
        label: node.label,
        topic: node.topic,
        weak: isIsolated(allEdges, node.id),
      })),
      links: edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target })),
    }),
    [nodes, edges, allEdges]
  )

  function onNodeClick(node: any) {
    if (!pending)
      setPending(node.id) // 첫 클릭 = 시작점 지정
    else {
      addEdge(pending, node.id) // 두 번째 클릭 = 두 점 연결
      setPending(null)
    }
  }

  function drawNode(node: any, ctx: CanvasRenderingContext2D, globalScale: number) {
    const fontSize = 12 / globalScale
    ctx.font = `${fontSize}px Sans-Serif`
    ctx.fillStyle = '#e5e7eb'
    ctx.fillText(node.label, node.x + 6, node.y)
  }
  return (
    <ForceGraph2D
      graphData={data}
      nodeColor={(node: any) => (node.isolated ? '#9ca3af' : colorOf(node.topic))} // 고립·약연결 = 회색 강조
      nodeVal={(node: any) => (node.isolated ? 6 : 4)} // + 크게
      onNodeClick={onNodeClick}
      linkColor={() => '#ffffff'}
      linkWidth={2}
      // 점은 라이브러리가 그리고('after'), 우리는 라벨만 덧그림
      nodeCanvasObjectMode={() => 'after'}
      nodeCanvasObject={drawNode}
      onLinkClick={(link: any) => removeEdge(link.id)} // 선 클릭 = 삭제
    />
  )
}
