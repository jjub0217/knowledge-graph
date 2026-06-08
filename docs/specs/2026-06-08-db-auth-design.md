# 설계 문서 — DB 저장 + 인증 (로드맵 2번)

- 날짜: 2026-06-08 (월)
- 상태: 초안 (사용자 검토 대기)
- 관련: 로드맵 2번 · [ADR 0010](../decisions/0010-db-auth-priority.md)(우선순위 7→2) · [ADR 0011](../decisions/0011-db-auth-architecture.md)(이 설계의 결정 기록)

> 쉬운 한국어로 작성. localStorage 저장을 **서버 DB + 로그인**으로 옮겨 여러 기기에서 같은 그래프를 쓰는 마일스톤의 청사진.

---

## 1. 한 줄 요약 / 목표

로그인한 사용자의 지식 그래프를 **서버 데이터베이스(Supabase Postgres)에 저장**해, 여러 기기에서 같은 그래프를 쓰고 백업되게 한다. 비로그인 방문자는 지금처럼 **예시 그래프**를 보고 둘러본다(저장은 로그인해야 가능).

## 2. 왜 (동기)

- 로드맵 2번. 주동기는 **포트폴리오 임팩트** — 백엔드·인증·DB를 다룰 줄 안다는 가장 선명한 산출물(ADR 0010).
- 부수 동기: **멀티기기**(집·회사에서 같은 그래프) + **데이터 안전**(브라우저 캐시 삭제로 유실되는 localStorage의 공백을 메움).

## 3. 범위 (이번에 하는 것 / 안 하는 것)

**한다**

- 소셜 로그인(**1차: Google + Kakao**)
- 로그인 사용자의 그래프를 서버 DB에 저장·복원 (정규화 스키마: nodes·edges 표)
- 비로그인은 예시 그래프 표시(저장 없음)
- 저장소 전환을 `storage.ts` 한 곳에서 처리(로그인 → 서버 / 비로그인 → 예시)

**안 한다 (다음/별도)**

- **이메일 회원가입**(아이디·비밀번호) — 2차로 분리. 이메일 인증·비밀번호 재설정 흐름이 딸려와 작업이 한 묶음 더.
- **공유**(남에게 링크로 공개) — 별도 마일스톤. 공개/비공개 권한·공유 라우트 필요.
- **실시간 동기화**(두 기기 동시 편집 즉시 반영) — 충돌 해결·구독 등 난도 급등.
- **Naver·Facebook 로그인** — Naver는 Supabase 미지원(커스텀 OAuth 필요), Facebook은 Meta 앱 심사 부담. 효용 대비 비용이 안 맞아 제외(필요해지면 후속).
- **비로그인 편집의 영속화** — 비로그인은 만져볼 순 있으나 새로고침하면 예시로 리셋(localStorage 그래프 저장 제거).

## 4. 설계

### 4.1 아키텍처 (하이브리드)

```
[브라우저]              [내 Next.js 서버]          [Supabase]
 화면(page.tsx)          /api/graph 라우트          Postgres: nodes·edges (RLS)
   │ load/saveGraph        (내가 쓴 서버 코드)        Auth: 세션·소셜 로그인
   ▼                         │
 storage.ts ──fetch──▶ 세션 확인 → supabase-js로 내 user_id 행만 조회/저장
  "로그인 했나?"
   ├ 비로그인 → 예시 고정값
   └ 로그인  → 위 서버 경로
```

- 브라우저가 Supabase를 직접 부르지 않고 **내가 쓴 `/api/graph` 라우트**를 거친다(하이브리드). 서버 코드를 직접 짠 게 포폴 신호이고, 이후 서버에서 검증·가공을 끼울 자리가 생긴다.
- DB 접근은 **supabase-js**로 한다(별도 ORM 없음 — 정규화 스키마로 DB 설계 신호는 충분, ORM은 과설계).

### 4.2 DB 스키마 (정규화)

Supabase가 제공하는 `auth.users`(사용자 표)에 두 표를 추가한다.

```
nodes                              edges
 user_id uuid → auth.users(id) FK   user_id uuid → auth.users(id) FK
 id      text                       id      text
 label   text                       source  text   (출발 점 id)
 topic   text                       target  text   (도착 점 id)
 PK (user_id, id)                   PK (user_id, id)
```

- 현재 타입 그대로 매핑: `GraphNode{id,label,topic}` → nodes 행, `GraphEdge{id,source,target}` → edges 행. 거기에 `user_id`만 붙는다.
- 노드 id는 지금처럼 클라이언트가 만든 문자열을 점 정체성으로 쓴다(사람 단위로 유일).
- **RLS(행 수준 보안)**: 두 표에 "자기 `user_id` 행만 읽기/쓰기" 정책을 켠다 → API 라우트가 막아도 DB가 한 번 더 막는다(방어 한 겹 더).

