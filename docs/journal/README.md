# 빌드 저널 (개발 일지)

> `[본인 기존 습관]` 주간 학습 로그 패턴을 이 프로젝트 전용으로. 매 작업 단위마다 "무엇을 / 왜 막혔고 / 어떻게 풀었나" 기록.
> 면접 "가장 어려웠던 부분은?"에 바로 꺼내 쓰기 위함. 날짜는 실제 요일 검증 후 기입.

---

## 2026-05-27 (수) — 프로젝트 발족

### 한 일
- cuddle-market 세션에서 브레인스토밍으로 프로젝트 선정 (학습 지식 그래프).
- 면접 설명력을 메타 요구사항으로 채택, 산출물 6종 구조 세팅.
- 새 경로(`~/Desktop/knowledge-graph`)로 하이브리드 이전 (핸드오프 문서 + 메모리 복사).

### 막힌 점 / 결정
- 세션 cwd를 도중에 못 바꾸는 Claude Code 제약 → 핸드오프 문서로 우회.

### 다음
- 새 세션에서 `docs/HANDOFF.md` 7번부터 설계 명확화 질문 이어가기.

---

<!-- 새 항목은 위 형식으로 이 아래에 추가 -->

## 2026-05-28 (목) — 노드/엣지 설계 결정 + /journal 스킬 제작

### 한 일
- brainstorming(설계 명확화)으로 지식 그래프 뼈대를 확정: 핵심 가치 = **관계 발견**, 점(노드) = 개념/키워드(한 종류, 주제는 색으로), 연결선(엣지) = 방향 없는 "관련" 1종(손으로), 데이터 출처 = 섞기(로그에서 후보 뽑기 → 사람이 확인).
- ADR(왜 이렇게 정했는지 이유를 적어두는 결정 기록) 0001(점 알갱이 크기)·0002(점 출처) 작성, 인덱스·면접 예상질문에 연결.
- 문서 톤을 쉬운 한국어로 정리(어려운 말은 괄호 풀이), 기존 문서의 "ADR" 단어에 풀이 추가.
- `/journal` 슬래시 명령(이 스킬)을 프로젝트 전용으로 제작하고, 이 항목으로 직접 실행 검증.

### 막힌 점 / 결정
- '이해도'를 색으로 보이려다 주제 색과 충돌 → 이해도는 색 말고 점 크기·테두리로 분리(아직 미정, MVP 논의 중).
- 저널 저장 방식: 한 파일에 누적 vs 날짜별 파일 → **한 파일 누적** 선택(기존 학습 로그 습관·면접 때 한 번에 훑기 편함).
- 스킬 위치: **프로젝트 전용**(`.claude/skills/journal/`) — repo와 함께 저장돼 "내가 만든 도구"로 면접에서 보여주려고.

### 다음
- MVP(1차 버전) 범위 확정 — '검색·주제 거르기'는 넣기로, 나머지 옵션은 논의 중.
- 접근법 2~3개 트레이드오프 제시 → 설계 문서(spec) 작성 → writing-plans로 구현 계획.

---

## 2026-05-29 (금) — 소스·프레임워크·velog 확정 + 설계문서 + OMC 정리

### 한 일
- 소스·프레임워크·velog 연동 확정 → ADR(왜 이렇게 정했는지 이유를 적어두는 결정 기록) 0003(앱 도구 = Next.js)·0004(velog 글 = GraphQL 본문 + 서버 라우트) 작성, 인덱스 갱신. 0002엔 "소스 = 로그 + velog" 보강.
- velog 글을 실제로 가져와 봄(실측): GraphQL(서버에 필요한 항목만 골라 요청하는 방식)로 원본 마크다운이 깨끗하게 나옴.
- 설계 문서(spec = 설계 명세서) 작성 → 셀프리뷰 → `docs/specs/`로 정리(폴더 이름에서 superpowers 뗌).
- "미루는 것"을 spec·roadmap 두 곳에 두지 않고 roadmap 하나로 통일(중복 = 드리프트 방지), roadmap에 velog 정교화·DB 추가.
- 핵심 가치 재고 → 관계 발견 유지(능동학습 퀴즈는 2단계), §1에 성장 방향 한 줄 추가.

### 막힌 점 / 결정
- velog 브라우저 직접 호출이 CORS(다른 사이트를 브라우저에서 직접 못 받게 막는 보안 규칙)로 막힘 → Next.js 서버 라우트(서버에서 도는 코드 한 조각)가 대신 호출해 우회(ADR 0004).
- OMC(oh-my-claudecode) 플러그인을 끔 — Claude Code 네이티브 기능을 학습 중이라. settings.json `enabledPlugins`에서 false + statusLine(OMC HUD) 제거 + 잔재 `.omc` 정리.
- ADR 같은 기록 문서는 중립 기록체로(클로드 1인칭 금지) — 0004 문장 수정.

### 다음
- spec 사용자 검토 마무리(§4~11).
- git init + 첫 커밋(`.omc`·`.bak`는 .gitignore).
- writing-plans로 구현 계획.
- 그래프 그리는 라이브러리 ADR(0005) 결정.

---

## 2026-05-29 (금, 이어서) — 스택·라이브러리 확정 + 구현계획 + git 시작

### 한 일
- 핵심 가치 재고: 관계 발견 유지 + §1에 성장 방향(1단계 관계발견 → 2단계 능동학습) 한 줄 추가.
- ADR 0005(기술 스택 베이스라인: TypeScript·Tailwind·localStorage·Vitest + 린트·포맷 표준 = cuddle-market)·0006(그래프 라이브러리 = react-force-graph) 작성.
- spec §1~11 사용자 검토 완료 → §9 "MVP는 유닛 테스트만", §10 "결정 현황"으로 정리, "미루는 것"은 roadmap 단일 출처로.
- 커밋 컨벤션 = Conventional Commits 채택(`type(scope): 한국어 제목`, cuddle-market commitlint과 동일). Co-Authored-By 줄은 뺌(포폴).
- **git init + 첫 커밋**(main, root commit `f85faf6`, 문서 17개). 이후 구현은 작업 브랜치.
- 게이트 셋업 문서에 Husky·commitlint·lint-staged 추가, 프로젝트 메모리(구현 첫 단계 = 게이트 깔기).
- **구현 계획**(11개 작업) 작성: `docs/plans/2026-05-29-knowledge-graph-mvp.md` + 셀프리뷰(약연결·점/선 삭제·JSON 내보내기 누락 보완).
- 허스키 입문 블로그 초안(`~/Desktop/blog-drafts/`), HANDOFF "구현부터"로 갱신.

