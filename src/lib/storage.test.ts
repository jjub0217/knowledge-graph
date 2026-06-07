import { describe, it, expect, beforeEach } from 'vitest'
import { saveGraph, loadGraph, exportJSON, importJSON, hasStoredGraph } from './storage'
import type { Graph } from './types'

// 테스트마다 쓸 견본 그래프 (점 1개, 연결선 0개)
const sample: Graph = { nodes: [{ id: 'a', label: 'A', topic: 'React' }], edges: [] }

describe('storage', () => {
  // [beforeEach] 각 it 이 실행되기 "전에" 매번 돌아간다 → localStorage를 비워 테스트끼리 안 섞이게
  beforeEach(() => localStorage.clear())

  it('저장하면 그대로 복원된다', () => {
    saveGraph(sample)
    expect(loadGraph()).toEqual(sample)
  })

  it('저장 전엔 빈 그래프', () => {
    expect(loadGraph()).toEqual({ nodes: [], edges: [] })
  })

  it('export → import 왕복', () => {
    expect(importJSON(exportJSON(sample))).toEqual(sample)
  })

  it('저장 전엔 hasStoredGraph가 false', () => {
    expect(hasStoredGraph()).toBe(false)
  })
  it('저장 후엔 hasStoredGraph가 true', () => {
    saveGraph(sample)
    expect(hasStoredGraph()).toBe(true)
  })
})
