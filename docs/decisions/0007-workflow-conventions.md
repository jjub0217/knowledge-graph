# 0007. 워크플로우 컨벤션 — 브랜치·커밋·PR·이슈·네이밍

- 상태: 채택
- 날짜: 2026-06-01

## 맥락 (왜 이 결정이 필요한가)
지금까지 git 로컬로만 작업(원격 없음)하다, 2026-06-01 GitHub 공개 저장소(`jjub0217/knowledge-graph`)에 올렸다. 원격·이슈·PR이 생겼으므로, 그동안 미뤄둔(결정 B) 브랜치·PR·이슈 컨벤션을 정한다. cuddle-market `conventions.md`를 기반으로 하되, 이 프로젝트(솔로·표준 게이트)에 맞게 각색한다.

## 결정
전체 규칙은 [docs/conventions.md](../conventions.md)에 둔다(단일 출처). 핵심:
- 브랜치: `타입/이슈번호-설명`(소문자·단일 하이픈), prefix `feat`, base `main`
- 커밋: 기존 그대로(표준 11개 type, scope 미사용, `(#N)`)
- PR: base `main`, 본문 템플릿(개요/작업 내용/`Closes #N`/리뷰어 참고)
- 흐름: 이슈 → 브랜치 → 커밋 → PR → 사용자 머지
- 코드·파일 네이밍 포함

## cuddle-market과 다르게 한 점 (근거)
- **develop 제거, main 단일** — 솔로 프로젝트라 develop 계층은 불필요한 의식(과설계).
- **커밋 type = 표준 11개만** — 우리 commitlint(config-conventional)이 커스텀 type(design·init·rename·remove)을 차단.
- **브랜치 구분자 = 단일 하이픈 `-`** — cuddle-market의 `--`(이중 대시)는 표준에 없고 CLI 플래그처럼 읽혀 혼란. 주류 형식 `<타입>/<이슈번호>-<설명>`을 따름(웹 조사로 확인).
- **브랜치 prefix `feat`** — 커밋 타입·기존 `feat/mvp`와 통일(주류엔 `feature`도 흔하나 내부 일관성 우선).
- **PR base = main** — develop이 없음.
- **파일 네이밍: lib은 kebab-case** — cuddle-market의 util=camelCase와 달리, 기존 lib 실태(`graph-ops.ts`)를 따름.

## 근거 / 무엇을 얻고 무엇을 포기했나
- 이슈→브랜치→PR 흐름은 솔로 프로젝트엔 다소 무겁지만(포기: 가벼움), **추적성**(브랜치·커밋·PR이 이슈로 연결됨)과 **"팀처럼 일할 줄 안다"는 포트폴리오 증거**를 얻는다. 이슈 트래커를 쓰는 팀의 대중적 관행과 일치한다(웹 조사).

## 결과 (이 결정으로 생기는 영향)
- **적용 시점**: 문서는 지금 확정. 강제 적용은 **토대(Task 1~6) 이후 = UI(Task 7)부터** — Kimi 코드리뷰를 UI PR부터 붙이기로 해 적용 시점을 UI로 당김. 토대는 `feat/mvp` 단일 브랜치(PR #1)로 묶고, UI부터 task별 이슈→브랜치→PR→Kimi 리뷰→사용자 머지.
- `commit-push` 스킬이 `docs/conventions.md`를 참조하도록 갱신한다.
- PR 템플릿 파일(`.github/PULL_REQUEST_TEMPLATE.md`)·이슈 템플릿은 PR/이슈를 처음 열 때 추가(지금은 conventions.md 문서로 충분).