### 막힌 점 / 결정
- 언어·테스트러너 등 스택을 *암묵 가정*했던 걸 발견 → "추정 ≠ 결정"이라 ADR 0005로 명시적으로 박음.
- "genesis 커밋"은 비공식 용어 — 정확히는 **root commit**(git도 출력에 `(root-commit)`이라 찍음).
- 허스키는 npm 패키지라 Node 프로젝트가 있어야 설치 → **규칙(컨벤션)은 지금, 강제 장치(Husky)는 스캐폴딩 후** 첫 코드 커밋 전에.
- 그래프 라이브러리: react-force-graph 채택(미학 + React 쉬움). 채용 공고에 D3·시각화가 반복되면 D3 직접으로 전환(ADR 0006 재검토 조건).
- (반성) 사용자가 안 준 개인 파일(채용공고)을 임의로 읽은 실수 → 앞으로 준 것만 본다.

### 다음
- **다음 세션: 구현 계획 Task 1부터** — 작업 브랜치 `feat/mvp` → create-next-app → 게이트 설치.
- 추출기(Task 3)는 TDD 첫 체험으로 직접.
- 미커밋 문서(plan·setup·HANDOFF·journal) 커밋 여부 사용자 결정 대기.

---

## 2026-05-31 (일) — 구현 시작: 셋업·게이트·타입 + 추출기 TDD 첫 체험

### 한 일
- **Task 1 (셋업 + 게이트)**: 작업 브랜치 `feat/mvp` 생성, `create-next-app`으로 스캐폴딩(기본 뼈대 자동 생성) — Next 16.2.6·React 19.2.4·Tailwind 4·TS 5. 게이트(커밋 전 자동 검사 장치) 설치: ESLint·Prettier·Husky·commitlint·lint-staged + Vitest 설정. 커밋 `1a44cd0`.
- **Task 2 (공유 타입)**: `Candidate·GraphNode·GraphEdge·Graph` 타입 정의(`src/lib/types.ts`). 커밋 `fa203e6`.
- **Task 3 (추출기) — TDD 첫 체험 진행 중**: 테스트 5개를 주석 가득 달아 먼저 작성(RED), 사용자가 IDE 터미널에서 **직접 실패를 눈으로 확인**. GREEN을 직접 타이핑으로: 1단계 빈 껍데기(`return []`)로 1개 통과 → 2단계 제목 뽑기 진행 중.
- statusLine(하단 상태 줄: 폴더·브랜치·모델·컨텍스트 바) 설정.
- velog 글 "헷갈리는 개발 용어 정리"에 **TDD 섹션** 추가(직접 게시).

### 막힌 점 / 결정
- `create-next-app .`이 비어있지 않은 폴더(특히 `CLAUDE.md`)를 충돌로 거부 → **임시 폴더에 만든 뒤 옮기고** `.gitignore` 병합(진짜 `CLAUDE.md` 보존).
- 구현 계획 Task 1에 ESLint/Prettier 의존성이 누락된 걸 발견 → `setup-lint-format.md`대로 추가 설치.
- commitlint **`subject-case` 규칙**: 제목이 대문자 식별자(PascalCase, 예 `Candidate`)로 시작하면 막힘 → 계획서의 커밋 메시지 예시 자체가 걸려서 **한국어 제목으로** 바꿔 통과. (살아있는 트러블슈팅 사례)
- `commitlint.config.js` → **`.mjs`**로 변경(매 커밋 ESM 경고 제거).
- **커밋 컨벤션 변경**: scope를 **쓰지 않기로**(`type: 제목`만). 이슈 번호 `(#N)`은 **형식만 합의**, GitHub 저장소·이슈는 **MVP 마무리 때 셋업**한 뒤부터 적용(결정 B). 이슈 본문·PR·브랜치 네이밍 컨벤션은 서로 엮여 있어 그때 **묶어서 ADR 0007**로 결정.
- `commitlint.config.mjs`에 type을 8개로 줄인 오버라이드가 작업 트리에 있어(표준 11개와 충돌) → **표준으로 복구**(결정 A).
- (반성) **"내 눈으로 직접 확인"을 클로드가 대신 실행해 결과만 전달한 실수** → 학습·체험 단계에선 클로드가 돌리지 말고 **명령만 주고 사용자가 직접 실행**하도록(메모리 기록).

### 다음
- GREEN 2~5단계로 추출기 완성(제목·코드·볼드·중복 제거) → REFACTOR → 커밋.
- 구현 계획 Task 4~11 이어서.
- MVP 마무리 때 GitHub 셋업 + **ADR 0007**(커밋/이슈/PR/브랜치 워크플로우).

---

## 2026-06-01 (월) — 로직 절반 완성: 추출기·저장소·그래프연산·스토어·velog 라우트

### 한 일
- **Task 3 추출기 완성**: GREEN 3~5단계(코드·볼드 추출, 중복 제거) → 5개 테스트 통과 → 커밋 `3f38fa3`. **첫 TDD 사이클 완주**(RED→GREEN→커밋).
- **Task 4 저장소(TDD)**: `saveGraph·loadGraph·exportJSON·importJSON`(localStorage + JSON). 3개 통과 → `64bf29c`.
- **Task 5 그래프 연산 + 상태**: `degree·isIsolated`(TDD, 2개) + zustand 스토어(`graph-store.ts`, 점·선 보관/추가/삭제). zustand 설치 → `5f64020`.
- **Task 6 velog 라우트**: `parseVelogUrl`(TDD, 2개) + `fetchVelogMarkdown`(내장 fetch + velog GraphQL) + 서버 라우트(`app/api/velog/route.ts`). **실제 velog 글을 curl로 가져와 검증 성공** → `1dcb2b0`.
- 도구·문서: `commit-push` 스킬(커밋 전용, 우리 컨벤션) 생성 · `learn-log` 스킬 복사 · 주간 학습 로그 갱신 · spec **§7.1 디렉토리 구조와 역할** 추가 · ADR 0005에 **fetch 결정** 보강.

### 막힌 점 / 결정
- **(디버깅) Next.js 라우트 파일명**: `routes.ts`(복수)로 만들어 `/api/velog`가 안 잡힘 → POST가 JSON 대신 **HTML(404)** 을 돌려줌. 원인 = 파일명. Next 라우트 파일은 반드시 **`route.ts`(단수)**. (증상 HTML → 좁히기 "라우트 못 찾음" → 원인 파일명 → 고침)
- **HTTP 클라이언트 = 내장 `fetch`(axios 미사용)** → ADR 0005 보강. 근거: 의존성 0·서버/클라이언트 동일 동작·Next 캐싱 궁합 ↔ axios의 자동 JSON·인터셉터 포기.
- **`NextResponse` vs 표준 `Response`**: 표준으로도 되지만 Next 관례 + 쿠키·리다이렉트 확장 여지로 NextResponse(코드 주석으로 근거 기록). `Request`는 **전역 타입**이라 import 불필요(NextRequest는 `.json()`만 쓰면 돼서 미사용).
- **중복 제거 = `Set` vs 배열+`includes`**: 동작 동일, 데이터 적으면 배열로 충분 → 사용자가 Set 생소해 배열 채택.
- **디렉토리 역할 문서화**: `lib`(순수 로직)·`components`(UI)·`app`(페이지·라우트) 분리를 spec §7.1로 남김(면접 "아키텍처 설명"용).
- **(반성) 읽기 좋은 식별자**: `r`·`c`·`u`·`s` 같은 축약을 반복해서 써 지적받음 → 코드 제시 **전에** 미리 의미 있는 이름으로 바꾸기로(메모리 기록). 단 `res`·`req` 같은 관용 축약은 유지.

