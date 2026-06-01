# 컨벤션 (knowledge-graph)

> cuddle-market `conventions.md`를 기반으로 이 프로젝트(솔로·표준 게이트)에 맞게 각색. 결정 근거는 [ADR 0007](decisions/0007-workflow-conventions.md).
> **적용 시점**: 문서는 지금 확정. 강제 적용은 MVP 마무리 이후 — 현재는 `feat/mvp` 한 브랜치로 MVP까지 진행(이전 작업과 일관). 이후 새 작업부터 아래 이슈→브랜치→PR 흐름을 적용한다.

## 1. 브랜치 컨벤션

- 전부 소문자, **`타입/이슈번호-설명`** (단일 하이픈, kebab-case). 예: `feat/5-input-panel`
- 분기·머지 대상 = **`main`** (develop 없음 — 솔로 프로젝트)
- 타입 = 커밋 타입과 동일, prefix는 `feat`(`feature` 아님)

| 타입 | 설명 | 예시 |
| --- | --- | --- |
| feat | 새 기능 | feat/5-input-panel |
| fix | 버그 수정 | fix/12-graph-color |
| refactor | 구조 개선(동작 유지) | refactor/20-extractor-cleanup |
| docs | 문서만 | docs/3-readme |
| chore | 설정·정리 | chore/8-deps |
| test | 테스트 | test/15-storage-test |

## 2. 커밋 컨벤션

- 형식: **`타입: 한국어 제목 (#이슈번호)`**  예: `feat: 입력 패널 추가 (#5)`
- **scope 안 씀**
- 타입 = **표준 11개만**(`@commitlint/config-conventional`): feat·fix·docs·style·refactor·perf·test·build·ci·chore·revert. **커스텀 타입 금지**.
- 제목: 한국어, 대문자 식별자(PascalCase)로 시작 금지, 끝 마침표 금지, 첫 줄 100자 이내
- **Co-Authored-By 줄 없음**(포트폴리오 — 본인 작업)
- commitlint(commit-msg 훅)이 강제

## 3. PR 컨벤션

- base = **`main`**
- 제목: `타입: 내용` (이슈번호는 본문 `Closes`로 연결 — 제목엔 생략)
- 본문 템플릿:

```
## 개요
- 무엇을·왜

## 작업 내용
- [ ] 항목

## 관련 이슈
Closes #N

## 리뷰어 참고
- 중점적으로 봐줬으면 하는 부분
```

- 이슈 자동 닫기: `Closes #N`(단독 라인)
- **머지는 사용자가 직접**(force push·자동 머지 금지)

## 4. 코드 네이밍 컨벤션

| 종류 | 규칙 |
| --- | --- |
| 상수 | SCREAMING_SNAKE_CASE (`MAX_NODES`) |
| Boolean | `is` 접두사 (`isIsolated`) |
| 일반 변수 | camelCase, **의미 있는 이름**(한 글자·암호 축약 금지 — `r`·`u` 금지. `res`·`req` 같은 관용 축약은 허용) |
| 배열 | 복수형 (`candidates`) |
| 객체 | 단수형 (`candidate`) |
| 이벤트 핸들러 | `handle` 접두사 (`handleSubmit`) |
| 비동기 함수 | `fetch` 접두사 권장 (`fetchVelogMarkdown`) |
| 타입 | `interface`(ESLint 강제) |
| 컴포넌트 | 이름 있는 컴포넌트는 `function` 선언(ESLint 강제) |

- 폴더명: 전부 소문자

## 5. 파일 네이밍 컨벤션

| 파일 | 규칙 | 예시 |
| --- | --- | --- |
| 컴포넌트 | PascalCase | `InputPanel.tsx` |
| lib 모듈(로직) | kebab-case | `graph-ops.ts`, `graph-store.ts` |
| 타입 | 소문자 | `types.ts` |
| 라우트 | Next 고정 | `route.ts`(단수!) |

- cuddle-market은 util을 camelCase로 썼으나, 이 프로젝트 lib은 **kebab-case** 사용(기존 실태와 일관).

## 6. Git 워크플로우

- **main 직접 커밋 금지** → 작업 브랜치 → PR → 사용자 머지
- 흐름: **이슈 생성 → 이슈번호로 브랜치(`feat/N-설명`) → 작업·커밋(`(#N)`) → PR(base `main`, `Closes #N`) → 사용자 머지**
- `--no-verify`(게이트 우회)·force push 금지
- **현재 MVP는 `feat/mvp` 한 브랜치로 진행**(이전 6개 task와 일관) → 위 이슈/PR 흐름은 **MVP 이후** 새 작업부터