### 4.3 저장 인터페이스 (`storage.ts`)

- `loadGraph()` / `saveGraph()` **이름은 유지**(화면 코드 변경 최소화). 단 **동기 → 비동기(async)** 로 바뀐다(서버 왕복 때문).
  - `loadGraph()`: 로그인 → `GET /api/graph`로 내 그래프 / 비로그인 → 예시 고정값(`EXAMPLE_GRAPH`).
  - `saveGraph(graph)`: 로그인 → `PUT /api/graph`로 통째 저장 / 비로그인 → no-op(아무것도 안 함).
- **제거**: `hasStoredGraph()`(첫 방문 판별용 — 이제 비로그인은 항상 예시를 봄), localStorage 그래프 저장 코드.
- **유지**: `exportJSON` / `importJSON`(JSON 파일 내보내기·가져오기는 로그인과 무관하게 유용).

### 4.4 API 라우트 `/api/graph` (서버 코드)

```
GET  → 쿠키 세션으로 사용자 확인 → supabase-js로 그 user_id의 nodes·edges 조회 → Graph로 합쳐 응답
PUT  → 세션 확인 → Postgres 함수(RPC) replace_graph로 통째 교체(삭제+삽입을 한 트랜잭션)
```

- 통째 교체를 **한 묶음으로(전부 되거나 전부 취소)**: 개별 호출(삭제·삽입 4번)로 나누면 중간에 끊길 때 "반쪽 저장" 위험이 있어, **Postgres 함수(RPC) `replace_graph`** 하나로 묶어 전부 되거나 전부 취소되게 한다(중간에 끊겨도 반쪽이 안 남음). `user_id`는 함수 안에서 `auth.uid()`로 채워 클라이언트가 보낸 값을 믿지 않는다.
- 라우트는 **로그인 사용자의 세션 토큰으로** Supabase를 호출 → RLS가 그 사람 기준으로 자동 적용. 만능 키(service_role) 불필요.

### 4.5 DB 행 → 그래프 변환 (순수 함수, TDD)

- `rowsToGraph(nodeRows, edgeRows)` → `Graph` (불러오기 방향만).
- 저장 방향(`user_id` 채우기)은 RPC 함수가 처리하므로 별도 변환 함수가 필요 없다.
- 바깥 입출력이 없는 **순수 함수**라 테스트를 먼저 쓰기 좋다(이 프로젝트 **TDD 셋째 사이클**).

### 4.6 저장 빈도 — 디바운스

- 지금은 변경마다 저장(localStorage라 즉시여서 괜찮았다). 서버는 변경마다 네트워크 호출이라, **디바운스**로 "마지막 변경 후 잠깐(예: 0.6초) 멈추면 한 번만 저장"으로 묶는다.

### 4.7 인증 흐름 & UI

```
[로그인 버튼] (Google / Kakao) → Supabase 로그인 → /auth/callback(코드→세션 쿠키)
   → 앱 갱신 → loadGraph()가 서버에서 내 그래프 불러옴
[로그아웃] → 세션 정리 → 예시 화면으로
```

- 세션은 **쿠키**(`@supabase/ssr`)에 저장 — 서버 라우트가 읽어야 하므로(localStorage는 서버가 못 읽음). 쿠키는 `httpOnly`라 JS가 못 읽어 XSS에 강하다.
- 새 화면 조각: **로그인/로그아웃 버튼 + 현재 상태 표시**. 위치는 `Controls` 옆.
- 새 라우트: `/auth/callback`(OAuth 표준 — 코드를 세션 쿠키로 교환).
- **신규 로그인 사용자**는 서버 그래프가 비어 있으므로 빈 그래프에서 시작(예시는 비로그인 데모 전용).

## 5. 모듈 / 파일 변경

| 파일 | 변경 | 책임 |
| --- | --- | --- |
| Supabase 프로젝트(DB) | 신규 | `nodes`·`edges` 표 + RLS 정책 + `replace_graph` 함수 (SQL) |
| `src/lib/supabase/client.ts` | 신규 | 브라우저용 supabase 클라이언트(`@supabase/ssr`) |
| `src/lib/supabase/server.ts` | 신규 | 서버용 supabase 클라이언트(쿠키 세션 읽기) |
| `src/lib/graph-rows.ts` | 신규 | `rowsToGraph` 순수 변환(불러오기 방향) |
| `src/lib/graph-rows.test.ts` | 신규 | 변환 함수 TDD |
| `src/lib/storage.ts` | 대폭 수정 | async 전환 + 로그인 분기, `hasStoredGraph` 제거 |
| `src/app/api/graph/route.ts` | 신규 | `GET`/`PUT` 그래프(세션 확인 + 조회/저장) |
| `src/app/auth/callback/route.ts` | 신규 | OAuth 코드 → 세션 쿠키 교환 |
| `src/components/AuthButton.tsx` | 신규 | 로그인/로그아웃 버튼 + 상태 |
| `src/components/Controls.tsx` | 수정 | 로그인 버튼 배치 / "비우기" 의미 조정 |
| `src/app/page.tsx` | 수정 | async load/save, 로그인 상태 분기, 디바운스 저장 |
| `.env.local` / Vercel 환경변수 | 신규 | `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

## 6. 데이터 흐름

```
첫 로드 / 로그인 상태 변할 때
   ├─ 비로그인 → 예시 그래프(고정값) 표시, 저장 안 함
   └─ 로그인  → GET /api/graph → 내 그래프 표시

