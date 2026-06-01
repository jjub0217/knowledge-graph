---
name: create-issue
description: GitHub 이슈 + 작업 브랜치를 생성한다. "/create-issue", "이슈 생성", "이슈 만들어" 요청에 사용. (이슈→브랜치까지. 코딩 후엔 /commit-push)
---

# create-issue — 이슈 + 브랜치 생성

작업 시작 전, GitHub 이슈를 만들고 그 번호로 작업 브랜치를 만든다.

> 전체 규칙: [docs/conventions.md](../../../docs/conventions.md) (§1 브랜치, §6 워크플로우). 이 스킬은 "이슈 + 브랜치"까지 — 코딩 후엔 `/commit-push`.

## 작업 순서

### Step 1: 작업 내용·타입 파악
"어떤 작업인가요?" 물어 작업 타입(feat·fix·refactor·docs·chore·test)과 내용을 파악한다.

### Step 2: 이슈 내용 작성 + 확인
타입에 맞춰 이슈 본문을 쓰고(아래 템플릿) "이 내용으로 이슈를 만들까요?" 확인.

- feat:
  ## 개요
  [기능 설명]
  ## 작업 내용
  - [ ] ...
- fix:
  ## 문제
  [증상]
  ## 원인 / 해결
  - ...
- refactor·docs·chore: 개요 + 작업 내용 형식.

### Step 3: GitHub 이슈 생성
gh issue create --title "타입: 한국어 제목" --body "..." 로 생성.
- 라벨은 선택 — 저장소에 **이미 있는 라벨만** `--label`로. 없으면 생략(임의 라벨로 실패 금지).
- 생성된 이슈 번호 확인(예: #5).

### Step 4: 브랜치 생성 (main에서)
- 브랜치명: `타입/이슈번호-설명`(소문자·단일 하이픈). 예: `feat/5-input-panel`
- 사용자에게 브랜치명 확인 후:
  git checkout main
  git pull origin main
  git checkout -b 타입/이슈번호-설명

### Step 5: 완료 안내
이슈 번호·브랜치명 표시 + "코딩 후 `/commit-push`" 안내.

## 금지 사항
- **main에 직접 작업·브랜치 생성 금지** — 반드시 main에서 분기한 새 작업 브랜치.
- 브랜치는 **소문자·단일 하이픈**(`--` 금지), base는 **main**(develop 없음).
