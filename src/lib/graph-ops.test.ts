import { describe, it, expect } from 'vitest'
import { degree, isIsolated, uniqueTopics, filterGraph } from './graph-ops'
import type { Graph, GraphEdge, GraphNode } from './types'

const sampleNodes: GraphNode[] = [
  { id: 'useEffect', label: 'useEffect', topic: 'React' },
  { id: 'useState', label: 'useState', topic: 'React' },
  { id: 'flexbox', label: 'flexbox', topic: 'CSS' },
]

// 견본 연결선: useEffect-useState, useEffect-flexbox (그래서 useEffect 2개, useState·flexbox는 1개씩, z는 0개)
// 선은 두 점을 잇죠(source, target). 점 'useEffect'가 그 선에 **"걸려있다"**는 건 양 끝 중 어느 쪽이든 'useEffect'면 성립합니다.
const edges: GraphEdge[] = [
  { id: 'e1', source: 'useEffect', target: 'useState' }, //  →  useEffect ——— useState (React — React)
  { id: 'e2', source: 'useEffect', target: 'flexbox' }, //  →  useEffect ——— flexbox (React — CSS)
]

const sampleGraph: Graph = { nodes: sampleNodes, edges: edges }

describe('graph-ops', () => {
  it('degree = 연결 수', () => {
    // degree(edges, 점) = 그 점에 연결선이 몇 개 붙었나 (degree = 차수/연결 수)
    /** degree(edges, 'useEffect')
                │       │
                │       └─ 'useEffect' = "누구의 연결 수를 셀까?" → 세고 싶은 점의 id
                └───────── edges = "연결선 전체 목록" → 이 안을 뒤져서 셈 */
    // toBe =  숫자·불리언·문자열 같은 단순 값 비교. 정확히 같은가 (===)
    expect(degree(edges, 'useEffect')).toBe(2) // useEffect는 useState·flexbox 둘과 연결
    expect(degree(edges, 'useState')).toBe(1) // useState는 useEffect 하나와만 => 양 끝(useEffect,flexbox)에 'useState' 있나? → 아니오 ✗
  })
  it('isIsolated = 연결 0', () => {
    // isIsolated(edges, 점) = 그 점이 고립됐나(연결 0개?) → 회색·크게 강조할 점을 찾는 데 씀
    expect(isIsolated(edges, 'z')).toBe(true) // z는 어디에도 없음 → 고립
    expect(isIsolated(edges, 'useEffect')).toBe(false) // useEffect는 연결 있음 → 고립 아님
  })
})

describe('uniqueTopics', () => {
  it('주제를 중복 없이, 처음 나온 순서대로 모은다', () => {
    expect(uniqueTopics(sampleNodes)).toEqual(['React', 'CSS'])
  })
  it('점이 없으면 빈 배열', () => {
    expect(uniqueTopics([])).toEqual([])
  })
})

describe('filterGraph', () => {
  it('검색어가 비고 켜진 주제도 없으면 전체를 그대로 돌려준다', () => {
    expect(filterGraph(sampleGraph, '', [])).toEqual(sampleGraph)
  })
  it('검색어가 라벨에 든 점만 남긴다(대소문자 무시)', () => {
    const result = filterGraph(sampleGraph, 'USE', [])
    expect(result.nodes.map((node) => node.id)).toEqual(['useEffect', 'useState'])
  })
  it('켜진 주제에 속하는 점만 남긴다', () => {
    const result = filterGraph(sampleGraph, '', ['CSS'])
    expect(result.nodes.map((node) => node.id)).toEqual(['flexbox'])
  })
  it('선은 양 끝 점이 둘 다 남을 때만 살린다', () => {
    // 'use' 검색 → useEffect·useState만 보임 → e1(둘 다 보임)만 살고, e2(flexbox 숨음)는 빠짐
    const result = filterGraph(sampleGraph, 'use', [])
    expect(result.edges.map((edge) => edge.id)).toEqual(['e1'])
  })
})