그래프 변경 시
   ├─ 비로그인 → no-op(저장 안 함, 새로고침하면 예시로 리셋)
   └─ 로그인  → 디바운스 후 PUT /api/graph → RPC로 서버에 통째 저장(한 묶음)
```

## 7. 에러 처리

- 비로그인인데 저장 시도 → 조용히 no-op.
- 불러오기/저장 네트워크 실패 → 사용자에게 알림, 화면은 안 깨지게(이전 상태 유지).
- 세션 만료 → 다시 로그인 유도.
- 기존 입구 검사(올린 .md·velog 응답·붙여넣은 주소·가져온 JSON)는 그대로.

## 8. 보안 / 시크릿

- `NEXT_PUBLIC_SUPABASE_URL`·`NEXT_PUBLIC_SUPABASE_ANON_KEY`는 **공개용**(브라우저가 쓰라고 만든 값) — 비밀 아님. `.env.local` + Vercel에 등록.
- **service_role 키는 쓰지 않는다**(RLS를 우회하는 위험한 키 — 서버에도 두지 않음).
- RLS를 방어선으로 켠다(4.2). 세션 쿠키는 `httpOnly`.
- ⚠️ **시크릿 등록·Supabase 프로젝트 생성·소셜 앱 키 발급은 사용자가 직접** 수행(절차·명령은 안내). Google·Kakao 개발자 콘솔에서 OAuth 키 발급 + 콜백 URL 등록 필요.

## 9. 테스트 전략

| 대상 | 방법 |
| --- | --- |
| `rowsToGraph` (순수 함수) | **TDD**(셋째 사이클) |
| `storage.ts` 분기(로그인 여부로 경로 선택) | 세션 흉내(mock) 후 유닛 테스트 |
| `/api/graph` 라우트·인증·OAuth·쿠키 | **수동 검수**(실제 로그인 → 그래프 뜨나, 다른 기기서 같은가) |
| GraphView(캔버스) | 변경 없음, 수동 |

- 게이트: `tsc --noEmit` + `vitest` + **수동 로그인·멀티기기 검수**.
- 인증·DB는 자동 테스트가 닿기 어려운 I/O라 "테스트 통과 ≠ 동작"을 특히 의식 — 실제 로그인해 눈으로 확인.

## 10. 열린 질문 / 미루는 것

- **"비우기" 버튼 의미**: 로그인 시 = 서버 그래프 비우기. 비로그인 시 동작(숨길지/화면만 초기화할지)은 구현 때 확정.
- **이메일 회원가입(2차)**: 소셜 로그인 골격 검증 후 그 위에 얹는다.
- **자동 배포 환경변수**: Vercel에 키 등록 전엔 로그인이 동작 안 함 — 배포 검수 시 확인.

## 11. 용어 풀이

- **BaaS**(Backend as a Service): DB·인증·API 같은 백엔드를 서비스로 빌려 쓰는 것(예: Supabase).
- **정규화**: 데이터를 중복 없이 표로 쪼개 설계하는 것.
- **외래키(FK)**: 한 표의 행이 다른 표의 어떤 행에 속하는지 가리키는 연결고리.
- **RLS**(Row Level Security): DB가 행마다 "이건 누구 것"이라며 접근을 막는 규칙.
- **RPC**(Remote Procedure Call): DB 안에 미리 만들어둔 함수를 코드에서 이름으로 호출하는 것. 여러 SQL을 한 묶음으로(전부 되거나 전부 취소) 실행할 수 있다.
- **OAuth**: 비밀번호를 넘기지 않고 "구글·카카오 계정으로 로그인"하게 해주는 표준 절차.
- **세션 쿠키 / `httpOnly`**: 로그인 상태를 담는 쿠키. `httpOnly`면 JavaScript가 읽지 못해 토큰 탈취(XSS)에 강하다.
- **디바운스**: 연속된 동작을 "잠잠해지면 한 번"으로 묶는 기법.
- **no-op**: 아무 동작도 하지 않음.
