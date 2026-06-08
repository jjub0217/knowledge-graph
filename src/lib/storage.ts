import type { Graph } from './types'
import { createClient } from './supabase/client'
import { EXAMPLE_GRAPH } from './example-graph'
// const KEY = 'knowledge-graph' // localStorage에 저장할 때 쓸 칸 이름
// const EMPTY: Graph = { nodes: [], edges: [] } // 저장된 게 없을 때 돌려줄 빈 그래프

// 그래프를 localStorage에 저장 (객체 → 글자로 바꿔서)
// export function saveGraph(graph: Graph): void {
//   //  getItem('이름') = 그 칸에서 꺼냄. 글자(문자열)만 저장됨.
//   //  setItem(키, 값) = 그 이름 칸에 저장
//   // localStorage는 글자만 담으니, 객체(그래프)를 글자로 바꿔 저장(stringify)
//   localStorage.setItem(KEY, JSON.stringify(graph))
// }

// localStorage에서 그래프 불러오기 (없으면 빈 그래프)
// export function loadGraph(): Graph {
//   const raw = localStorage.getItem(KEY)
//   // localStorage는 글자만 담으니, 객체(그래프)를 글자로 바꿔 저장(stringify)
//   // 꺼낼 땐 글자를 객체로 되돌림(parse).
//   // JSON.parse는 뭐가 나올지 모르니 타입이 any인데, "이건 Graph야"라고 타입을 알려주는 표시(타입 단언). TS가 믿고 Graph로 취급.
//   // TypeScript 입장에선 JSON.parse(어떤글자)만 보이지, 그 글자 속을 미리 못 봅니다.
//   // 글자는 파일에서·네트워크에서·사용자가 붙여넣어서 올 수도 있고, 그 내용은 실행할 때 정해지니까요.
//   return raw ? (JSON.parse(raw) as Graph) : EMPTY
// }

// 그래프 → 보기 좋은 JSON 글자 (파일로 내보내기용)
// 내보내기용(exportJSON)은 사람이 파일을 열어볼 거라 예쁘게 정렬.
// export function exportJSON(graph: Graph): string {
//   // null, 2 => "보기 좋게 들여쓰기" 옵션. 2 = 2칸 들여쓰기.
//   return JSON.stringify(graph, null, 2)
// }

// JSON 글자 → 그래프 (파일에서 가져오기용)
// export function importJSON(json: string): Graph {
//   return JSON.parse(json) as Graph // 입구(바깥 데이터) — 호출하는 쪽에서 try/catch
// }

// 저장된 그래프가 한 번이라도 있었나? (키 존재 = 첫 방문 아님)
// 첫 방문(키 없음)과 "비우기 한 상태"(키 있고 빈 그래프)를 구분하는 데 씀.
// export function hasStoredGraph(): boolean {
//   return localStorage.getItem(KEY) !== null
// }

// 로그인 여부. 로컬 세션만 확인(네트워크 없음) — 진짜 검증은 서버 라우트가 getUser()로 한다.
async function isLoggedIn(): Promise<boolean> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return Boolean(session)
}

// 그래프 불러오기: 로그인 → 서버 / 비로그인 → 예시 고정값
export async function loadGraph(): Promise<Graph> {
  if (await isLoggedIn()) {
    const res = await fetch('/api/graph')
    if (!res.ok) throw new Error('그래프 불러오기 실패')
    return (await res.json()) as Graph
  }
  return EXAMPLE_GRAPH // 비로그인 = 예시 데모
}

// 그래프 저장: 로그인 → 서버 통째 저장 / 비로그인 → no-op
export async function saveGraph(graph: Graph): Promise<void> {
  if (!(await isLoggedIn())) return // 비로그인은 저장하지 않음
  const res = await fetch('/api/graph', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graph),
  })
  if (!res.ok) throw new Error('그래프 저장 실패')
}

// 그래프 → 보기 좋은 JSON (파일 내보내기용)
export function exportJSON(graph: Graph): string {
  return JSON.stringify(graph, null, 2)
}

// JSON → 그래프 (파일 가져오기용, 호출 쪽에서 try/catch)
export function importJSON(json: string): Graph {
  return JSON.parse(json) as Graph
}
