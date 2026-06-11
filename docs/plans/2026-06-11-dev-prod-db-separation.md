# 개발/운영 DB 환경 분리 구현 계획 ("Task 9")

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **체크박스 갱신 규칙**: Task·Step을 끝내면 그때그때 `- [ ]`→`- [x]`로 바꿀 것(커밋·PR과 함께). → conventions.md §6.

**Goal:** 로컬 개발을 Supabase CLI + 로컬 Docker 스택으로 옮겨, 로컬 테스트가 운영 DB를 오염시키지 않게 분리한다(기존 클라우드 = 운영 그대로).

**Architecture:** 로컬 = Docker 스택(dev), 기존 클라우드 = 운영(prod). 현재 대시보드에만 있는 스키마를 수동 baseline 마이그레이션으로 옮겨 로컬을 채우고 git에 남긴다. 로컬 로그인은 운영의 Google OAuth 클라이언트를 재사용해 켠다. 앱 코드(컴포넌트·라우트)는 바뀌지 않는다.

**Tech Stack:** Supabase CLI · Docker Desktop · Postgres 마이그레이션 · `config.toml` · `@supabase/ssr`(기존).

**참고 문서:** 설계 [docs/specs/2026-06-11-dev-prod-db-separation-design.md](../specs/2026-06-11-dev-prod-db-separation-design.md) · [ADR 0012](../decisions/0012-dev-prod-db-separation.md)

**브랜치 규칙:** `/create-issue`로 이슈("개발/운영 DB 분리")+브랜치 생성 → 예 `chore/N-db-env-split`. 커밋은 Conventional Commits **scope 없이** `type: 한국어 제목 (#N)`. main 직접 커밋 금지. 머지는 사용자가 직접.

> ⚠️ **이 계획은 인프라·설정 작업**이다. 앱 코드가 안 바뀌므로 자동 단위 테스트가 없다. **진짜 게이트 = Task 6 수동 검증**(마커로 로컬↔운영 분리 증명). "명령이 통과 ≠ 분리됨"임을 의식할 것.
> ⚠️ 설치·외부 콘솔·시크릿 작업은 **사용자가 직접** 수행한다. Claude는 절차·코드만 제공.

---

### Task 1: 이슈·브랜치 + 설계 문서 커밋

> 설계 3종(스펙·ADR·ADR 색인)은 이미 작성돼 main 작업트리에 떠 있다. 브랜치로 옮겨 먼저 커밋한다.

**Files:**
- Commit: `docs/specs/2026-06-11-dev-prod-db-separation-design.md`, `docs/decisions/0012-dev-prod-db-separation.md`, `docs/decisions/README.md`

- [x] **Step 1: 이슈 + 브랜치 생성** — 이슈 #47, 브랜치 `chore/47-db-env-split`

`/create-issue`로 "개발/운영 DB 분리(roadmap 2-후속)" 이슈와 작업 브랜치(`chore/N-db-env-split`)를 만든다. 이후 커밋에 `(#N)`을 붙인다.

- [x] **Step 2: 설계 문서 커밋** — `d7e8491`(spec·ADR 0012·README·plan 4개)

```bash
git add docs/specs/2026-06-11-dev-prod-db-separation-design.md docs/decisions/0012-dev-prod-db-separation.md docs/decisions/README.md
git commit -m "docs: 개발/운영 db 분리 설계 + adr 0012 (#N)"
```

---

### Task 2: 사전 설치 (Docker · Supabase CLI)

**Files:** 없음(설치) · 사용자 머신

- [x] **Step 1: Docker Desktop 설치·실행** (사용자)

