// 브라우저가 부르면 세션으로 "누구냐" 확인하고, 그 사람 그래프를 조회(GET)/저장(PUT)합니다.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rowsToGraph } from '@/lib/graph-rows'
import type { Graph } from '@/lib/types'

// 내 그래프 불러오기
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // RLS가 자기 행만 보이게 하지만, 명시적으로 컬럼만 고른다.
  const { data: nodeRows } = await supabase.from('nodes').select('id,label,topic')
  const { data: edgeRows } = await supabase.from('edges').select('id,source,target')
  return NextResponse.json(rowsToGraph(nodeRows ?? [], edgeRows ?? []))
}

// 내 그래프 통째 저장(교체)
export async function PUT(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const graph = (await request.json()) as Graph

  // 통째 교체를 한 묶음으로: Postgres 함수(RPC)가 삭제+삽입을 전부 되거나 전부 취소되게 처리 → 반쪽 저장 차단.
  // user_id는 함수 안에서 auth.uid()로 채우므로 클라이언트는 점·선 데이터만 보낸다.
  const { error } = await supabase.rpc('replace_graph', {
    p_nodes: graph.nodes,
    p_edges: graph.edges,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
