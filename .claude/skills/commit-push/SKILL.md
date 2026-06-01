---
name: commit-push
description: 변경사항을 커밋 → 푸시 → PR 생성한다. "/commit-push", "커밋", "커밋 푸시", "PR" 요청에 사용. 머지는 사용자가 직접.
---

# commit-push — 커밋 → 푸시 → PR

작업 완료 후 변경사항을 커밋하고, 푸시하고, PR을 생성한다. **머지는 사용자가 GitHub에서 직접 한다.**

> 전체 컨벤션: [docs/conventions.md](../../../docs/conventions.md) (커밋 §2·PR §3·워크플로우 §6). 결정 근거: [ADR 0007](../../../docs/decisions/0007-workflow-conventions.md).
> **적용 시점**: 토대(Task 1~6)는 `feat/mvp` 단일 브랜치(PR #1)로 끝냄. UI(Task 7)부터 정석 흐름(이슈→브랜치→코딩→커밋·푸시→PR→Kimi 리뷰→사용자 머지) 적용.

## 커밋 컨벤션 (요약 — 전체는 conventions.md §2)
- 형식: `타입: 한국어 제목 (#이슈번호)` (이슈 기반 작업부터 `(#N)`)
- scope 안 씀 / 타입 = 표준 11개만(커스텀 금지) / 제목 대문자 시작·끝 마침표 금지 / Co-Authored-By 없음
- commitlint(commit-msg 훅)이 강제

## 작업 순서

### Step 0: 브랜치 확인
`git branch --show-current` — **main이면 중단**: "main 직접 작업 금지. `/create-issue`로 이슈+브랜치 먼저." 안내 후 멈춤.

### Step 1: 변경 분석 (병렬)
`git status` / `git diff` / `git log -5 --oneline`
- 작업 타입·내용 파악, 민감·불필요 파일(.env*·.DS_Store·node_modules·.next) 제외 확인.
- 현재 브랜치명에서 이슈 번호 추출(예: `feat/5-input-panel` → #5).

### Step 2: 커밋 메시지 제안 + 확인
`타입: 한국어 제목 (#N)` 제안 → "이 메시지로 커밋할까요?" 확인.

### Step 3: 스테이징 + 커밋
관련 파일만 `git add` → `git commit -m "..."`. 게이트(pre-commit lint-staged·commit-msg commitlint) 통과. 막히면 사유 고쳐 재커밋. `--no-verify` 금지.

### Step 4: 푸시
"푸시할까요?" 확인 후 — 첫 푸시는 `git push -u origin 현재브랜치`, 이후 `git push`.

### Step 5: PR 생성
- 기존 PR 확인: `gh pr list --head 브랜치 --state open` → 있으면 건너뜀.
- 없으면 확인 후 생성(base **main**, conventions.md §3 템플릿):
  gh pr create --base main --title "타입: 내용" --body "..."
  본문 = 개요 / 작업 내용 / 관련 이슈(`Closes #N` 단독 라인) / 리뷰어 참고. 제목엔 `(#N)` 생략.

### Step 6: 완료 안내
이슈·브랜치·PR URL 표시 + "PR에서 Kimi 리뷰 확인 → (수정) → 머지 버튼은 직접" 안내.

## 게이트(훅) 처리
- 커밋 막히면: lint-staged가 고친 파일 다시 `git add` 후 재커밋 / commitlint 위반(대문자 시작·비표준 type·끝 마침표) 수정 후 재커밋.

## 금지 사항
- main 직접 커밋 금지 · force push 금지 · **머지 금지(사용자가 직접)** · 커스텀 타입 금지 · `--no-verify`(게이트 우회) 금지.
