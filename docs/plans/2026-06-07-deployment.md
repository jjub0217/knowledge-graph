# 배포 + 예시 데이터 시드 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **체크박스 갱신 규칙**: Task·Step을 끝내면 그때그때 `- [ ]`를 `- [x]`로 (PR/머지 시점에). → conventions.md §6.

**Goal:** MVP를 Vercel + GitHub 자동 배포로 라이브에 띄우고, 첫 방문자가 미리 채워진 예시 지식 그래프를 보게 한다.

**Architecture:** 예시 그래프를 `src/lib` 상수로 두고, localStorage 저장 키 존재 여부로 "첫 방문"을 판별해 첫 로드 때만 시드한다. 순수 로직(`hasStoredGraph`)은 TDD, 화면·배포는 수동 검수.

**Tech Stack:** Next.js 16 · TypeScript · Vitest · localStorage · Vercel(호스팅) · GitHub(자동 배포).

**참고:** 설계 `docs/specs/2026-06-07-deployment-design.md` · 이슈 #33 · 커밋 규칙 `type: 한국어 제목 (#33)`(scope 없음).

---

### Task 1: `hasStoredGraph()` — 첫 방문 판별 (TDD)

**Files:**
- Modify: `src/lib/storage.ts`
- Test: `src/lib/storage.test.ts`

- [x] **Step 1: 실패 테스트 작성**

`src/lib/storage.test.ts` 상단 import에 `hasStoredGraph`를 추가하고(`import { saveGraph, loadGraph, exportJSON, importJSON, hasStoredGraph } from './storage'`), `describe('storage', ...)` 블록 안에 아래 테스트를 추가한다.

```ts
  it('저장 전엔 hasStoredGraph가 false', () => {
    expect(hasStoredGraph()).toBe(false)
  })
  it('저장 후엔 hasStoredGraph가 true', () => {
    saveGraph(sample)
    expect(hasStoredGraph()).toBe(true)
  })
```

(`sample`과 `beforeEach(() => localStorage.clear())`는 기존 파일에 이미 있음.)

- [x] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: FAIL — "hasStoredGraph is not a function".

- [x] **Step 3: 최소 구현**

`src/lib/storage.ts` 맨 아래에 추가한다. (`KEY`는 이 파일 상단에 이미 선언된 `'knowledge-graph'` 상수)

```ts
// 저장된 그래프가 한 번이라도 있었나? (키 존재 = 첫 방문 아님)
// 첫 방문(키 없음)과 "비우기 한 상태"(키 있고 빈 그래프)를 구분하는 데 씀.
export function hasStoredGraph(): boolean {
  return localStorage.getItem(KEY) !== null
}
```

