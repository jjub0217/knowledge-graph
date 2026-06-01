import { describe, it, expect } from 'vitest'
import { degree, isIsolated } from './graph-ops'
import type { GraphEdge } from './types'

// 견본 연결선: a-b, a-c (그래서 a는 2개, b·c는 1개씩, z는 0개)
// 선은 두 점을 잇죠(source, target). 점 'a'가 그 선에 **"걸려있다"**는 건 양 끝 중 어느 쪽이든 'a'면 성립합니다.
const edges: GraphEdge[] = [
  { id: 'e1', source: 'a', target: 'b' }, //  →  a ——— b
  { id: 'e2', source: 'a', target: 'c' }, //  →  a ——— c
]

describe('graph-ops', () => {
  it('degree = 연결 수', () => {
    // degree(edges, 점) = 그 점에 연결선이 몇 개 붙었나 (degree = 차수/연결 수)
    /** degree(edges, 'a')
                │       │
                │       └─ 'a' = "누구의 연결 수를 셀까?" → 세고 싶은 점의 id
                └───────── edges = "연결선 전체 목록" → 이 안을 뒤져서 셈 */
    // toBe =  숫자·불리언·문자열 같은 단순 값 비교. 정확히 같은가 (===)
    expect(degree(edges, 'a')).toBe(2) // a는 b·c 둘과 연결
    expect(degree(edges, 'b')).toBe(1) // b는 a 하나와만 => 양 끝(a,c)에 'b' 있나? → 아니오 ✗
  })
  it('isIsolated = 연결 0', () => {
    // isIsolated(edges, 점) = 그 점이 고립됐나(연결 0개?) → 회색·크게 강조할 점을 찾는 데 씀
    expect(isIsolated(edges, 'z')).toBe(true) // z는 어디에도 없음 → 고립
    expect(isIsolated(edges, 'a')).toBe(false) // a는 연결 있음 → 고립 아님
  })
})
