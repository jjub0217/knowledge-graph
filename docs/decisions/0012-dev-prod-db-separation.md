# 0012. 개발/운영 DB 환경 분리 — Supabase CLI + 로컬 Docker 스택

- 상태: 채택
- 날짜: 2026-06-11

## 맥락 (Context)

[ADR 0011](0011-db-auth-architecture.md)에서 DB·인증을 Supabase로 도입하며 **클라우드 프로젝트 하나**를 전제했다. 그 결과 로컬 개발과 운영(Vercel)이 **같은 클라우드 Supabase 프로젝트**를 보게 되어, 로컬에서 테스트하며 점·선을 저장하면 **운영 데이터가 오염**된다.

개발 환경과 운영 환경의 DB를 분리해 이 오염을 막는다. 또한 현재 스키마(표 `nodes`·`edges`, RLS 정책, `replace_graph` 함수)가 **클라우드 대시보드에만** 있고 git에 없다는 점도 함께 본다 — 이 기회에 스키마를 코드로 남길지가 선택지에 영향을 준다.

> 용어: **마이그레이션**(migration) = DB 구조 변경을 차곡차곡 쌓는 "변경 기록부". **RLS**(Row Level Security) = "각 사용자는 자기 행만 본다"를 DB가 강제하는 규칙. **provision**(프로비저닝) = 빈 DB에 표·정책·함수를 만들어 쓸 수 있는 상태로 갖추는 것.

## 고려한 선택지 (Options)

- **A. dev용 클라우드 프로젝트 하나 더 (최소)** — Supabase 클라우드 프로젝트를 dev/prod 둘로 두고, 로컬은 dev를 본다. 가장 가볍고 새 도구가 없다. 단 스키마는 여전히 대시보드에만 남고, 클라우드 프로젝트가 둘로 늘며, 로컬 개발도 인터넷·클라우드에 의존한다.
- **B. 클라우드 2개 + 스키마 SQL을 git 파일로 (중간)** — A에 더해 표·RLS·함수를 SQL 파일로 git에 보관(두 프로젝트에 수동 적용). 스키마 버전관리는 얻지만 CLI 없이 두 클라우드를 손으로 맞춰야 하고, 로컬 독립 개발(인터넷 없이)은 안 된다.
- **C. Supabase CLI + 로컬 Docker 스택 (reelbox 선례)** — CLI로 로컬에 Supabase 한 벌(Postgres·Auth·Studio)을 Docker로 띄워 dev로 쓰고, 기존 클라우드는 prod로 둔다. 스키마는 마이그레이션 코드로 git에 남는다. 가장 무겁다(Docker·CLI·마이그레이션 학습).

## 결정 (Decision)

**C를 택한다.** Supabase CLI를 도입해 **로컬 Docker 스택 = dev**, **기존 클라우드 = prod**로 분리한다.

- 별도 dev용 클라우드 프로젝트는 만들지 않는다(로컬 Docker가 dev 역할).
- 운영 클라우드·Vercel 설정은 바꾸지 않는다.
- 스키마는 **수동 baseline 마이그레이션**으로 옮긴다(이미 검토된 SQL을 직접 작성). 운영은 이미 스키마를 가졌으므로 이번엔 운영에 push하지 않는다.
- 로컬 로그인은 **운영의 Google OAuth 클라이언트를 재사용**해 로컬에서도 켠다.

## 근거 / 트레이드오프 (Rationale)

- 이 프로젝트의 주동기는 **포트폴리오 임팩트 + 도구 체험**이다. C는 "로컬 개발 환경을 제대로 구성하고, 스키마를 마이그레이션으로 관리한다"는 가장 선명한 신호를 주며, Supabase CLI·Docker·마이그레이션을 직접 체험하게 한다. 즉 C의 가장 큰 단점인 **학습 비용이 이 프로젝트에서는 오히려 목적과 일치**해 비용이 가치로 전환된다.
- A는 가장 가볍지만 스키마가 여전히 대시보드에만 남아 재현성·포폴 신호가 약하고, 클라우드 프로젝트가 둘로 늘어 관리 지점이 많아지며, 로컬이 클라우드에 의존한다.
- B는 스키마를 git에 두지만 두 클라우드를 손으로 동기화해야 하고 로컬 독립 개발이 안 된다 — CLI를 안 쓰면서 마이그레이션의 이점만 취하려다 수작업이 늘어 어정쩡하다.
- C는 `~/Desktop/reelbox`에서 같은 구조(별도 `supabase/config.toml` + 로컬 스택)를 이미 써본 선례가 있어 위험이 낮다.
- 포기한 것: A의 단순함(새 도구 0). 대신 Docker 실행 의존과 초기 학습 곡선을 받아들인다.

## 결과 (Consequences)

- **새 부품**: `supabase/` 폴더(`config.toml`, `migrations/`), 현재 스키마를 담은 baseline 마이그레이션 파일.
- `.env.local`이 **로컬 스택 주소·키**(CLI가 주는 데모 고정값, 비밀 아님)를 가리키게 바뀐다. 운영 키(Vercel 환경변수)는 그대로.
- **로컬 Google 로그인**: `config.toml`의 `[auth.external.google]`에 client_id + 시크릿(`env(...)` 치환)을 두고, Google Cloud Console에 로컬 콜백 `http://127.0.0.1:54321/auth/v1/callback`을 등록한다(등록은 2026-06-11 완료). 시크릿은 `.env`(gitignore)에만 두고 `config.toml`에 직접 쓰지 않는다 — `config.toml`은 git에 올라가기 때문.
- **이번엔 운영에 마이그레이션을 push하지 않는다**(운영은 대시보드로 이미 적용됨, 재적용 시 충돌). 다음 스키마 변경부터 정식 흐름(로컬에서 만들고 → `supabase db push`)을 쓰며, 그때 운영을 baseline "적용됨"으로 맞추는 동기화는 `supabase migration repair`로 처리한다.
- **Docker 의존**: Docker Desktop이 실행 중이어야 `supabase start`가 동작한다.
- 앱 코드(컴포넌트·라우트)는 바뀌지 않는다 — 분리는 환경·설정 수준에서 이뤄진다.
- 이 결정은 [ADR 0011](0011-db-auth-architecture.md)의 스택·스키마·인증 선택을 뒤집지 않는다. 바뀌는 것은 **환경 구성(로컬 dev를 클라우드에서 분리)**뿐이다.
- 상세 청사진은 [설계 문서](../specs/2026-06-11-dev-prod-db-separation-design.md)에 있다.