- [x] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat: 첫 방문 판별 hasStoredGraph 추가 (TDD) (#33)"
```

---

### Task 2: 예시 그래프 상수

**Files:**
- Create: `src/lib/example-graph.ts`

연결된 덩어리(주제색) + 고립 점 1개(회색·크게)를 넣어 색·연결·고립 강조가 한눈에 보이게 한다. degree: `useEffect`=2(허브), `useState`·`props`·`TDD`·`RTL`=1, `flexbox`=0(고립).

- [x] **Step 1: 파일 작성**

```ts
// src/lib/example-graph.ts
import type { Graph } from './types'

// 첫 방문자에게 보여줄 예시 지식 그래프.
// React(허브 useEffect 포함)·테스트 묶음은 연결돼 주제색으로, flexbox는 고립이라 회색·크게 보인다.
export const EXAMPLE_GRAPH: Graph = {
  nodes: [
    { id: 'useState', label: 'useState', topic: 'React' },
    { id: 'useEffect', label: 'useEffect', topic: 'React' },
    { id: 'props', label: 'props', topic: 'React' },
    { id: 'TDD', label: 'TDD', topic: '테스트' },
    { id: 'RTL', label: 'RTL', topic: '테스트' },
    { id: 'flexbox', label: 'flexbox', topic: 'CSS' }, // 고립 — 강조 데모
  ],
  edges: [
    { id: 'useState-useEffect', source: 'useState', target: 'useEffect' },
    { id: 'useEffect-props', source: 'useEffect', target: 'props' },
    { id: 'TDD-RTL', source: 'TDD', target: 'RTL' },
  ],
}
```

- [x] **Step 2: 타입 확인 + Commit**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

```bash
git add src/lib/example-graph.ts
git commit -m "feat: 첫 방문용 예시 그래프 상수 (#33)"
```

---

### Task 3: 첫 로드 때 예시 시드 (page.tsx)

**Files:**
- Modify: `src/app/page.tsx`

`hasStoredGraph()`가 거짓(첫 방문)이면 예시를, 참이면 저장본을 로드한다. (시드된 예시는 기존 "변경 시 저장" 효과로 localStorage에 저장되어, 다음 방문부턴 저장본 경로를 탄다.)

- [x] **Step 1: import 추가**

`src/app/page.tsx`의 import 구역에 두 줄을 추가한다.

```tsx
import { saveGraph, loadGraph, hasStoredGraph } from '@/lib/storage'
import { EXAMPLE_GRAPH } from '@/lib/example-graph'
```

(기존 `import { saveGraph, loadGraph } from '@/lib/storage'` 줄을 위의 `hasStoredGraph` 포함 버전으로 교체.)

- [x] **Step 2: 첫 로드 효과 수정**

기존:

```tsx
  // 첫 로드: localStorage에 저장된 그래프 복원
  useEffect(() => {
    const saved = loadGraph()
    setAll(saved.nodes, saved.edges)
  }, [setAll])
```

아래로 교체:

```tsx
  // 첫 로드: 처음 방문(저장 키 없음)이면 예시 그래프를, 아니면 저장본을 복원
  useEffect(() => {
    if (hasStoredGraph()) {
      const saved = loadGraph()
      setAll(saved.nodes, saved.edges)
    } else {
      setAll(EXAMPLE_GRAPH.nodes, EXAMPLE_GRAPH.edges) // 첫 방문 → 예시 시드
    }
  }, [setAll])
```

- [x] **Step 3: 타입 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [x] **Step 4: 수동 검증**

Run: `npm run dev` → 브라우저 콘솔에서 `localStorage.clear()` 후 새로고침 → **예시 그래프가 보이는지**(연결된 React/테스트 묶음 + 회색·큰 flexbox). 점을 하나 추가/연결한 뒤 새로고침 → 그 변경이 유지되는지(저장본 경로).

- [x] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: 첫 방문 시 예시 그래프 시드 (#33)"
```

---

### Task 4: "비우기" 버튼 (Controls.tsx)

**Files:**
- Modify: `src/components/Controls.tsx`

- [x] **Step 1: 비우기 함수 + 버튼 추가**

`src/components/Controls.tsx`에서 `clearAll` 함수를 컴포넌트 안에 추가하고(`setAll`은 이미 구조분해로 꺼내 쓰고 있음), 버튼을 `return`의 `<div className="flex items-center gap-2">` 안 맨 앞에 넣는다.

함수(다른 함수들 옆에):

```tsx
  // 그래프 전체 비우기 (되돌릴 수 없으니 confirm 한 번)
  function clearAll() {
    if (confirm('그래프를 모두 비울까요? 되돌릴 수 없어요.')) setAll([], [])
  }
```

버튼(`<div className="flex items-center gap-2">` 바로 다음 줄):

```tsx
      <button className="border px-2" onClick={clearAll}>
        비우기
      </button>
```

- [x] **Step 2: 타입 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [x] **Step 3: 수동 검증**

Run: `npm run dev` → "비우기" 클릭 → confirm 확인 → 그래프가 빈 화면이 되는지. **새로고침해도 예시가 다시 안 뜨는지**(비우기 = 빈 그래프 저장 → 키 존재 → 재시드 안 함).

- [x] **Step 4: Commit**

```bash
git add src/components/Controls.tsx
git commit -m "feat: 그래프 비우기 버튼 (#33)"
```

---

### Task 5: 게이트 + PR

**Files:** (없음 — 검증·PR)

- [x] **Step 1: 전체 게이트**

Run:
```bash
npx tsc --noEmit       # 에러 0
npx vitest run         # 모두 PASS
npm run lint           # 에러 0
```

- [x] **Step 2: 푸시 + PR**

```bash
git push -u origin feat/33-deploy
gh pr create --base main --head feat/33-deploy --title "feat: 배포 준비 — 예시 데이터 시드 + 비우기 (#33)" --body "Closes #33 (배포 코드 부분). Vercel 연결은 머지 후 Task 6에서 사용자가 직접."
```

- [x] **Step 3: Kimi 리뷰 → 사용자 머지**

---

### Task 6: Vercel + GitHub 자동 배포 (사용자 수동)

**Files:** (없음 — 외부 설정. 코드 변경 아님)

> ⚠️ Vercel 로그인·연결은 **사용자가 직접** 수행(인터랙티브). Claude는 안내만.

- [x] **Step 1: Vercel에 GitHub 저장소 연결**

[vercel.com](https://vercel.com) 로그인(GitHub 계정) → "Add New… → Project" → `knowledge-graph` 저장소 Import → Framework "Next.js" 자동 감지 확인 → 환경변수 없음(그대로) → Deploy.

- [x] **Step 2: 배포 확인 (수동 검수)**

발급된 `*.vercel.app` 주소 접속 →
- 첫 방문에 **예시 그래프**가 보이는지
- **velog 주소 가져오기**가 실제로 되는지(serverless 함수 동작 확인 — "로컬에서 됨 ≠ 배포에서 됨")
- 골든패스: 후보 채택 → 연결 → 새로고침 저장 → 검색/필터 → JSON 내보내기

- [x] **Step 3: README에 배포 URL 추가**

`README.md` 상단(제목 아래)에 라이브 링크 한 줄 추가 후 커밋:

```markdown
> 🔗 라이브: https://<프로젝트>.vercel.app
```

```bash
git add README.md
git commit -m "docs: README에 배포 URL 추가 (#33)"
```

(이 커밋은 작업 브랜치 → PR. main 직접 금지.)

---

### 마무리

- [x] 배포 URL 동작 확인(위 Task 6 Step 2) — 특히 velog serverless.
- [x] 로드맵 1번 "배포" 완료 → 다음은 2번 DB+인증(ADR 0010).
- [x] HANDOFF §7 "다음 단계"를 배포 완료 → DB+인증으로 갱신(별도 docs 작업).