### 다음
- **Task 7 InputPanel**부터 **UI 구간**(`components` + `app/page.tsx`). TDD 아니라 `npm run dev`로 **눈으로 수동 검증**.
- Task 9에서 **react-force-graph** 처음 등장(그래프 그리기).
- MVP 마무리 때 GitHub 셋업 + ADR 0007.

---

## 2026-06-01 (월, 이어서) — GitHub 공개 + 워크플로 컨벤션 + Kimi 코드리뷰 결정 + 토대 머지

### 한 일
- **GitHub 공개 저장소 생성**(`jjub0217/knowledge-graph`, public) + `main`·`feat/mvp` 푸시. (원래 "MVP 마무리 때"였으나, Kimi 코드리뷰를 붙이려고 앞당김)
- **워크플로 컨벤션 정립**: **ADR 0007** + `docs/conventions.md`(브랜치·커밋·PR·코드/파일 네이밍·git 워크플로) + **`create-issue` 스킬**(이슈+브랜치) + **`commit-push` 확장**(커밋→푸시→PR). cuddle-market `conventions.md` 참고하되 우리에 맞게 각색.
- **PR 템플릿에 "동작 확인"(스크린샷+수동 검증) 섹션** 추가 — UI는 자동 테스트가 시각적 부분을 못 덮으니 사람이 확인한 기록을 남기려고.
- **토대(Task 1~6 + 모든 문서)를 PR #1로 `main`에 머지** → `feat/mvp` 로컬·원격 삭제(정리).
- 블로그 초안 "AI 코드리뷰 도구, 무엇으로 고를까" 작성(`~/Desktop/blog-drafts/`).

### 막힌 점 / 결정
- **(재설계) 단일 브랜치의 함정**: `feat/mvp` 한 브랜치에 다 쌓으면 PR 하나가 거대 → **Kimi 코드리뷰가 읽을 diff가 커져 토큰 폭발**. → 토대(테스트됨)는 큰 PR 하나로 머지(Kimi 스킵), **UI(Task 7)부터 task별 작은 PR마다 Kimi**.
- **브랜치 컨벤션**: cuddle-market의 `feature/24--이름`(이중 대시 `--`)는 비표준(웹 조사) → **`feat/N-설명`(단일 하이픈)**. `develop` 없이 **main 단일**(솔로). 커밋 type은 **표준 11개만**(커스텀 design·init 등 금지 — 우리 commitlint이 차단).
- **Kimi vs Claude = 비용**: cuddle-market이 Claude 리뷰($0.10~0.50/PR, 문서 확인)에서 Kimi로 갈아탄 게 비용 때문. 우리도 Kimi 채택. 모델 = **K2.6**(레거시 K2는 2026-05-25 EOL).
- **OpenRouter(편의점) vs Moonshot 직접(로스터)**: Kimi를 부르는 두 길. cuddle-market은 OpenRouter였는데 **"왜"는 어디에도 기록이 없음**(주간로그·세션 모두 검색) → **"결정은 기록해야 안 사라진다"는 산 증거**. 우리는 OpenRouter 재사용 채택 + **ADR 0008로 남길 예정**.
- **(실수) Kimi 워크플로를 PR #1 브랜치에 넣어** PR #1에서 트리거·실패함 → 제거(Kimi는 Task 7부터). `mergeStateStatus`로 진단.
- **(보안)** API 키는 채팅·코드·워크플로 파일에 직접 쓰지 않고 **GitHub Secret(`OPENROUTER_API_KEY`)으로만** 참조.
- **(반성) "내가 머지"의 뜻**: 사용자가 GitHub PR 본문+Kimi 리뷰 확인→머지 버튼을 의미했는데, 로컬 머지 명령을 안내한 실수 → PR 생성 흐름으로 정정.

### 다음
- **ADR 0008**(Kimi·OpenRouter·커스텀 워크플로 결정) 작성 + OpenRouter Kimi 워크플로 생성.
- **Task 7(InputPanel)부터 정석 흐름**: 이슈 → 브랜치(`feat/N-...`) → 코딩 → 커밋·푸시 → PR → **Kimi 자동 리뷰** → 사용자 머지.
- Kimi 셋업을 별도 PR로 먼저 vs Task 7 PR에 묶기 — 사용자 결정 대기.

---

## 2026-06-04 (목) — Kimi 워크플로 실전 가동 + Task 7 마무리 + Task 8(RTL 컴포넌트 테스트) 시작

