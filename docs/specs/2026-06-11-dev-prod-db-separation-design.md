# 개발/운영 DB(Supabase) 환경 분리 설계 ("Task 9")

- 작성일: 2026-06-11
- 상태: 설계 합의 완료 → 구현 계획 대기
- 관련: [roadmap 2-후속](../roadmap.md) · [ADR 0011 DB+인증 아키텍처](../decisions/0011-db-auth-architecture.md) · [ADR 0012 개발/운영 DB 분리](../decisions/0012-dev-prod-db-separation.md)

## 1. 목표 / 배경

현재 로컬 개발과 운영(Vercel)이 **같은 클라우드 Supabase 프로젝트 하나**를 본다. 그래서 로컬에서 테스트하며 점·선을 저장하면 **운영 데이터가 오염**된다. 개발 환경과 운영 환경의 DB를 분리해 이 오염을 막는다.

방식은 **Supabase CLI + 로컬 Docker 스택**(reelbox 선례)을 택한다. 부수 효과로 지금 클라우드 대시보드에만 있는 스키마를 **마이그레이션 코드로 git에 남겨** 버전관리·재현성·포폴 신호를 얻는다.

## 2. 범위 밖 (비목표 — YAGNI: 지금 필요 없는 건 안 만든다)

> **YAGNI**(You Aren't Gonna Need It, "그거 어차피 안 쓴다"): "나중에 필요할 것 같아서" 미리 만들지 않고, 진짜 필요해지는 순간에 만든다는 원칙. 미리 만들면 대개 안 쓰이고 유지비만 는다.

- **별도 "dev용 클라우드 프로젝트"는 만들지 않는다.** 로컬 Docker 스택이 dev 역할을 한다.
- **운영(prod) 클라우드와 Vercel 설정은 바꾸지 않는다.** 분리는 로컬 쪽에만 더한다.
- **이번 마일스톤에 운영으로 마이그레이션 push는 하지 않는다.** 운영은 이미 대시보드로 스키마가 적용돼 있다. baseline은 _로컬 provision + git 기록_ 용도.
- CI 자동 마이그레이션, 스테이징(3번째 환경), 시드 자동화 파이프라인은 다루지 않는다.

## 3. 전체 구조 (토폴로지 — 무엇이 어느 DB를 보는지의 배치도)

```
        이전 (지금)                              이후
로컬 개발    ┐                          로컬 개발 ──▶ 로컬 Supabase (Docker)  = dev
           ├─▶ 같은 클라우드 1개                       (supabase start)
운영(Vercel)┘   ⚠️ 오염              운영(Vercel) ─▶ 클라우드 Supabase     = prod (그대로)
```

- **로컬 = Docker 스택(dev)**, **기존 클라우드 = 운영(prod)**.
- 운영(Vercel 환경변수)은 변경 없음.

**새로 생기거나 바뀌는 것:**

| 항목                   | 내용                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| `supabase/` 폴더(신규) | CLI가 생성 — `config.toml`(로컬 스택 설정) + `migrations/`(스키마 기록)      |
| `.env.local` 변경      | 클라우드 주소·키 → 로컬 스택 주소·키(CLI가 주는 로컬 데모 고정값, 비밀 아님) |
| 사용자 설치(1회)       | Docker Desktop + Supabase CLI                                                |
| 운영 클라우드          | = prod로 그대로 유지                                                         |

## 4. 스키마 이행 (대시보드 → 마이그레이션 코드)

지금 표·RLS·`replace_graph` 함수가 클라우드 대시보드에만 있다. 로컬 스택은 빈 DB로 시작하므로 이 구조를 마이그레이션 파일로 옮긴다.

> **용어**: <br>
> **마이그레이션**(migration) = DB 구조 변경을 차곡차곡 쌓는 "변경 기록부"(파일 하나 = 변경 한 단계). <br>
> **baseline**(베이스라인) = 그중 현재 스키마를 통째로 담은 _맨 첫 번째_ 파일(출발점).<br>
> **provision**(프로비저닝) = 빈 DB에 표·정책·함수를 실제로 만들어 "쓸 수 있는 상태로 갖추는" 것.

- **방법: 수동 baseline 작성** — 이미 검토된 SQL([db-auth 플랜](../plans/2026-06-08-db-auth.md) Task 1 Step 3의 표·RLS·`replace_graph`)을 `supabase/migrations/<timestamp>_init.sql`에 직접 작성한다.
- **이유**: 스키마가 작고(표 2 + 정책 2 + 함수 1) 이미 SQL을 갖고 있어 자동 추출(`supabase db pull`)의 이점이 거의 없다. 무엇이 왜 있는지 직접 설명할 수 있어 면접 자산이 되고, 마이그레이션 개념을 직접 체험한다.

**운영이 이미 스키마를 가진 점 처리:**

```
baseline 마이그레이션 (예: 0001_init.sql)
   ├─▶ 로컬 Docker 스택:  실행 → 표·RLS·함수 생김 (provision)
   ├─▶ git:               스키마가 코드로 남음 (버전관리·포폴)
   └─▶ 운영 클라우드:      이미 적용돼 있음 → 이번엔 push 안 함 (재적용 시 충돌)
```

다음에 스키마가 바뀔 때부터 정식 흐름(로컬에서 만들고 → 운영에 `db push`)을 쓴다. 그 시점에 운영을 baseline "적용됨"으로 맞추는 동기화는 `supabase migration repair`로 가볍게 처리한다(지금은 불필요).

## 5. 로컬 Google 로그인

이 앱의 저장·복원은 로그인 상태라야 돈다(`isLoggedIn()` 게이트). 로컬 스택에서도 "로그인된 상태"가 필요하므로 로컬에서도 Google 로그인을 켠다. **운영에 쓰던 Google OAuth 클라이언트를 재사용**하고, 로컬 주소만 추가 등록한다. **앱 코드는 변경 없음**(`redirectTo`가 `location.origin` 기반이라 로컬에선 자동으로 localhost).

**로컬 로그인 경로:**

```
localhost:3000 "Google 로그인"
  → 로컬 Supabase (127.0.0.1:54321)
  → 진짜 Google 화면 (운영과 같은 OAuth 클라이언트 재사용)
  → Google → 로컬 Supabase 콜백(127.0.0.1:54321/auth/v1/callback)
  → 로컬 앱 /auth/callback → 세션 쿠키 → 로그인 완료
```

**설정 3가지:**

| 무엇                                                                                                   | 어디에                                                             | 비밀?              | 상태                 |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------ | -------------------- |
| ① 로컬 콜백 주소 등록 `http://127.0.0.1:54321/auth/v1/callback`                                        | Google Cloud Console                                               | 아니오             | **완료(2026-06-11)** |
| ② Google provider 켜기 `[auth.external.google]` enabled + client_id + `site_url=http://127.0.0.1:3000` | `supabase/config.toml`(git 커밋됨)                                 | client_id 공개     | 예정                 |
| ③ Google 시크릿                                                                                        | `.env`(gitignore), config.toml은 `secret = "env(이름)"`으로 참조만 | **예 — 커밋 금지** | 예정                 |

**보안:** `config.toml`은 git에 올라가므로 시크릿을 직접 쓰지 않고 `env(...)` 치환만 둔다. 실제 값은 `.env`(이미 `.gitignore`됨)에. 로컬 스택의 anon/publishable 키는 CLI가 주는 데모 고정값이라 비밀이 아니다.

## 6. 개발 / 배포 흐름 + 셋업

**1회 셋업 (사용자가 직접):**

```
① Docker Desktop 설치
② Supabase CLI 설치   brew install supabase/tap/supabase
③ supabase init                       → supabase/ + config.toml 생성
④ supabase migration new init         → 생긴 파일에 표·RLS·replace_graph SQL 작성
⑤ config.toml 편집 (Google provider + site_url) + .env에 Google 시크릿
⑥ supabase start                      → Docker 스택 기동(+마이그레이션 자동 적용)
⑦ supabase status 로 로컬 URL·키 확인 → .env.local 을 로컬 스택으로 교체
```

**평소 개발:**

```
supabase start   (이미 떠 있으면 생략)
npm run dev      → 로컬 DB·로그인으로 개발·테스트
supabase stop    (끝나면 자원 반납)
```

**스키마 변경 (앞으로):**

```
supabase migration new <이름> → SQL 작성 → supabase db reset(로컬 검증) → (운영 반영 시) supabase db push
```

**배포:** 변화 없음. Vercel은 그대로 운영 클라우드를 본다.

## 7. 검증 (어떻게 "됐다"를 증명하나)

- **마커 검증**: 로컬에서 점 `로컬전용-마커`를 저장 → 로컬 스택(Studio 또는 `supabase` 조회)에 그 행이 있고, **운영 대시보드엔 없음**을 확인 → 분리 성립.
- 로컬에서 Google 로그인 → 저장 → 새로고침 복원이 도는지(로컬 스택 기준).
- 운영(배포본) 동작이 그대로인지 회귀 확인(분리가 운영을 안 건드렸는지).

## 8. 위험 / 주의

- **Docker 미실행 시 `supabase start` 실패** — Docker Desktop이 켜져 있어야 한다.
- **시크릿 유출** — `config.toml`에 Google 시크릿을 직접 쓰지 않도록 주의(env 치환 필수).
- **운영에 실수로 push** — 이번엔 운영 push 안 함. `db push`는 스키마 변경 마일스톤에서만.
- **포트 충돌** — 로컬 스택 기본 포트(54321 등)가 다른 것과 겹치면 config.toml에서 조정.

## 9. 후속 (별도, 지금 범위 밖)

- 스키마 변경 시 운영 push 흐름 첫 적용 + `migration repair` 동기화.
- 시드 데이터(`seed.sql`)로 로컬 예시 그래프 자동 채우기(필요해지면).
- CI에서 마이그레이션 검증.

## 10. 관련 문서

- 우선순위: [roadmap 2-후속](../roadmap.md)
- 직전 결정: [ADR 0011](../decisions/0011-db-auth-architecture.md)
- 이 결정의 ADR: [**0012 개발/운영 DB 분리**](../decisions/0012-dev-prod-db-separation.md) — CLI+로컬 스택 vs 대안(클라우드 2개)을 트레이드오프로 기록.
- 구현 계획: 작성 예정(writing-plans).
