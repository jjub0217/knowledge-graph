// 브라우저가 부르면 세션으로 "누구냐" 확인하고, 그 사람 그래프를 조회(GET)/저장(PUT)합니다.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rowsToGraph } from '@/lib/graph-rows'
import type { Graph } from '@/lib/types'

// ── 내 그래프 불러오기 ──
// 폴더가 app/api/graph → 주소는 /api/graph. GET이라는 이름이라 GET 요청이 오면 실행.
export async function GET() {
  const supabase = await createClient()

  // 쿠키 세션으로 "지금 요청한 사람"을 알아낸다. getUser()는 서버에서 토큰을 검증하는 진짜 확인.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 로그인 안 됐으면 401(권한 없음)로 막는다. (남의 그래프 조회 차단)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // RLS가 자기 행만 보이게 하지만, 명시적으로 컬럼만 고른다.
  // const { data: nodeRows } = await supabase.from('nodes').select('id,label,topic')
  // const { data: edgeRows } = await supabase.from('edges').select('id,source,target')

  // [RLS = Row Level Security] DB가 "각 사용자는 자기 user_id 행만 볼 수 있다"를 강제하는 규칙.
  // 그래서 따로 WHERE user_id=나 를 안 써도 자동으로 내 행만 온다(보안을 DB가 책임짐).
  // RLS가 자기 행만 보이게 하지만, 명시적으로 컬럼만 고른다.
  // 두 조회를 병렬로(순차면 지연 2배). RLS가 자기 행만 보이게 한다.
  const [nodesResult, edgesResult] = await Promise.all([
    supabase.from('nodes').select('id,label,topic'),
    supabase.from('edges').select('id,source,target'),
  ])

  // 조회 에러(DB 장애·RLS 등)를 빈 그래프로 숨기지 않고 500으로 알린다.
  // (에러를 []로 삼키면 "내 데이터가 사라진 것처럼" 보여 더 위험 → 코드리뷰 반영.)
  if (nodesResult.error || edgesResult.error) {
    return NextResponse.json({ error: '그래프 불러오기 실패' }, { status: 500 })
  }

  // 표 두 개를 화면용 그래프로 합쳐 돌려준다. (?? [] = 혹시 비어 있으면 빈 배열로)
  // return NextResponse.json(rowsToGraph(nodeRows ?? [], edgeRows ?? []))
  return NextResponse.json(rowsToGraph(nodesResult.data ?? [], edgesResult.data ?? []))
}

// ── 내 그래프 통째 저장(교체) ──
// 같은 주소에 PUT 요청이 오면 실행. (저장은 "이번 전체 그래프로 통째 교체" 방식)
export async function PUT(request: Request) {
  const supabase = await createClient()

  // 저장도 먼저 "누구냐" 확인 — 로그인 안 됐으면 막는다.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // 브라우저가 보낸 본문(JSON)을 그래프로 읽는다. (as Graph = "이건 Graph 모양이야" 타입 단언)
  const graph = (await request.json()) as Graph

  // [RPC = Remote Procedure Call] DB 안에 미리 만들어 둔 함수 replace_graph를 호출.
  // 통째 교체를 한 묶음(트랜잭션)으로: 옛 행 삭제 + 새 행 삽입이 "전부 되거나 전부 취소" →
  // 중간에 끊겨 절반만 저장되는 사고를 막는다(원자적 저장).
  // user_id는 함수 안에서 auth.uid()로 채우므로, 클라이언트는 점·선 데이터만 보낸다(위조 방지).
  const { error } = await supabase.rpc('replace_graph', {
    p_nodes: graph.nodes,
    p_edges: graph.edges,
  })

  // 저장 중 에러면 그대로 500으로 알린다.
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 성공 신호.
  return NextResponse.json({ ok: true })
}
