# 핸드오프 문서 — knowledge-graph 프로젝트

> **목적**: cuddle-market 경로에서 진행한 브레인스토밍 세션(2026-05-27)을 새 경로(`~/Desktop/knowledge-graph`)의 새 Claude Code 세션이 끊김 없이 이어받기 위한 문서.
>
> **새 세션 첫 작업**: 이 문서를 읽고, 아래 "7. 현재 상태 / 다음 단계"부터 구현을 계속한다.

---

## 0. 한 줄 요약

학습한 개념을 **노드·엣지로 시각화하는 학습 지식 그래프** 프로젝트. 취업 포폴 + 도구 학습 + 실용 + 멘토 과제를 겸하며, **"면접에서 만든 과정을 디테일하게 설명할 수 있을 것"**을 메타 요구사항으로 둔다.

---

## 1. 이 프로젝트가 시작된 맥락

- 사용자는 **프론트엔드 개발자(취업 준비 중)**. 멘토링 + 주간 학습 로그 + 기술 블로그 운영. "왜"를 깊이 이해하려 함.
- 직전 세션들에서 Claude Code 워크플로우(superpowers·TDD·grill-me·bkit)를 깊이 탐구.
- 카톡 개발자 대화방의 "superpowers에서 TDD 빼고 쓰는가" 논쟁을 계기로 도구 선택을 고민.
- 멘토가 **"새로운 프로젝트를 진행해와라"** 라는 (주제 완전 자유) 과제를 제시.
- → 제로에서 브레인스토밍으로 프로젝트를 찾기로 함.

### 사용자가 밝힌 동기 (4가지 전부 해당)
1. 취업 포폴 상자 늘리기
2. 도구·워크플로우 체험 (superpowers·TDD 등)
3. 내가 쓸 실용 도구
4. 멘토 다음 과제 (주제 자유)

---

## 2. 후보 탐색 과정 (어떻게 좁혔나)

사용자 요청으로 **GitHub 레포(jjub0217) 50개 + 메모리 19개 + 대화 습관**을 분석해 후보 도출.

- 1차 후보 A~F: Claude Code 종속이 많아(B·C) 사용자가 "꼭 Claude Code 관련이어야 하나?" 지적 → 재도출.
- "상품(마켓플레이스)·게시판(커뮤니티) 말고 다른 도메인" 추가 제약.
- 2차 후보 G·H·I·J 도출 (상세: `docs/brainstorm/2026-05-27-new-project-candidates.md`):
  - G. 시간 사용 시각화
  - H. 의사결정 매트릭스 (Decision Studio)
  - I. 색상 접근성 스튜디오 (A11y Color Studio)
  - **J. 학습 지식 그래프 (Learning Knowledge Graph)** ← 사용자 선택
- Claude가 추천한 건 H였으나, **사용자는 J를 선택**.

### 후보 J (선택됨) 정의
> 학습한 개념들을 노드·엣지로 — Obsidian의 그래프뷰를 학습 흐름 특화로

```
[입력]                      [처리]               [출력]
학습 로그 키워드        ┐                       ┌── 인터랙티브 그래프
블로그 글               │── 키워드 추출 ──────┤    (D3·react-force-graph)
관계 (수동 or 자동)     │   관계 매핑           │
                        ┘                       ├── "이 개념 → 다음 추천"
                                                │
                                                └── 학습 깊이 시각화
                                                    (이해도 색상 그라데이션)
```
- 강점: 학습 자산 활용 / 포폴: 그래프 시각화는 난도 높아 차별화 / 흔함도: 낮음 / 규모: 3~5주

---

## 3. 메타 요구사항 — "면접 설명력" (전부 채택)

사용자 핵심 요구: **면접에서 이 프로젝트를 *어떻게 만들었는지* 디테일하게 설명할 수 있을 것.**

사용자는 이미 면접용 재료를 만드는 습관(학습 로그·블로그·의사결정 기록·트러블슈팅)이 있으므로, 그 습관을 프로젝트 산출물로 흐르게 한다.

