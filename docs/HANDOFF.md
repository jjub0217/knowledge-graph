# 핸드오프 문서 — knowledge-graph 프로젝트

> **목적**: cuddle-market 경로에서 진행한 브레인스토밍 세션(2026-05-27)을 새 경로(`~/Desktop/knowledge-graph`)의 새 Claude Code 세션이 끊김 없이 이어받기 위한 문서.
>
> **새 세션 첫 작업**: 이 문서를 읽고, 아래 "현재 상태 / 다음 단계"부터 brainstorming을 계속한다.

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

> **2026-05-29 기준: brainstorming → spec → 구현 계획까지 전부 완료.** 다음 세션은 **구현부터** 시작.

### 완료 (설계 단계 전부)
- [x] 설계 명확화: 핵심가치=**관계 발견**, 노드=개념/키워드(평면, 주제=색), 엣지="관련" 무방향(수동), 소스=하이브리드(학습 로그 .md 업로드 + velog 글 URL)
- [x] **ADR 0001~0006** (`docs/decisions/`): 노드입도 · 노드출처(섞기) · Next.js · velog(GraphQL+서버라우트) · 스택(TS·Tailwind·localStorage·Vitest) · 그래프 라이브러리(react-force-graph)
- [x] **설계 문서(spec)** 작성·검토: `docs/specs/2026-05-29-knowledge-graph-design.md`
- [x] roadmap 단일출처(`docs/roadmap.md`) · interview-prep · 빌드 저널 · 주간 학습 로그 갱신
- [x] `/journal` 프로젝트 스킬(`.claude/skills/journal/`) · 게이트 셋업 문서(`docs/setup-lint-format.md`)
- [x] OMC 플러그인 비활성화(Claude Code 네이티브 학습), statusLine 제거
- [x] git init + 첫 커밋(main, `f85faf6`). 커밋 컨벤션=Conventional Commits, 구현은 작업 브랜치
- [x] **구현 계획** 작성: `docs/plans/2026-05-29-knowledge-graph-mvp.md` (11개 작업)

### 다음 세션 시작점 = 구현 ★
- **`docs/plans/2026-05-29-knowledge-graph-mvp.md`의 Task 1부터** 실행.
- Task 1 = 작업 브랜치(`feat/mvp`) → `create-next-app` → 게이트 설치(eslint/prettier·husky·commitlint·lint-staged, 상세 `docs/setup-lint-format.md`).
- 실행 방식: writing-plans의 execution handoff(서브에이전트 구동 추천 / 인라인) 중 선택.
- ⭐ **추출기(Task 3)는 TDD 첫 체험** — 사용자가 직접 RED→GREEN→REFACTOR.
- 메모리 `project_setup_gate_step.md` 참고(구현 첫 단계 = 게이트 깔기).

### 기술 스택 (확정 — ADR 참조)
- Next.js 16 · React 19 · TypeScript 5 · Tailwind 4 · Vitest 4 · react-force-graph · zustand (ADR 0003·0005·0006).

---

## 8. 새 세션 시작 가이드 (사용자용)

새 터미널에서:
```bash
cd ~/Desktop/knowledge-graph
claude
```
이제 프로젝트 `CLAUDE.md`가 자동 로드되며 "세션 시작 시 docs/HANDOFF.md 먼저 읽어라"라고 지시함. 따라서 첫 메시지는 간단히:
> **"이어서 진행해줘"** (또는 "구현 계획 Task 1부터 시작해줘")

Claude는 CLAUDE.md 지시에 따라 이 문서를 읽고 "7. 다음 단계"의 **구현**(`docs/plans/2026-05-29-knowledge-graph-mvp.md`의 Task 1)부터 시작한다.

(git은 이미 초기화·첫 커밋 완료. 구현은 작업 브랜치 `feat/mvp`에서.)
