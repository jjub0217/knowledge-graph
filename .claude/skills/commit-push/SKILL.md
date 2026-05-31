---
name: commit-push
description: 변경사항을 분석해 Conventional Commits 메시지로 커밋한다. "/commit-push", "커밋", "커밋해줘", "커밋 푸시" 요청에 사용. (현재 범위 = 커밋까지만. 푸시·PR·이슈 연동은 GitHub 셋업 후 ADR 0007로 확장)
---

# commit-push (현재 단계: 커밋까지만)

작업 완료 후 변경사항을 분석해 커밋한다.

> **현재 범위 안내**: 이 프로젝트는 아직 원격(GitHub)·이슈가 없어 **커밋까지만** 수행한다. 푸시·PR 생성·이슈 번호 연동은 MVP 마무리 때 GitHub를 올리며 **ADR 0007**(커밋/이슈/PR/브랜치 워크플로우)로 확장한다. 그 전까지 이 스킬에서 push·PR 단계는 실행하지 않는다.

## 커밋 컨벤션 (이 프로젝트)

출처: [CLAUDE.md](../../../CLAUDE.md) git 섹션 + commitlint(`@commitlint/config-conventional` 표준).

- 형식: **`type: 한국어 제목`**
- **scope 안 씀** (괄호 scope 금지) — 2026-05-31 결정
- **이슈 번호 `(#N)`은 아직 안 붙임** — GitHub 셋업 후부터(결정 B)
- **type은 표준 11개만**: `feat·fix·docs·style·refactor·perf·test·build·ci·chore·revert`. **커스텀 타입 금지**(design·init·rename·remove 등 ❌ — commitlint이 막음).
- 제목 규칙: 한국어로, **대문자 식별자(PascalCase)로 시작 금지**(subject-case), **끝에 마침표 금지**, 첫 줄 100자 이내.
- **Co-Authored-By 줄 넣지 않음** (포트폴리오 — 본인 작업).

## 작업 순서

### Step 0: 브랜치 확인

```bash
git branch --show-current
```
- **main 이면 중단**: "main 직접 커밋 금지. 작업 브랜치(`feat/...`)에서 진행하세요." 라고 안내하고 멈춘다.

### Step 1: 변경사항 분석 (병렬 실행)

```bash
git status
git diff
git log -5 --oneline
```
- 작업 타입(feat/fix/refactor/docs/chore 등) 파악, 무엇을·왜 바꿨는지 파악.
- **민감·불필요 파일 제외 확인**: `.env*`, `credentials*`, `.DS_Store`, `node_modules`, `.next` 등.

### Step 2: 커밋 메시지 제안 + 사용자 확인

- `type: 한국어 제목` 형식으로 메시지를 제안한다 (scope·이슈번호 없이).
- 사용자에게 **"이 메시지로 커밋할까요?"** 라고 메시지를 보여주고 확인받는다.

### Step 3: 스테이징 + 커밋

- **관련 파일만** 스테이징한다 (`git add -A` 남발 금지, 의도한 파일만).
```bash
git add [파일들]
git commit -m "type: 한국어 제목"
```
- 커밋 시 게이트가 돈다: **pre-commit**(lint-staged: 바뀐 파일만 eslint --fix + prettier --write) → **commit-msg**(commitlint: 메시지 규칙).
- 커밋 후 `git status`로 확인.

### Step 4: 결과 안내

- 커밋 해시·메시지를 보여준다.
- "푸시·PR은 GitHub 셋업(ADR 0007) 후 단계입니다" 안내.

## 게이트(훅) 처리

- **커밋이 막히면** 사유를 읽고 고친 뒤 재시도:
  - lint-staged가 파일을 자동 수정했으면 → 바뀐 파일 다시 `git add` 후 재커밋.
  - commitlint이 막았으면 → 메시지 규칙 위반(예: 제목 대문자 시작, 비표준 type, 끝 마침표) 수정 후 재커밋.
- **`--no-verify`로 게이트 우회 금지** (사용자가 명시적으로 요청할 때만).

## 금지 사항

- **main 직접 커밋 금지** — 작업 브랜치 → (나중에) PR.
- **force push 금지**, **머지 금지**(머지는 사용자가 직접).
- **커스텀 커밋 타입 금지** (표준 11개만).
- **게이트 우회(`--no-verify`) 금지.**

## 나중에 (ADR 0007에서 확장 예정)

GitHub 저장소·원격·이슈를 올린 뒤 이 스킬에 추가한다:
- 이슈 번호 `(#N)`를 제목 끝에 붙이기
- `git push`(첫 푸시는 `-u`)
- `gh pr create`(base = `main`)로 PR 생성 + PR 템플릿
- 이슈 자동 close(`Closes #N`)