[docker.com](https://www.docker.com/products/docker-desktop/)에서 Docker Desktop 설치 후 **실행**(메뉴바 고래 아이콘이 떠 있어야 함). 로컬 스택이 Docker 위에서 돌기 때문.

- [x] **Step 2: Docker 확인** — `Docker version 29.4.3`, `docker ps` 정상

Run: `docker --version`
Expected: `Docker version ...` 출력 (실행 중이면 `docker ps`도 에러 없이 빈 목록)

- [x] **Step 3: Supabase CLI 설치** (사용자)

Run: `brew install supabase/tap/supabase`

- [x] **Step 4: CLI 확인** — `supabase 2.106.0`

Run: `supabase --version`
Expected: 버전 숫자 출력 (예 `2.x.x`)

> 커밋 없음(설치 단계).

---

### Task 3: `supabase init` + baseline 마이그레이션

**Files:**
- Create: `supabase/config.toml`(CLI 생성), `supabase/.gitignore`(CLI 생성), `supabase/migrations/<timestamp>_init.sql`

- [x] **Step 1: 프로젝트 초기화**

Run: `supabase init`
Expected: `supabase/` 폴더 + `config.toml` 생성. ("Generate VS Code settings?" 등 물으면 N으로 충분.)

- [x] **Step 2: baseline 마이그레이션 파일 만들기** — `supabase/migrations/20260611143814_init.sql`

Run: `supabase migration new init`
Expected: `supabase/migrations/<timestamp>_init.sql` 빈 파일 생성. 경로를 메모.

- [x] **Step 3: 스키마 SQL 작성** — 파일 내용 확인 완료(표 2 + RLS 2 + replace_graph)

방금 생긴 `supabase/migrations/<timestamp>_init.sql`에 아래를 그대로 적는다(운영 대시보드에 적용된 것과 동일 — db-auth 플랜 Task 1 Step 3 출처):

```sql
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
```

- [x] **Step 4: 커밋** — `3de53d9`

```bash
git add supabase/config.toml supabase/.gitignore supabase/migrations
git commit -m "chore: supabase cli 초기화 + baseline 마이그레이션 (#N)"
```

> `supabase init`이 만든 `supabase/.gitignore`가 `.branches`·`.temp` 등 로컬 산출물을 제외하는지 확인(자동 포함됨). 시크릿이 섞이지 않게 `git status`로 점검.

---

### Task 4: 로컬 Google 로그인 설정 (`config.toml` + `.env`)

> 로컬 콜백 주소(`http://127.0.0.1:54321/auth/v1/callback`)는 Google Cloud Console에 **이미 등록 완료**(2026-06-11).

**Files:**
- Modify: `supabase/config.toml`
- Modify: `.env`(신규 또는 기존, **gitignore됨**)

- [x] **Step 1: `config.toml`의 `[auth]` 확인·수정** — site_url=localhost:3000, redirect URL에 /auth/callback 허용

`supabase/config.toml`에서 `[auth]` 블록의 `site_url`과 redirect 허용 목록을 앱 주소로 맞춘다:

```toml
[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000/auth/callback", "http://127.0.0.1:3000/auth/callback"]
```

- [x] **Step 2: `[auth.external.google]` 켜기** — enabled + env 참조 + redirect_uri + skip_nonce_check=true

같은 파일의 `[auth.external.google]` 블록을 아래처럼 한다. **시크릿은 직접 쓰지 않고 `env(...)` 치환**으로만 둔다(`config.toml`은 git에 올라감):

```toml
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
redirect_uri = "http://127.0.0.1:54321/auth/v1/callback"
```

- [x] **Step 3: `.env`에 Google 자격값 넣기** (사용자, 커밋 금지) — `.env`에 CLIENT_ID·SECRET 배치 확인

프로젝트 루트 `.env`(이미 `.gitignore`에 `.env*` 포함)에 운영에서 쓰던 Google OAuth 클라이언트 값을 넣는다:

```
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=<Google client id>
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=<Google client secret>
```

> ⚠️ 이 두 값(특히 secret)은 **비밀**이다. 화면 출력·커밋 금지. `git status`에 `.env`가 안 보이는지 확인(gitignore 적용).

- [x] **Step 4: 커밋** (config.toml만, `.env`는 제외) — `2e0165f`

```bash
git add supabase/config.toml
git commit -m "chore: 로컬 supabase google 로그인 설정 (#N)"
```

---

### Task 5: 로컬 스택 기동 + `.env.local` 전환

**Files:**
- Modify: `.env.local`(**gitignore됨**, 커밋 안 함)

- [x] **Step 1: 로컬 스택 띄우기** — `Started supabase local development setup` (exit 0)

Run: `supabase start`
Expected: 첫 실행은 Docker 이미지를 받아 수 분 소요. 끝나면 `API URL`, `anon key`, `service_role key`, `Studio URL` 등이 표로 출력된다.

- [x] **Step 2: 로컬 접속 정보 확인** — API `127.0.0.1:54321`, Studio `54323`, 메일함 `54324`

Run: `supabase status`
Expected: `API URL: http://127.0.0.1:54321` 와 `anon key`(또는 publishable) 표시. 이 둘을 메모(데모 고정값이라 비밀 아님).

- [x] **Step 3: `.env.local`을 로컬 스택으로 교체** (사용자) — 운영 값은 주석 백업, 활성=로컬

기존 `.env.local`의 클라우드 값을 로컬 스택 값으로 바꾼다(원래 운영 값은 주석으로 백업해 보존):

```
# (운영 백업 — 필요 시 복구)
# NEXT_PUBLIC_SUPABASE_URL=https://<운영>.supabase.co
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<운영 publishable>

NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase status의 anon/publishable key>
```

- [x] **Step 4: 마이그레이션이 로컬에 적용됐는지 확인** — `db reset`에서 init.sql 적용 성공(에러 없음)

Run: `supabase db reset`
Expected: `supabase/migrations`의 baseline이 로컬 DB에 적용됨(`Applying migration <timestamp>_init.sql...`). 에러 없이 완료.

- [x] **Step 5: 앱 기동 확인** — `npm run dev` → localhost:3000에 예시 그래프 표시(로컬 스택 연결)

Run: `npm run dev`
Expected: 빌드 에러 없이 `http://localhost:3000` 떠서, **로그인 전 예시 그래프**가 보임.

> 커밋 없음(`.env.local`은 gitignore).

---

### Task 6: 수동 검증 — 분리 증명 (진짜 게이트)

**Files:** 없음(검증)

- [x] **Step 1: 로컬 Google 로그인** — 로그인+빈 그래프 로드 OK (디버깅: 마이그레이션에 grant 누락 → 추가 / db reset 후 재로그인 필요)

`http://localhost:3000`에서 **Google 로그인** → 콜백 후 홈 복귀 → 로그인 상태(이메일 표시) 확인.

- [ ] **Step 2: 마커 점 저장**

점을 하나 추가하되 라벨을 표식으로: `로컬전용-마커`. 0.6초 뒤 자동 저장. 새로고침해도 남는지 확인(로컬 스택에 저장됨).

- [x] **Step 3: 로컬 DB에 있는지 확인(증거)** — 로컬 nodes에 "리뷰 UX"·"비용"(+엣지) 확인(psql 조회)

`supabase status`의 **Studio URL**(예 `http://127.0.0.1:54323`) → Table Editor → `nodes` 표에 `로컬전용-마커` 행이 있는지 확인.

- [x] **Step 4: 운영에는 없는지 확인(분리 증명)** ★ — 운영 클라우드 nodes에 "리뷰 UX"·"비용" 없음(원래 데이터만). **분리 성립**

운영 Supabase 대시보드(클라우드) → Table Editor → `nodes`에 `로컬전용-마커`가 **없는지** 확인.
→ 로컬에는 있고 운영에는 없으면 **분리 성립**(이번 마일스톤의 핵심).

- [x] **Step 5: 운영 회귀 확인** — 배포본 로그인·저장 정상(잠복 버그 발견·수정: 운영 Site URL이 localhost였음 → vercel로 + 콜백 등록)

배포본(https://knowledge-graph-lyart.vercel.app)에서 로그인·저장이 **그대로 동작**하는지(분리가 운영을 안 건드렸는지) 확인.

---

### Task 7: PR + Kimi 리뷰 + 사용자 머지

**Files:** 없음

- [ ] **Step 1: PR 생성**

`/commit-push`로 PR 생성(base main). 본문에 동작 확인(마커 분리 스크린샷/콘솔) 포함.

- [ ] **Step 2: Kimi 코드리뷰 → 처리 → 사용자 머지**

PR에서 Kimi 리뷰 확인 → 지적 처리 → **사용자가 직접 머지**. 계획 체크박스 `- [x]` 갱신 동봉.

- [ ] **Step 3: 머지 후 정리**

main 동기화 + 머지된 브랜치 삭제(로컬+원격). HANDOFF 7번을 "Task 9 완료"로 갱신.

---

## 후속 / 미루는 것 (별도)

- **운영 push 흐름 첫 적용** — 다음 스키마 변경 시 `supabase db push` + `supabase migration repair`로 운영 동기화.
- **시드 데이터**(`supabase/seed.sql`)로 로컬 예시 그래프 자동 채우기(필요해지면).
- **Kakao 로컬 로그인** — Google로 검증되면 동일 패턴으로 추가.
