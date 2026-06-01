# knowledge-graph — 학습 지식 그래프

> 2026-05-27 cuddle-market 세션에서 브레인스토밍 → 분리된 신규 프로젝트.
> **세션 시작 시 `docs/HANDOFF.md`를 먼저 읽고 "7. 현재 상태 / 다음 단계"부터 이어서 진행할 것.**

## 프로젝트

- 학습한 개념을 노드·엣지로 시각화하는 **학습 지식 그래프** (Obsidian 그래프뷰의 학습 흐름 특화).
- 동기: 취업 포폴 + 도구/워크플로우 학습 + 내가 쓸 실용 도구 + 멘토 "새 프로젝트 해와라" 과제 (4가지 다).

## 메타 요구사항 — 면접 설명력 (1급 관심사)

"면접에서 _어떻게 만들었는지_ 디테일하게 설명 가능"이 목표. 만들면서 아래를 라이브로 채운다:

- `docs/decisions/` — ADR(왜 이렇게 정했는지 이유를 적어두는 결정 기록, 기술·설계 결정 근거)
- `docs/journal/` — 빌드 저널 (막힌 점·해결)
- `docs/interview-prep.md` — 면접 예상질문 6종
- **결정 → ADR 규칙**: 새 기술·설계 결정이 확정되면 클로드가 ADR 작성을 먼저 제안한다(사용자가 좋다고 하면 그때 작성). hook으로 자동 감지되는 게 아니라 "결정 확정"을 클로드가 판단해 제안.

## 워크플로우

- superpowers: brainstorming → spec(`docs/specs/`) → writing-plans → 구현.
  - 개발자 본인이 이해하기 쉬운 표현 : spec 작성 → 셀프리뷰(클로드 코드가 하는 리뷰.
    클로드 코드가 쓴 초안을 사용자에게 보여주기 전에 클로드 코드가 먼저 검수) → 사용자 리뷰 → 구현계획
  - 도구 호출 같은 게 아니라, 그냥 클로드 코드가 그 문서를 다시 읽고 빈칸(TBD)·모순·모호함을 잡아 고치는 행위.
    실제로 "주제를 어떻게 지정하나"가 모호해서 그 자리에서 고침.
  - 왜 했나: 개발자 CLAUDE.md의 개발 워크플로우(설계 합의 → 계획 → 구현)와 brainstorming 스킬이 권하는 흐름.
    오타·구멍을 미리 잡아 개발자의 검토 시간을 아끼려는 단계.
- 전역 `~/.claude/CLAUDE.md`의 개발 워크플로우(설계 합의 → 계획 문서 → 단계별 구현 + 검토) 준수.
- TDD: 이 프로젝트에서 _첫 체험_ 후보 (파싱·관계 로직 = 순수 함수). 사용자와 합의 후 적용.

## 현재 단계

- **설계·구현 계획 완료** (brainstorming → spec → plan). 다음은 **구현**.
- **다음**: 구현 계획 `docs/plans/2026-05-29-knowledge-graph-mvp.md`의 Task 1부터(작업 브랜치 `feat/mvp`). 상세는 `docs/HANDOFF.md` 7번.

## 기술 스택 (확정 — ADR 참조)

- Next.js 16 · React 19 · TypeScript 5 · Tailwind 4 · Vitest 4 · react-force-graph · zustand. (근거: ADR 0003·0005·0006)

## git

- main 직접 커밋 금지, 작업 브랜치 → PR. 머지는 사용자가 직접 수행. (단 저장소 첫(root) 커밋은 base가 없으므로 main에 둠 — 이후 구현 작업부터 작업 브랜치.)
- **커밋 메시지 = Conventional Commits** (`type: 한국어 제목 (#이슈번호)`). type: `feat·fix·docs·style·refactor·perf·test·build·ci·chore·revert` (= `@commitlint/config-conventional` 표준, cuddle-market과 동일). 커스텀 type 만들지 않음. **scope는 쓰지 않음**(2026-05-31 결정 — 구현 계획서에 적힌 scope는 빼고 커밋).
  - **이슈 번호**: 제목 끝에 `(#번호)`로 붙임 (예: `feat: 로그인 ui 작업(#32)`). 단 GitHub 저장소·이슈는 **MVP 마무리/배포 단계에 셋업**(2026-05-31 결정 B) → 그 전 커밋엔 번호를 붙이지 않음.
- 커밋 메시지에 `Co-Authored-By` 줄은 넣지 않음(포폴 — 온전히 본인 작업으로).