### 면접관이 묻는 6가지 → 대응 산출물 (전부 세팅하기로 결정)
| 질문 | 산출물 |
| --- | --- |
| ① 왜 만들었어요? | 설계문서(spec)의 동기·문제정의 |
| ② 기술 스택 왜 이걸로? | **ADR**(왜 이렇게 정했는지 이유를 적어두는 결정 기록) (`docs/decisions/`) |
| ③ 가장 어려웠던 부분은? | **빌드 저널** (`docs/journal/`) + 트러블슈팅 |
| ④ 성능/품질 어떻게? | 측정 기록 + 테스트(TDD) |
| ⑤ 아키텍처 설명 | 아키텍처 다이어그램 |
| ⑥ 다시 한다면? | 회고 노트 |

추가로 `docs/interview-prep.md`에 위 6질문 답을 **만들면서 라이브로** 채운다.

### 프로세스 자체도 면접 스토리
- **TDD 첫 체험** (사용자는 아직 TDD 미경험 — 이 프로젝트가 첫 시도 후보). 그래프의 파싱·관계매핑 로직은 순수 함수라 TDD 적합.
- **superpowers 워크플로우** (brainstorming → spec → plan → 구현) 자체가 "체계적 설계" 스토리.

---

## 4. 도구·워크플로우 결정

- **superpowers 사용** (brainstorming 스킬로 이 문서까지 옴).
- **TDD**: 이 프로젝트에서 *첫 체험* 시도하기 좋은 후보 (파싱·관계 로직 = 순수 함수). 단 강제는 아니고 사용자와 합의해 진행.
- 전역 `~/.claude/CLAUDE.md`의 개발 워크플로우(설계 합의 → 계획 문서 → 단계별 구현 + 검토)를 따른다.

---

## 5. 경로 전환 결정 (왜 이 폴더로 왔나)

- 원래 cuddle-market 경로에서 브레인스토밍 → 그 CLAUDE.md 규칙(PR base=develop, Notion DB, 마이그레이션 패턴 등)이 새 프로젝트를 오염시킴.
- Claude Code 세션은 cwd에 묶여 도중 경로 변경 불가 → **하이브리드 방식** 선택:
  - 이 세션에서 핸드오프/설계 문서 + 메모리 복사를 새 폴더에 세팅
  - 새 폴더에서 `claude` 새 세션 → plan + 구현
- 메모리는 새 경로(`~/.claude/projects/-Users-osejin-Desktop-knowledge-graph/memory/`)로 보편 피드백·사용자 습관만 복사 완료. 전역 CLAUDE.md는 자동 적용.

---

## 6. 사용자 작업·소통 습관 (꼭 지킬 것)

상세는 메모리 파일 참조. 핵심:
- **한국어**, 결론 먼저, 간결. 이해 안 되면 **ASCII·비유로 시각화**.
- 새 용어는 **출처 라벨링** (내장 고정값 / 임의 이름 / 표준 기능).
- **추측 금지** — 코드·파일·설정은 직접 읽고 확인 후 답. "됐다" 대신 **증거**(tsc/lint/테스트/실측).
- **설계 합의 전 코딩 금지.** 단계로 쪼개고 단계마다 확인.
- **main 직접 커밋 금지**, 작업 브랜치 → PR. **머지는 사용자가 직접** 수행.
- 트레이드오프로 선택지 제시 (옵션 + 장단점 + 추천 + 이유).
- "sp" = "네"(긍정). AskUserQuestion에 한글 직접 입력(영어 직역·유니코드 이스케이프 오타 주의).

---

## 7. 현재 상태 / 다음 단계 ★

