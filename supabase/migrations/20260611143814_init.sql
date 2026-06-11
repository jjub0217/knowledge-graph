-- 점(노드) 표: 사용자별로 자기 점을 가진다
create table public.nodes (
  user_id uuid not null references auth.users (id) on delete cascade,
  id      text not null,
  label   text not null,
  topic   text not null,
  primary key (user_id, id)
);

-- 선(엣지) 표
create table public.edges (
  user_id uuid not null references auth.users (id) on delete cascade,
  id      text not null,
  source  text not null,
  target  text not null,
  primary key (user_id, id)
);

-- 행 수준 보안(RLS): 각 사용자는 자기 user_id 행만 읽기/쓰기
alter table public.nodes enable row level security;
alter table public.edges enable row level security;

create policy "own nodes" on public.nodes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own edges" on public.edges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 그래프 통째 교체를 한 묶음으로(전부 되거나 전부 취소) → 반쪽 저장 차단.
-- user_id는 함수 안에서 auth.uid()로 채운다(클라이언트가 보낸 값을 믿지 않음).
create or replace function replace_graph(p_nodes jsonb, p_edges jsonb)
returns void as $$
begin
  delete from edges where user_id = auth.uid();
  delete from nodes where user_id = auth.uid();
  insert into nodes (user_id, id, label, topic)
    select auth.uid(), x.id, x.label, x.topic
    from jsonb_to_recordset(p_nodes) as x(id text, label text, topic text);
  insert into edges (user_id, id, source, target)
    select auth.uid(), x.id, x.source, x.target
    from jsonb_to_recordset(p_edges) as x(id text, source text, target text);
end;
$$ language plpgsql security definer;