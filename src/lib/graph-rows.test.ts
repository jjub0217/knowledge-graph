import { describe, it, expect } from 'vitest'
import { rowsToGraph } from './graph-rows'

describe('rowsToGraph', () => {
  it('DB 행(점·선)을 Graph 모양으로 합친다', () => {
    const nodeRows = [
      { id: 'n1', label: 'useState', topic: 'React' },
      { id: 'n2', label: 'TDD', topic: '테스트' },
    ]
    const edgeRows = [{ id: 'n1-n2', source: 'n1', target: 'n2' }]
    expect(rowsToGraph(nodeRows, edgeRows)).toEqual({
      nodes: [
        { id: 'n1', label: 'useState', topic: 'React' },
        { id: 'n2', label: 'TDD', topic: '테스트' },
      ],
      edges: [{ id: 'n1-n2', source: 'n1', target: 'n2' }],
    })
  })

  it('빈 행은 빈 그래프', () => {
    expect(rowsToGraph([], [])).toEqual({ nodes: [], edges: [] })
  })
})