> **2026-06-12 기준: dev/prod DB 분리 완료** — 로컬 = Supabase CLI + Docker 스택(dev) / 운영 = 기존 클라우드(prod). 로컬 테스트가 운영을 오염시키지 않음(마커로 증명). (ADR 0012 · 이슈 #47 · PR #48). 그 전 **DB+인증 마일스톤도 완료**(로그인→서버 저장·복원·멀티기기, https://knowledge-graph-lyart.vercel.app, 이슈 #38). **다음 새 마일스톤 = 로드맵 3(velog 추출 정교화)** / Kakao 제공자(선택).

### 완료
- [x] **설계 전부**: spec(`docs/specs/2026-05-29-knowledge-graph-design.md`) · 구현 계획(`docs/plans/2026-05-29-knowledge-graph-mvp.md`, 11개) · **ADR 0001~0009**
- [x] **Task 1~6 (로직·토대)**: 셋업+게이트 · 공유 타입 · 추출기(TDD) · 저장소(localStorage+JSON) · 그래프 연산+zustand 스토어 · velog 라우트. 유닛 테스트로 검증.
- [x] **Task 7 입력 UI**(InputPanel: .md 업로드 + velog URL) · **Task 8 후보 확인 UI**(CandidateReview, **RTL 컴포넌트 테스트 첫 도입**)
- [x] **Task 9 그래프 화면**(GraphView, react-force-graph-2d): 점·선 렌더, 같은 주제=같은 색, 고립·약연결(degree≤1)=회색·크게, 점 2번 클릭=연결, 선 클릭=삭제, 라벨 항상 표시(`nodeCanvasObjectMode='after'`), page에 localStorage 저장/복원 조립
- [x] **GitHub 셋업**(공개 repo) + 워크플로 컨벤션(`docs/conventions.md`, ADR 0007) + **Kimi 코드리뷰**(ADR 0008) + 이슈→브랜치→PR→리뷰→사용자 머지 흐름 가동
- [x] **추출기 노이즈 1단계 수정**(펜스 코드블록 제외, TDD, ADR 0009) · **로드맵 우선순위 재배치**(배포→추출 정교화 우선)
- [x] interview-prep ③/④ + 빌드 저널 + 주간 학습 로그 라이브 갱신 · velog 글에 TDD·RTL·E2E 섹션 게시
- [x] **Task 10 검색 + 주제 필터**(SearchFilter + `filterGraph`·`uniqueTopics` **TDD 둘째 사이클**, PR #23) · 주제 입력칸 라벨 UX(#21, PR #24)
- [x] **Task 11 페이지 컨트롤**(Controls: JSON 내보내기/가져오기 + 점 삭제, PR #26) → **MVP 완성**
- [x] **로드맵 재배치**(DB·인증 7→2, **ADR 0010**, PR #28) · **고립 강조 degree 0으로 수정**(#29, PR #30 — Kimi가 키 불일치 버그 발견)
- [x] **배포**(Vercel + GitHub 자동 배포, PR #35·이슈 #33): 예시 그래프 시드(첫 방문, `example-graph.ts` + `hasStoredGraph` TDD) + 비우기 버튼. 라이브 https://knowledge-graph-lyart.vercel.app — `/api/velog` serverless 동작을 실제 호출로 확인.
- [x] **DB + 인증 (로드맵 2, 이슈 #38) — Task 1~7**: 하이브리드(Supabase + 직접 쓴 `/api/graph` 라우트) · 정규화 스키마(`nodes`·`edges` + `user_id` FK + RLS) · 쿠키 세션(`@supabase/ssr`) · Postgres RPC `replace_graph`로 원자적 저장(반쪽 저장 차단) · **Google 로그인** · `storage.ts` 비동기 전환(로그인→서버 / 비로그인→예시, `hasStoredGraph`·localStorage 제거) · `page.tsx` 통합(async 로드 + auth 상태 구독 + 디바운스 저장). **ADR 0011** · spec/plan `2026-06-08-db-auth` · `rowsToGraph` **TDD 셋째 사이클**. **Task별 작은 PR #39·#41~#45**(큰 PR은 Kimi 빈 응답 → 분할). 브라우저로 로그인·저장·복원 검수 완료. Vercel 환경변수 등록. **Task 8 수동 검수(멀티기기·DB 행 증거·배포본) 통과(PR #46)** — Kakao만 선택 잔여.
- [x] **dev/prod DB 분리 (이슈 #47 · PR #48 · ADR 0012)**: Supabase CLI + 로컬 Docker 스택(dev) / 기존 클라우드(prod). baseline 마이그레이션으로 스키마를 코드로(git) + 로컬 Google 로그인(`config.toml`). **마커 검증으로 분리 증명.** 디버깅 2건(권한 grant 누락→500 / 운영 Site URL=localhost 잠복버그)은 빌드 저널·interview-prep에 기록.

### 다음 단계 ★

**직전 완료**: DB+인증(이슈 #38) + **dev/prod DB 분리**(이슈 #47 · ADR 0012 · PR #48). 로컬은 Supabase CLI + Docker 스택, 운영은 클라우드로 분리됨.

**다음 새 마일스톤 후보 (로드맵 순):**
- **로드맵 3 — velog 추출 정교화**: 줄글에서 핵심 개념만 더 잘 뽑기 + '개념 아님' 판별 필터(ADR 0009에서 보류한 2단계 재검토).
- (선택) **Kakao 제공자 추가** — Google로 흐름 검증됨. Kakao Developers 앱 발급 + Supabase Providers(운영) + `config.toml`(로컬) 등록. (AuthButton에 버튼은 이미 있음, 지금 누르면 에러가 정상.)

**공통 흐름**: 이슈 생성 → 브랜치(`타입/N-설명`) → 구현(코드는 **사용자가 직접 타이핑**, Claude는 제시만) → tsc/테스트 → 커밋·푸시 → PR → Kimi 리뷰 → **사용자가 직접 머지**.
- ⚠️ **큰 작업은 처음부터 작은 PR로 분할**(Kimi 빈 응답·토큰 방지).
- ⚠️ 자동 테스트(특히 인증·DB·캔버스)는 mock이라 "통과 ≠ 동작" → **수동 검수가 진짜 게이트**.
- ⚠️ 새 라우트는 **폴더 = URL** 주의(404).
- ⚠️ **로컬 개발은 `supabase start`(Docker) 먼저** — `.env.local`이 로컬 스택(127.0.0.1:54321)을 봄. `supabase db reset` 뒤엔 로컬 사용자가 지워져 **재로그인** 필요. (dev/prod 분리 결과 — 상세 ADR 0012 · plan `2026-06-11-dev-prod-db-separation`.)

### 미뤄둔 것 / 후속 (별도 이슈 후보)
- **추출 노이즈 2단계**(문장형 제목·경로 등 "개념 아님" 거르기) — ADR 0009에서 보류(사람 확정이 흡수). 필요해지면 별도 이슈.
- **Kimi 워크플로 견고화** — 큰 PR diff(예: 421줄)에서 리뷰 빈 응답 재현(추론이 `max_tokens:4000` 소진). **현재 우회 = PR을 Task별로 작게 분할**. 근본 해결은 `max_tokens` 상향 또는 content 비면 `reasoning` 폴백(후속).
- **GraphView 개선**(다음 반복): 연결 시작점(pending) 시각 표시 없음.
- **채택 후 주제(색) 변경**(#22, 대기) · 고립 강조 **B안**(색=주제 / 고립=별도 채널인 테두리·크기) 검토 여지.

### 기술 스택 (확정 — ADR 참조)
- Next.js 16 · React 19 · TypeScript 5 · Tailwind 4 · Vitest 4 · **react-force-graph-2d**(2D 전용) · zustand · @testing-library/react(RTL) (ADR 0003·0005·0006).
- **DB/인증**: **Supabase**(Postgres + Auth) · `@supabase/ssr`(쿠키 세션) · 정규화 스키마 + RLS + Postgres RPC. 환경변수 `NEXT_PUBLIC_SUPABASE_URL`·`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`(Supabase 신규 키명, 옛 anon). (ADR 0011)
- **개발 환경 분리**: dev = **Supabase CLI 로컬 Docker 스택**(`supabase/config.toml`·`migrations/`, `supabase start`) / prod = 클라우드. 로컬 시크릿은 `.env`, 로컬 스택 주소는 `.env.local`. (ADR 0012)

---

## 8. 새 세션 시작 가이드 (사용자용)

새 터미널에서:
```bash
cd ~/Desktop/knowledge-graph
claude
```
이제 프로젝트 `CLAUDE.md`가 자동 로드되며 "세션 시작 시 docs/HANDOFF.md 먼저 읽어라"라고 지시함. 따라서 첫 메시지는 간단히:
> **"이어서 진행해줘"**

Claude는 CLAUDE.md 지시에 따라 이 문서를 읽고 "7. 다음 단계"의 **A. Task 8 마무리**(DB+인증 검수·Kakao) 또는 **B. Task 9**(dev/prod DB 분리, 설계부터)를 사용자와 정해 시작한다.

(MVP + 배포 + DB+인증 Task 1~7 완료·머지됨. 구현은 작업 브랜치 `feat/N-설명` → 작은 PR → Kimi 리뷰 → 사용자 머지.)
