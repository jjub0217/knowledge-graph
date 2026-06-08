import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveGraph, loadGraph, exportJSON, importJSON } from './storage'
// import type { Graph } from './types'
import { EXAMPLE_GRAPH } from './example-graph'

// 테스트마다 쓸 견본 그래프 (점 1개, 연결선 0개)
// const sample: Graph = { nodes: [{ id: 'a', label: 'A', topic: 'React' }], edges: [] }

//  storage.test.ts에 옛 테스트 블록 describe('storage')(9~33행)가 그대로 남아 있어요. 이 옛 테스트는:
//   saveGraph(sample)   // ← 이제 async + isLoggedIn() 호출
//   인데, 이 블록은 getSession 가짜를 세팅 안 해요(옛 localStorage 테스트라).
// describe('storage', () => {
//   // [beforeEach] 각 it 이 실행되기 "전에" 매번 돌아간다 → localStorage를 비워 테스트끼리 안 섞이게
//   beforeEach(() => localStorage.clear())

//   it('저장하면 그대로 복원된다', () => {
//     saveGraph(sample)
//     expect(loadGraph()).toEqual(sample)
//   })

//   it('저장 전엔 빈 그래프', () => {
//     expect(loadGraph()).toEqual({ nodes: [], edges: [] })
//   })

//   it('export → import 왕복', () => {
//     expect(importJSON(exportJSON(sample))).toEqual(sample)
//   })

//   it('저장 전엔 hasStoredGraph가 false', () => {
//     expect(hasStoredGraph()).toBe(false)
//   })
//   it('저장 후엔 hasStoredGraph가 true', () => {
//     saveGraph(sample)
//     expect(hasStoredGraph()).toBe(true)
//   })
// })

// supabase 클라이언트 mock: getSession이 돌려줄 값을 테스트마다 바꾼다.
const getSession = vi.fn()
vi.mock('./supabase/client', () => ({
  createClient: () => ({ auth: { getSession } }),
}))

// 리셋·가짜fetch 세팅은 loadGraph 테스트뿐 아니라 saveGraph 테스트에도 똑같이 필요해요(둘 다 getSession·fetch를 씀).
// 그래서 두 describe 모두에 적용되게 최상위에 둔 거예요.
beforeEach(() => {
  getSession.mockReset()
  vi.stubGlobal('fetch', vi.fn())
})

describe('loadGraph', () => {
  it('비로그인이면 예시 그래프를 돌려준다(서버 호출 없음)', async () => {
    getSession.mockResolvedValue({ data: { session: null } })
    const graph = await loadGraph()
    expect(graph).toEqual(EXAMPLE_GRAPH)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('로그인이면 /api/graph에서 불러온다', async () => {
    getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
    const server = { nodes: [], edges: [] }
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => server })
    const graph = await loadGraph()
    expect(fetch).toHaveBeenCalledWith('/api/graph')
    expect(graph).toEqual(server)
  })
})
describe('saveGraph', () => {
  it('비로그인이면 저장하지 않는다(no-op)', async () => {
    getSession.mockResolvedValue({ data: { session: null } })
    await saveGraph({ nodes: [], edges: [] })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('로그인이면 PUT으로 저장한다', async () => {
    getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    await saveGraph({ nodes: [], edges: [] })
    expect(fetch).toHaveBeenCalledWith('/api/graph', expect.objectContaining({ method: 'PUT' }))
  })
})

describe('exportJSON/importJSON', () => {
  it('export → import 왕복', () => {
    const sample = { nodes: [{ id: 'a', label: 'A', topic: 'React' }], edges: [] }
    expect(importJSON(exportJSON(sample))).toEqual(sample)
  })
})