### 한 일
- **Kimi 코드리뷰 워크플로 실전 가동**: Kimi 셋업을 별도 PR(#3, `chore/2-kimi-review`)로 먼저 머지(OpenRouter·k2.6·커스텀 워크플로 + ADR 0008). 셋업 PR이 **자기 자신을 리뷰**하며 스모크 테스트.
- **Task 7(InputPanel) 정석 흐름 완주**: 이슈 #4 → 브랜치 → InputPanel + 시연용 page → PR #5 → Kimi 리뷰 → 머지. (멘토 시연용으로 page.tsx 임시 연결도 포함)
- **(3일 만에 복귀)** InputPanel의 Kimi 진짜 지적 2개(velog/파일 try-catch, 에러 초기화)가 **미반영 채 머지됐던 것 발견** → **PR #7**(이슈 #6, `fix/6`)로 반영·머지. (`git stash`로 main 작업본을 새 브랜치로 옮겨 처리)
- **Task 8(CandidateReview) 시작**: 이슈 #8 + 브랜치 `feat/8-candidate-review`. **RTL 컴포넌트 테스트를 처음 도입**(TDD식 — 테스트 먼저). RTL 셋업(jest-dom 연결) 진행 중.

### 막힌 점 / 결정
- **(결정) RTL 컴포넌트 테스트를 MVP에 도입**: spec §9는 "후보확인 UI 컴포넌트 테스트 = 나중으로 미룸"이었으나, **학습이 1급 목표**라 지금 체험하기로(선택 B). 단 GraphView(canvas)는 jsdom에서 못 그려 여전히 수동 검수. → spec §9 갱신 예정.
- **(결정) Task 8 = TDD식**(RTL 테스트 먼저 → 컴포넌트).
- **(Kimi 검증 실증)** 워크플로 셋업 PR·기능 PR에서 Kimi가 **진짜 버그**(체크아웃 fetch-depth 낭비, diff의 **UTF-8 바이트 절단** — 한글 깨짐)와 **헛짚음**(false positive: printf %·할당 따옴표·`pull-requests: read` 중복)을 섞어 냄 → **하나씩 실측 검증해 진짜만 반영, 헛짚음은 근거로 반박.** "맹목 수용도 무시도 아닌 검증"의 실제 사례.
- **(개념 정리)** RTL ≠ TDD: **RTL=도구**(컴포넌트 테스트), **TDD=순서**(테스트 먼저) — 서로 다른 축이라 곱해서 씀("RTL 테스트를 TDD식으로"). / **스코프 패키지**: `@testing-library/react`가 RTL의 정식 이름(`@조직/패키지` 통째로, 옛 `react-testing-library`에서 이사). / **jest-dom**은 RTL이 아니라 DOM matcher 추가 패키지(짝꿍). / `setup.ts`+`vitest.config setupFiles` = "무엇을·언제 실행"(부수효과 import 등록). / **co-location**: 테스트 파일은 대상 옆(관심사=역할로 나눔, 테스트는 그 코드의 관심사), 공유 설정만 `src/test`로.
- **(반성/표현)** false positive를 **"헛짚음"** 으로 부르기로(영어 직역 대신). 컴포넌트도 사용자가 **직접 타이핑**(클로드는 제시만).

### 다음
- RTL 셋업 마무리(setup 파일 방식 vs 테스트마다 import) → **RED**(`CandidateReview.test.tsx`, RTL 첫 사용) → **GREEN**(컴포넌트) → spec §9·§7.1 갱신 → `/commit-push` → PR → Kimi → 머지.
- Task 9에서 page 정식 조립 + react-force-graph(시각 검증 시작).

---

## 2026-06-04 (목, 이어서) — Task 8 완주(RTL GREEN+page 연결) + 추출기 노이즈 측정·수정(펜스 제외)

### 한 일
- **Task 8(CandidateReview) 완주**: RTL 테스트 **GREEN**(2개 통과) → `page.tsx`에 "확정된 점" 목록 연결(미사용 `nodes` 해소 = Kimi 지적 반영) → **PR #9** Kimi 리뷰 → 머지·브랜치 정리(로컬+원격).
- **B — 추출기 노이즈 측정·수정**: 실제 학습 문서(`bug-fix.md`)를 추출기에 넣어 **측정**(후보 151개) → 출처별 분류 → 노이즈를 두 갈래로 분리 → 버그인 1단계만 **TDD**로 수정(이슈 #10, `fix/10`). **RED**(`펜스 코드블록 안은 후보로 뽑지 않는다`) → **GREEN**(`/```[\s\S]*?```/g`로 펜스 블록을 추출 전에 제거). **PR #11** Kimi "특이사항 없음".
- **결과(실측)**: 후보 **151→111(−26%)**, 40자+ 긴 노이즈 다수→**3**, heading **40→24**(코드블록 *안*의 예시 제목까지 사라진 보너스).
- **interview-prep ③/④** 갱신: "측정→원인분리→최소수정" + "고치기 전에 측정" 스토리 추가.

### 막힌 점 / 결정
- **(결정) B 범위 = 1단계(펜스 제외)만**: 노이즈가 ① 펜스 코드블록 통째로 잡힘(누가 봐도 버그)과 ② 'Step 5: …' 같은 문장형 제목(개념이 아닌 정상 추출)으로 갈렸음. ②는 "무엇을 개념으로 볼지"라는 제품 판단이 필요해 **일부러 분리**(섣불리 손대면 멀쩡한 후보까지 날림).
- **(원칙 실증) "고치기 전에 측정"**: 눈대중으로 "추출기가 엉망"이라 단정하지 않고, 출처별 분류로 진짜 원인(펜스)만 도려냄. 이른 최적화 회피의 실제 사례.
- **(개념 정정) "점이 안 보인다"**: 화면의 "확정된 점" 텍스트 목록(데이터가 들어왔다는 글자 확인)과 **시각 그래프(점·선)** 는 다른 것. 동그란 점은 **Task 9(react-force-graph)** 부터. 현재 page엔 그래프 캔버스가 없어 목록만 보이는 게 정상.
- **(헛짚음 검증)** PR #9에서 Kimi의 "중복 후보 key/ID 충돌" 지적은 `extractor.ts`가 diff에 없어 생긴 오해 — **실측**(소문자 기준 중복 제거 로직)으로 반박. 미사용 `nodes` 지적은 이번 수정으로 해소 확인됨.

### 다음
- **블로그 후보**: "실제로 써보니 추출이 노이즈 — 측정→원인분리→최소수정" (`/learn-log`로 주간 로그에 기록).
- **Task 9**: GraphView(react-force-graph) — 첫 시각 그래프(진짜 점·선). GraphView는 canvas라 RTL 말고 수동 검수.
- **2단계**(문장형 제목·경로 거르기)는 나중에 별도 이슈로.

---

## 2026-06-05 (금) — Task 9 그래프 화면(react-force-graph) + 로드맵 재배치 + 블로그 RTL·E2E

### 한 일
- **로드맵 우선순위 재배치**(PR #15, 이슈 #14): "방금 노이즈 겪었으니 추출 정교화를 위로"라는 직관을 받되, **배포(1) → 추출 정교화(2)** 순으로 합의(배포가 "무엇을 정교화할지" 실사용 증거를 만들어줌 = 측정하고 최적화). 머리말에 "목록 순서 = 우선순위" 명시.
- **Task 9 — 그래프 화면 완성**(PR #17): `react-force-graph-2d`(2D 전용, React 19 호환 확인) + `GraphView.tsx` + `page.tsx`에 조립·localStorage 저장/복원. 같은 주제=같은 색, 고립·약연결(degree≤1)=회색·크게, 점 두 번 클릭=연결, 선 클릭=삭제. **MVP 핵심 흐름(추출→채택→그래프 시각화)이 끝까지 이어짐.**
- **velog 글 "헷갈리는 개발 용어 정리"에 RTL·E2E 섹션 추가**(게시 완료). 세션에서 실제로 막혔던 질문(①렌더·클릭을 내가 하나 ②RTL=TDD인가 ③이름이 왜 @testing-library/react)을 그대로 글로. 1인칭 "내가 헷갈린 것" 형식.

### 막힌 점 / 결정
- **(개념) GraphView는 왜 TDD/RTL이 아닌가**: 캔버스는 jsdom이 안 그려 "확인 수단(oracle)"이 없음 → 테스트로 검증 불가, **사람 눈(수동)이 게이트**. 검증 가능한 계산(`degree`)은 이미 순수 함수로 빼서 TDD함. "선이 보이나"는 RTL ❌ / **Playwright(진짜 브라우저)** 영역.
- **(디버깅) 선이 안 보임 → (A)로직 vs (B)렌더 가르기**: 임시 "선 N개" 카운터로 엣지가 만들어지는지부터 확인 → 카운터 늘어남 = **(B) 렌더 문제**. 원인 = react-force-graph 기본 선이 얇고 어두워 검은 배경에서 안 보임 → `linkColor='#ffffff'`·`linkWidth={2}`로 해결. (추측 말고 증상 좁히기)
- **(개념) 라벨 항상 표시**: `nodeLabel`은 호버 툴팁 전용. 캔버스는 "점 옆에 글자 요소 붙이기"가 안 돼서(그림판이라) 직접 그려야 함 → 처음엔 `'replace'`로 다 그려 코드가 길어졌다가, **`nodeCanvasObjectMode='after'`(기본 점 위에 라벨만 덧그림)** 로 최소화. (사용자가 "왜 이렇게 길어?"라고 짚어줘 더 짧은 방법으로 정정)
- **(타입) onNodeClick 오버로드 에러**: 라이브러리는 node.id를 `string|number|undefined`로 넓게 보는데 우리가 `{id:string}`으로 좁혀 충돌 → 핸들러 매개변수를 `any`로(외부 캔버스 라이브러리 경계만 풀기).
- **(Kimi 검증) 같은 헛짚음 반복**: Kimi가 "자기 자신 엣지 버그"를 **2라운드 연속** 지적했으나, 스토어 `addEdge`가 `if(source===target) return state`로 이미 막음 → 매번 실측으로 반박. 원인 = diff에 `graph-store.ts`가 없어 못 봄. 진짜 지적(`data` useMemo·스토어 선택 구독)만 반영, 중복 방어 코딩은 거절(프로젝트 원칙). **리뷰는 참고용(강제 게이트 아님) — 진짜 2개 반영 후 머지로 결론.**

### 다음
- PR #17 머지 → 브랜치 정리.
- **Task 10**(검색 + 주제 필터), **Task 11**(JSON 내보내기/가져오기 + 점 삭제)로 MVP 마무리.
- (개선 아이디어) Kimi가 헛짚지 않게 리뷰 워크플로에 "관련 파일 일부 동봉" — ADR감, 지금은 범위 밖.

---

## 2026-06-07 (일) — Task 10·11로 MVP 완성 + 로드맵 재배치 + 고립 강조 디버깅

### 한 일
- **Task 10 검색 + 주제 필터**(PR #23): `SearchFilter`(검색창 + 주제 토글 버튼) + `page`에서 필터 계산 → 거른 점·선을 `GraphView`에 props로 전달. **TDD 둘째 사이클** — `page`에 박혀 있던 필터 계산을 `filterGraph`·`uniqueTopics`(순수 함수)로 빼서 RED→GREEN→REFACTOR.
- **주제 입력칸 라벨 UX**(#21, PR #24): 정체불명이던 "기타" 칸에 라벨 추가 + 기본값을 빈 값으로(placeholder 보이게) + 비우면 `|| '기타'` 폴백.
- **Task 11 페이지 컨트롤**(PR #26): `Controls`(JSON 내보내기/가져오기 + 점 삭제) → **MVP 완성**(추출→채택→그래프→검색/필터→저장/백업이 끝까지 동작).
- **로드맵 재배치**(PR #28): DB 저장·인증을 7→2번으로 앞당김 + **ADR 0010**.
- **고립 강조 수정**(#29, PR #30): 강조 기준을 `degree ≤ 1` → `isIsolated`(degree 0).

### 막힌 점 / 결정
- **(개념) "후보 vs 점 vs 주제" 혼란 정리**: 같은 글자 `topic`이 CandidateReview 상태·노드 데이터 칸·page 목록에 흩어져 "전역 공유값"으로 오해함. → 공유되는 건 스토어(`nodes`·`edges`)뿐, CandidateReview의 건 사적 상자(`selectedTopic`로 이름 변경), `node.topic`은 채택 때 *찍힌 자국*. **도장(selectedTopic) ↔ 자국(node.topic)** 비유로 정리. 인터페이스(`GraphNode`)는 여러 곳이 공유하니 칸 이름은 `topic` 유지.
- **(설계) 고립 판정은 "전체 그래프 기준"(A안)**: 필터로 선이 숨어도 가짜 고립이 안 생기게, `degree`를 거른 선이 아니라 `allEdges`(전체 선)로 계산. 그래서 `GraphView`에 `nodes`·`edges`·`allEdges`를 함께 넘김.
- **(TDD 경계 감각)**: UI(SearchFilter·GraphView)엔 TDD할 순수 로직이 없지만, **`page`에 엉켜 있던 필터 계산은 빼면 순수 함수** → `filterGraph`로 추출해 TDD. "Controls의 download도 TDD?"엔 → 브라우저 글루(Blob·a.click)라 TDD 불가, 유일한 로직(`exportJSON`)은 이미 검증됨 → 수동 검수.
- **(디버깅) "고장난 빌드 헛검수" ★ 교훈**: 고립 강조가 작은 그래프에서 다 회색으로 보임 → 원인은 `degree ≤ 1` 임계값(한 쌍만 이으면 양끝 다 degree 1이라 weak). `degree 0`으로 좁힘. 그런데 노드 속성명 `weak`/`isolated` **불일치**로 강조가 *아예 꺼진* 빌드를, 골든패스에서 "잘 된다"고 **헛검수**함(고립 점이 회색이 아닌 걸 못 알아챔). Kimi가 키 불일치 버그를 잡아줌. → **canvas는 자동 테스트 불가라, 수동 검수 때 "실제로 회색이 나오나"까지 확인**해야 한다. `tsc`는 콜백이 `any`라 못 잡았다.
- **(결정) 배포 ≠ 서버 저장**: "어차피 배포할 건데 내보내기/가져오기 필요?" → 배포해도 저장은 localStorage 그대로라 멀티기기·백업 공백을 못 메움(그건 DB의 몫). 또 "어차피 DB"의 주동기가 **포폴 임팩트**(풀스택·인증·DB 역량)라, DB·인증을 앞당김(ADR 0010).
- **(commitlint 함정)**: 제목을 대문자(`README…`/`MVP…`)로 시작하면 `subject-case` 규칙에 막힘 → 한국어 단어로 시작.

### 다음
- 로드맵 **1번 배포**(예시 데이터 호스팅) → **2번 DB+인증**(ADR 0010).
- 후속 이슈: 채택 후 주제(색) 변경(#22), 고립 강조 **B안**(색=주제 / 고립=테두리·크기 등 별도 채널).
- **블로그 후보**: ① "골든패스 / 고장난 빌드 헛검수 — canvas는 수동 검수의 함정", ② "TDD 둘째: 화면에 박힌 로직을 순수 함수로 빼기".

---

## 2026-06-07 (일) — 배포(Vercel + GitHub) + 예시 시드 + serverless 확인

### 한 일
- **로드맵 1번 배포 완료**(PR #35·#36): Vercel에 GitHub 저장소를 연결해 **main 머지 시 자동 배포**. 라이브 https://knowledge-graph-lyart.vercel.app
- **첫 방문 예시 시드**: `example-graph.ts`(연결된 React/테스트 묶음 + 고립 flexbox로 색·연결·고립 강조 데모) + `hasStoredGraph()`(TDD)로 첫 방문 판별 → page에서 첫 방문이면 예시, 아니면 저장본.
- **"비우기" 버튼**(Controls) 추가.
- **배포 검증**(증거): `curl`로 홈 200 · `/api/velog`가 마크다운 반환(serverless 동작) · 잘못된 주소 400.

### 막힌 점 / 결정
- **(개념) serverless 함수**: 항상 켠 서버가 아니라 "요청 올 때만 깨어났다 꺼지는" 코드(센서등 비유). `/api/velog`는 Vercel에서 serverless로 돈다. **로컬(Node)과 배포(serverless)는 환경이 달라** "로컬에서 됨 ≠ 배포에서 됨" → 배포 후 `curl`로 실제 호출해 확인.
- **(설계) 첫 방문 판별 트릭**: "첫 방문 = 저장 키 없음" vs "비우기 = 키 있고 빈 그래프"를 **키 존재 여부**로 구분. 덕분에 비우기 후엔 예시가 재시드되지 않음. (TS 상수 A안)
- **(착각→정리) 검색·필터**: 주제 "git"으로 걸렀는데 기대와 다른 점이 나옴 → 알고 보니 **필터는 "주제(색)" 기준이지 "연결(선)" 기준이 아님.** 연결돼 있던 두 git 점은 *색이 달라(=주제가 달라)* 같은 그룹이 아니었다. 코드 정상, 내가 주제와 연결을 혼동. (점 색으로 검증)
- **(UX 결정) 네이티브 대화상자**: 비우기 `confirm()`이 UX가 안 좋다는 지적 — 화면 멈춤·스타일 불가·출처 노출. "확인받는 것"은 유지하되 *수단*을 바꿀 일이라, 지금은 유지하고 **후속 이슈 #34**(confirm + 가져오기 실패 alert 묶어 인앱 UI로)로 분리.
- **(프로세스) 계획 체크박스 누락**: 작업하며 계획서 `- [ ]` 체크를 깜박 → 사용자 지적으로 catch-up. 앞으로 각 Task 커밋에 체크를 함께 넣기로.

### 다음
- 로드맵 **2번 DB + 인증**(ADR 0010) — 큰 작업(스키마·API·인증·보안·비용). 착수 시 새 ADR(DB·인증 방식)부터. 교체 지점은 `storage.ts`.
- 후속 이슈: #22(채택 후 주제 변경), #34(네이티브 대화상자 → 인앱 UI).
- **블로그 후보**: "serverless가 뭐고 왜 '배포 후 확인'이 필요한가" / "배포 ≠ 서버 저장 — localStorage 앱을 배포해도 데이터는 브라우저에 남는다".

---

## 2026-06-08 (월) — DB 저장 + 인증 마일스톤(로드맵 2번) 착수·구현 (Task 1~7 완료, Task 8 진행 중)

### 한 일
- **설계 → ADR 0011**: 하이브리드 아키텍처 확정 — 브라우저는 직접 쓴 Next.js `/api/graph` 라우트를 거치고, 라우트가 쿠키 세션으로 사용자를 확인해 Supabase에서 그 사람 행만 조회·저장. supabase-js만 사용(ORM 없음), 정규화 스키마(`nodes`·`edges` 표 + `user_id` FK + RLS), 세션은 쿠키(`@supabase/ssr`), 비로그인 localStorage 저장은 제거(로그인해야 저장·비로그인은 예시만), 1차 제공자 Google + Kakao(Kakao는 후속), Naver·Facebook 제외. (`docs/decisions/0011-db-auth-architecture.md`, `docs/specs/2026-06-08-db-auth-design.md`, `docs/plans/2026-06-08-db-auth.md`)
- **저장은 Postgres 함수(RPC `replace_graph`)로 한 묶음 처리**(전부 되거나 전부 취소) — 삭제+삽입이 중간에 끊겨도 "반쪽 저장"이 안 남게. 설계 PR(#39)의 Kimi 코드리뷰 지적을 반영한 것. 같은 리뷰로 미들웨어 matcher에서 `/api` 제외(라우트가 스스로 인증 → 중복 세션 확인 회피), 클라이언트 분기는 `getSession`(로컬) 사용으로 정리.
- **구현**: @supabase/ssr 브라우저·서버 클라이언트 + 세션 갱신 미들웨어(Task 2, PR #41) / `rowsToGraph` 순수 함수 — **TDD 셋째 사이클**(Task 3, PR #42) / `/api/graph` GET·PUT 라우트(Task 4, PR #43) / OAuth 콜백 라우트 + `AuthButton`(Task 5, PR #44) / `storage.ts` 비동기 전환 + 로그인 분기(로그인→서버, 비로그인→예시, `getSession`으로 로컬 판별) + `page.tsx` 통합(async 로드 + auth 상태 구독 + 디바운스 0.6초 저장)(Task 6~7, PR #45).

### 막힌 점 / 결정
- **(디버깅) 로그인 콜백 404**: App Router는 폴더 경로가 곧 URL인데 콜백 라우트를 `app/api/auth/callback`에 둬서 실제 주소가 `/api/auth/callback`이 됨(코드는 `/auth/callback`을 기대). → `app/auth/callback`으로 옮겨 해결. 처음엔 계정·DB 문제로 오해했다가 **마커(어느 경로로 들어오는지)를 확인해** 원인을 폴더 위치로 좁힘.
- **(배포) Vercel 빌드 에러 `@supabase/ssr: URL and API key required`**: Vercel에 환경변수(`NEXT_PUBLIC_SUPABASE_URL`·`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)를 등록하지 않은 채 페이지를 미리 그릴(prerender) 때 `createClient`가 빈 값으로 터짐. → Vercel에 환경변수 등록(Preview 포함) 후 재배포로 해결. **`NEXT_PUBLIC_` 값은 빌드 시점에 코드에 박히므로** 빌드 환경에 없으면 실행 때 받을 수 없다.
- **(개념) Supabase 새 키 체계**: anon → **Publishable key**(`sb_publishable_…`), service_role → **Secret key**(`sb_secret_…`)로 이름이 바뀜. 환경변수명을 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`로 맞춤. Secret 키는 쓰지 않음.
- **(워크플로) Kimi 코드리뷰 빈 응답**: 큰 PR diff(예: 421줄)에서 추론 모델이 토큰 한도(max_tokens 4000)를 추론에 다 써 리뷰 본문이 빈 채로 나옴. → **PR을 Task별 작은 PR로 분할**하는 전략 채택(합쳐 올렸던 PR #40을 #41·#42·#43으로 쪼갬). 워크플로 max_tokens 상향은 후속 후보.
- **(설계) storage와 page의 결합**: `storage`의 저장·불러오기를 async로 바꾸면 `page`의 동기 호출이 깨져, 둘을 같은 PR(#45)로 묶어야 함.
- **(관행) 커밋 타입**: TDD로 함수를 새로 추가하면 `feat: …(TDD)`(기능 추가), `test:`는 테스트 전용 변경에만. (PR #42에서 `test:`로 잘못 쓴 것을 `feat:`로 정정)

### 과정 / 워크플로
- 설계 합의 → ADR → 구현 계획 → **Task별 작은 PR**(이슈 #38, PR #41~#45). 흐름: 이슈 → 브랜치 → 커밋·푸시 → PR → Kimi 리뷰 → 사용자 머지.
- 인증·라우트·OAuth·쿠키는 자동 테스트가 닿기 어려워, **브라우저로 실제 로그인 → 저장 → 새로고침 유지를 수동 검수**하는 게 진짜 게이트(자동 테스트는 mock이라 서버 영속성은 못 덮음 — "테스트 통과 ≠ 동작").

### 다음
- **Task 8 마무리**: 배포본 로그인·저장 왕복 재검수 · Supabase Table Editor에서 실제 행이 쌓였는지 증거 확인 · 멀티기기(다른 브라우저/계정 같음) 확인 · Kakao 제공자 추가.
- **Task 9(후속)**: dev/prod DB 분리 — 현재 로컬과 운영이 같은 Supabase DB를 본다.
- **블로그 후보**: ① "토큰 저장: localStorage vs 쿠키"(초안 작성함) / ② "serverless·배포 후 환경변수 — `NEXT_PUBLIC_`은 빌드 때 박힌다" / ③ "큰 PR을 쪼개는 이유 — AI 코드리뷰의 토큰 한도".

---

## 2026-06-12 (금) — 개발/운영 DB 분리(Task 9): Supabase CLI + 로컬 Docker 스택

### 한 일
- **dev/prod DB 분리**: 로컬과 운영이 같은 Supabase 프로젝트를 보던 걸, **로컬 = Docker 스택(dev) / 기존 클라우드 = 운영(prod)** 으로 나눔. 운영·Vercel은 안 건드림. (설계 `docs/specs/2026-06-11-dev-prod-db-separation-design.md`, **ADR 0012**, 계획 `docs/plans/2026-06-11-dev-prod-db-separation.md`)
- **Supabase CLI 도입**: `supabase init`(설정 파일 `config.toml` 생성) → `supabase start`(Docker로 로컬 Postgres·Auth·Studio 한 벌 기동) → `.env.local`을 로컬 스택 주소로 교체. 운영은 그대로.
- **스키마를 코드로(마이그레이션)**: 지금까지 표·RLS·`replace_graph` 함수가 운영 대시보드에만 있던 걸, **baseline 마이그레이션**(현재 스키마를 통째로 담은 첫 SQL 파일)으로 옮겨 git에 남김. 로컬은 이 파일로 채워짐(provision = 빈 DB에 표를 만들어 쓸 수 있게 갖춤).
- **로컬 Google 로그인**: 운영에 쓰던 Google OAuth 클라이언트를 재사용. `config.toml`의 `[auth.external.google]`에 client_id·secret을 **env() 치환**으로만 두고(시크릿은 `.env`에, git 제외), 로컬 콜백을 Google Console에 등록. 앱 코드는 변경 없음(`redirectTo`가 `location.origin` 기반이라 로컬에선 자동으로 localhost).
- **분리 증명(마커 검증)**: 로컬에서 만든 점("리뷰 UX"·"비용")이 **로컬 DB엔 있고 운영 클라우드엔 없음**을 직접 확인 → 로컬 테스트가 운영을 오염시키지 않음.

### 막힌 점 / 결정
- **(디버깅) 권한 누락 → 500**: 로컬에서 로그인 후 `GET /api/graph`가 500(`그래프 불러오기 실패`). 원인은 **`authenticated` 역할에 `SELECT` 권한이 없어서**(`information_schema.role_table_grants` 조회로 확인 — `REFERENCES/TRIGGER/TRUNCATE`만 있고 SELECT 없음, `set role authenticated; select…` → `permission denied for table nodes`). **운영 대시보드는 표 만들 때 grant를 자동으로** 해주지만, **raw 마이그레이션 SQL엔 그 grant가 없어서** 로컬엔 권한이 안 붙음. → 마이그레이션에 `grant select,insert,update,delete on nodes/edges to authenticated` + `grant execute on replace_graph` 추가. **교훈: 스키마를 코드로 옮길 때 대시보드의 '숨은 자동 처리'까지 명시해야 한다.** (저장 PUT은 `replace_graph`가 `security definer`(함수 소유자 권한으로 실행)라 grant 없이도 200이 떠서, "GET만 500 / PUT은 200" 패턴이 진단 단서였음.)
- **(함정) `supabase db reset`은 로컬 사용자도 지운다 → 401**: grant 고친 뒤 `db reset`을 돌리자 이번엔 401. reset이 로컬 DB를 통째로 비우면서 `auth.users`(로그인 사용자)도 지워, 브라우저의 옛 세션 쿠키가 "없는 사용자"를 가리킴. → **다시 로그인**하면 해결. (db reset 뒤엔 항상 재로그인, 로컬 한정.)
- **(잠복 버그 발견) 운영 Site URL = localhost**: 분리 후 **운영 회귀 테스트** 중, 배포본 로그인이 `localhost:3000/?code=…`로 튕김. 원인은 **운영 Supabase의 Site URL이 새 프로젝트 기본값 `localhost:3000`** 이었던 것. OAuth에서 **Site URL / Redirect URLs**는 로그인 후 "돌려보내도 되는 주소 허용 목록"(allow-list — 모르는 주소로 보내 인증 코드가 탈취되는 걸 막는 보안 장치)인데, 앱이 넘긴 배포 콜백이 목록에 없으면 Site URL(localhost)로 떨어진 것. → **운영 Site URL을 vercel 도메인으로 바꾸고, 배포 콜백을 Redirect URLs에 등록.** **분리 작업이 그동안 잠복해 있던 운영 설정 버그를 드러낸** 사례.

### 과정 / 워크플로
- brainstorming → spec → **ADR 0012** → writing-plans → 구현(이슈 #47, 브랜치 `chore/47-db-env-split`). 코드·SQL은 사용자가 직접 타이핑, config·문서는 Claude가 작성.
- 인프라·설정 작업이라 자동 테스트가 없고, **마커 검증(로컬엔 있고 운영엔 없음)이 진짜 게이트**. 디버깅은 추측 대신 **psql로 권한·행을 직접 조회**해 원인을 좁힘.

### 다음
- **Task 7**: PR(#47) → Kimi 리뷰 → 사용자 머지 → HANDOFF "Task 9 완료" 갱신.
- (별개) db-auth 마일스톤 Task 8의 Kakao 제공자 등 잔여 항목.
- **블로그 후보**: ① "로컬 Supabase(Docker)로 dev/prod DB 분리하기" / ② "마이그레이션이 놓치는 것 — 대시보드가 몰래 해주던 grant" / ③ "OAuth Site URL·Redirect URLs가 뭐고 왜 localhost로 튕기나".

---

## 2026-06-12 (금) — Kakao 로그인 추가: 카카오 비즈앱 정책 장벽 뚫기

### 한 일
- Google로 검증된 OAuth 흐름에 **Kakao 제공자**를 추가(로컬 dev 스택 기준, 이슈 #50). 화면 쪽은 이미 `AuthButton`에 버튼·`login('kakao')`이 있었고 `signInWithOAuth`는 제공자 값만 바꾸면 됨 → **실제 코드 변경은 `config.toml`에 `[auth.external.kakao]` 한 블록뿐**.
- 로컬 시크릿(REST API 키·Client Secret)은 `.env`에 두고 `config.toml`은 `env()` 치환으로만 참조(git에 비밀 안 올림). Google과 같은 패턴.

### 막힌 점 / 결정
- **(정책 장벽) Supabase가 `account_email`을 기본 scope로 강제** → 카카오 `KOE205`(설정하지 않은 동의항목을 요청). 그런데 `account_email`은 **개인 개발자 계정에선 선택 동의로도 못 켜고 비즈앱 전환이 필수**(카카오 정책). 코드에서 scope를 빼보려 했지만 Supabase는 기본 scope에 **덧붙이기만** 해서(요청 URL에 `profile_nickname`이 두 번 찍힌 게 단서) 뺄 수 없었음. → **개인 개발자 비즈앱 전환**으로 방향 결정(사업자 없이 본인인증 + 카카오비즈니스 약관동의, 단 **앱 아이콘 등록**이 선행 조건).
- **(에러 코드로 원인 좁히기)** 비즈앱 전환 뒤에도 동의항목을 하나씩 맞춰야 했음. 카카오 에러 화면의 "왜 에러가 발생하나요?"가 정확한 단서를 줌 — ① `profile_image` 동의항목 누락(KOE205) → 추가, ② **리다이렉트 URI가 비어 있던** 것(KOE006) → `http://127.0.0.1:54321/auth/v1/callback` 등록. 카카오는 리다이렉트 URI를 "카카오 로그인" 메뉴가 아니라 **앱 설정 → 플랫폼 키(REST API 키 수정)** 화면에 등록하는 게 함정.
- **(결정) 별도 ADR 없이 저널로**: Kakao 추가는 ADR 0011(인증 결정)의 실행이고, 비즈앱 전환은 새 설계가 아니라 외부 정책 대응이라 ADR감이 아님.

### 검증
- 브라우저 OAuth 3단계(카카오 인증 302 → Supabase 콜백 302 → 앱 콜백 307) 성공.
- 로컬 DB `auth.users`를 직접 조회해 **`kakao` 사용자 생성 + 이메일 채워짐** 확인(값은 안 찍고 존재 여부만). 화면에 이메일 표시까지 확인 → 처음 우려했던 "이메일 없는 제공자라 버튼이 안 바뀌는 표시 함정"은 비즈앱 전환으로 이메일을 받게 돼 자연히 해소.

### 다음
- 이슈 #50 체크박스 갱신 → PR(코드 변경은 `config.toml` 하나) → Kimi 리뷰 → 사용자 머지.
- **운영(prod) Kakao는 후속**: Supabase 운영 대시보드 Providers + 운영 콜백/Site URL 등록(이번은 로컬 dev만).
- **블로그 후보**: ① "Supabase + 카카오 로그인 — `account_email` 강제와 비즈앱 전환 장벽" / ② "카카오 OAuth 에러 코드로 원인 좁히기(KOE205 동의항목 → KOE006 리다이렉트 URI)".

---

## 2026-06-12 (금) — 워크플로 보강: 분할 PR의 이슈 자동 닫기 누락 규명

### 한 일
- Kakao PR(#51) 머지 후 열린 이슈를 점검하다, **DB+인증 마일스톤(#38)이 완료됐는데도 안 닫혀 있던 것**을 발견 → 원인을 규명하고 완료 코멘트와 함께 닫음.
- `conventions.md` §3에 **한 이슈를 여러 PR로 분할할 때의 이슈 닫기 규칙**을 한 줄 보강(PR #52).

### 막힌 점 / 결정
- **(원인 규명) 왜 #38이 자동으로 안 닫혔나**: GitHub는 PR 본문·커밋에 `Closes/Fixes/Resolves #N` 키워드가 있고 기본 브랜치로 머지될 때만 이슈를 자동으로 닫는다. 단순 `#38` 참조(링크)는 안 닫음. #38은 Kimi 리뷰 빈 응답 회피로 **7개 PR(#39·#41~#46)로 쪼갰는데, 그중 아무 PR도 `Closes #38`을 안 붙였다**(분할 PR마다 붙이면 첫 머지에 닫혀버리므로 일부러 뺌) → 마지막 PR에도 안 붙이고 수동 닫기도 빠뜨려 열린 채 남음. **추측 대신 7개 PR 본문을 직접 grep해 'Closes 키워드 0건'을 확인.**
- **(헛짚음 정정) "docs PR이라 누락"이 아니다**: 처음엔 docs 타입 PR이 닫기를 빠뜨린 패턴으로 의심했으나, 머지된 PR 전체를 `타입 × Closes 유무`로 교차해 보니 docs도 절반 이상(#36·#32·#28·#19·#15·#13)이 `Closes`를 붙였다. 진짜 변수는 **타입이 아니라 "그 PR이 특정 이슈를 단독으로 완결하는가"** — 분할 PR과 '닫을 이슈가 없는 기록성 PR'만 `Closes`가 없었다.
- **(결정) 컨벤션 빈칸을 메움**: 기존 컨벤션은 '1 이슈 = 1 PR'만 가정해 분할 케이스가 비어 있었음. "분할 시 **마지막 PR에만 `Closes #N`**, 못 붙였으면 **머지 후 수동 닫기**" 규칙을 추가(ADR 0007 영역이나 문서 한 줄이라 별도 ADR 없이 conventions.md 직접 보강).

### 다음
- PR #52 → Kimi 리뷰 → 사용자 머지.
- 남은 후속 이슈: #34(네이티브 confirm/alert → 인앱 UI), #22(채택 후 주제 색 변경).
- 진행 중: **velog 추출 정교화** brainstorming(측정까지 완료).
