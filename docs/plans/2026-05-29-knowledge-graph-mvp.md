# 학습 지식 그래프 MVP 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **체크박스 갱신 규칙**: Task·Step을 끝내면 그때그때 해당 `- [ ]`를 `- [x]`로 바꿀 것 (PR 올리거나 머지 시점에 함께). 진행 상황과 문서가 어긋나지 않게. → conventions.md §6.

**Goal:** 학습 로그·velog 글에서 개념을 뽑아 점·선으로 잇고, 손으로 연결하며 관계를 발견하는 그래프 웹앱(MVP)을 만든다.

**Architecture:** Next.js(App Router) 단일 앱. 순수 로직(추출·저장·그래프 연산)은 `src/lib`에 TDD로 만들고, velog 가져오기는 서버 라우트(CORS 우회), 화면은 클라이언트 컴포넌트 + react-force-graph로 그린다. 저장은 localStorage + JSON 내보내기/가져오기.

**Tech Stack:** Next.js 16 · React 19 · TypeScript 5 · Tailwind 4 · Vitest 4 · react-force-graph · zustand. 게이트: ESLint/Prettier + Husky + commitlint + lint-staged.

**참고 문서:** 설계 `docs/specs/2026-05-29-knowledge-graph-design.md` · ADR 0001~0006 · 게이트 셋업 `docs/setup-lint-format.md`

**브랜치 규칙:** 구현은 **작업 브랜치**에서. Task 1에서 `git checkout -b feat/mvp` 후 진행(main 직접 커밋 X). 커밋 메시지는 Conventional Commits(`type(scope): 한국어 제목`).

---

### Task 1: 프로젝트 셋업 + 개발 게이트

**Files:** 루트(`package.json` 등 자동 생성), `eslint.config.mjs`, `.prettierrc`, `commitlint.config.js`, `.husky/`, `vitest.config.ts`

- [x] **Step 1: 작업 브랜치 생성**

```bash
git checkout -b feat/mvp
```

- [x] **Step 2: Next.js 앱 스캐폴딩(현재 폴더)**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --use-npm
```

주의: 폴더가 비어있지 않다고 경고하면 — `docs/`, `.git`, `CLAUDE.md`, `.gitignore`는 보존되어야 한다. 충돌 파일(.gitignore 등)은 병합. (불안하면 임시 폴더에 생성 후 `src/`·설정만 옮긴다.)

- [x] **Step 3: 게이트 의존성 설치**

```bash
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional lint-staged vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
npx husky init
```

- [x] **Step 4: 설정 파일 작성** (`docs/setup-lint-format.md` 내용 그대로)

`eslint.config.mjs`, `.prettierrc` → setup-lint-format.md 참조(Storybook 제외). 그리고:

```js
// commitlint.config.js
export default { extends: ['@commitlint/config-conventional'] }
```

```bash
# .husky/commit-msg
npx --no -- commitlint --edit "$1"
```

```bash
# .husky/pre-commit
npx lint-staged
```

```json
// package.json 에 추가
"lint-staged": { "*.{ts,tsx}": ["eslint --fix", "prettier --write"] },
"scripts": { "test": "vitest" }
```

- [x] **Step 5: Vitest 설정**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true },
})
```

- [x] **Step 6: 게이트 동작 확인**

Run: `npm run lint` → 통과. 잘못된 메시지로 커밋 시도(`git commit --allow-empty -m "잘못된 메시지"`) → **commit-msg 훅이 막아야** 정상. (확인 후 그 빈 커밋은 만들지 않음)

- [x] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: 프로젝트 셋업 + 개발 게이트(eslint·prettier·husky·commitlint)"
```

---

### Task 2: 공유 타입 정의

**Files:** Create `src/lib/types.ts`

- [x] **Step 1: 타입 작성**

```ts
// src/lib/types.ts
export interface Candidate {
  text: string
  source: 'heading' | 'code' | 'bold'
}

export interface GraphNode {
  id: string
  label: string
  topic: string
}

export interface GraphEdge {
  id: string
  source: string
  target: string
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
```

- [x] **Step 2: 타입체크 + Commit**

Run: `npx tsc --noEmit` → 에러 없음.

```bash
git add src/lib/types.ts
git commit -m "feat(types): Candidate·GraphNode·GraphEdge·Graph 타입 정의"
```

---

### Task 3: 추출기 (마크다운 → 후보 키워드) ⭐ TDD 첫 체험

**Files:** Create `src/lib/extractor.ts`, Test `src/lib/extractor.test.ts`

규칙: 마크다운에서 **제목(`#`)·인라인 코드(`` `..` ``)·볼드(`**..**`)** 를 후보로 뽑는다. 트림·중복제거. (노이즈는 사람 확인 단계가 거른다 — ADR 0002.)

- [x] **Step 1: 실패 테스트 작성**

```ts
// src/lib/extractor.test.ts
import { describe, it, expect } from 'vitest'
import { extractCandidates } from './extractor'

describe('extractCandidates', () => {
  it('제목에서 개념을 뽑는다', () => {
    expect(extractCandidates('## React useEffect')).toContainEqual({ text: 'React useEffect', source: 'heading' })
  })
  it('인라인 코드를 뽑는다', () => {
    expect(extractCandidates('의존성 배열 `deps` 학습')).toContainEqual({ text: 'deps', source: 'code' })
  })
  it('볼드를 뽑는다', () => {
    expect(extractCandidates('**클로저**가 핵심')).toContainEqual({ text: '클로저', source: 'bold' })
  })
  it('빈 글이면 빈 배열', () => {
    expect(extractCandidates('')).toEqual([])
  })
  it('같은 후보는 한 번만', () => {
    const r = extractCandidates('`deps` 그리고 또 `deps`')
    expect(r.filter((c) => c.text === 'deps')).toHaveLength(1)
  })
})
```

- [x] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/extractor.test.ts`
Expected: FAIL — "extractCandidates is not a function" (아직 파일 없음).

- [x] **Step 3: 최소 구현**

```ts
// src/lib/extractor.ts
import type { Candidate } from './types'

export function extractCandidates(markdown: string): Candidate[] {
  const out: Candidate[] = []
  const seen = new Set<string>()
  const push = (raw: string, source: Candidate['source']) => {
    const text = raw.trim()
    if (!text) return
    const key = `${source}:${text.toLowerCase()}`
    if (seen.has(text.toLowerCase())) return
    seen.add(text.toLowerCase())
    out.push({ text, source })
  }
  for (const line of markdown.split('\n')) {
    const h = line.match(/^#{1,6}\s+(.+)$/)
    if (h) push(h[1], 'heading')
  }
  for (const m of markdown.matchAll(/`([^`]+)`/g)) push(m[1], 'code')
  for (const m of markdown.matchAll(/\*\*([^*]+)\*\*/g)) push(m[1], 'bold')
  return out
}
```

- [x] **Step 4: 통과 확인**

Run: `npx vitest run src/lib/extractor.test.ts`
Expected: PASS (5 tests).

- [x] **Step 5: Refactor**

`push` 안의 미사용 `key` 변수 제거. 다시 `npx vitest run` → 여전히 PASS.

- [x] **Step 6: Commit**

```bash
git add src/lib/extractor.ts src/lib/extractor.test.ts
git commit -m "feat(extractor): 마크다운에서 후보 키워드 추출 (TDD)"
```

---

### Task 4: 저장소 (localStorage + JSON)

- 그래프 파일(my-graph.json)을 그래프를 어떻게 저장·복원하나 단계
- 내가 채택해서 만든 그래프(어떤 점들이 있고, 어떻게 이어졌는지) → 이걸 저장
- 그래프를 손으로 만들었는데 새로고침하면 다 날아가면 안 되잖아요. 그래서:
  - localStorage = 브라우저에 자동 저장 → 새로고침·재방문해도 그래프가 남아있음.
  - JSON 내보내기/가져오기 = 그래프를 파일로 빼서 백업하거나 다른 기기로 옮김.

**Files:** Create `src/lib/storage.ts`, Test `src/lib/storage.test.ts`

- [x] **Step 1: 실패 테스트 작성**

```ts
// src/lib/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { saveGraph, loadGraph, exportJSON, importJSON } from './storage'
import type { Graph } from './types'

const sample: Graph = { nodes: [{ id: 'a', label: 'A', topic: 'React' }], edges: [] }

describe('storage', () => {
  beforeEach(() => localStorage.clear())
  it('저장하면 그대로 복원된다', () => {
    saveGraph(sample)
    expect(loadGraph()).toEqual(sample)
  })
  it('저장 전엔 빈 그래프', () => {
    expect(loadGraph()).toEqual({ nodes: [], edges: [] })
  })
  it('export → import 왕복', () => {
    expect(importJSON(exportJSON(sample))).toEqual(sample)
  })
})
```

- [x] **Step 2: 실패 확인**

Run: `npx vitest run src/lib/storage.test.ts` → FAIL.

- [x] **Step 3: 구현**

```ts
// src/lib/storage.ts
import type { Graph } from './types'

const KEY = 'knowledge-graph'
const EMPTY: Graph = { nodes: [], edges: [] }

export function saveGraph(graph: Graph): void {
  localStorage.setItem(KEY, JSON.stringify(graph))
}
export function loadGraph(): Graph {
  const raw = localStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as Graph) : EMPTY
}
export function exportJSON(graph: Graph): string {
  return JSON.stringify(graph, null, 2)
}
export function importJSON(json: string): Graph {
  return JSON.parse(json) as Graph // 입구(바깥 데이터): 호출부에서 try/catch
}
```

- [x] **Step 4: 통과 확인 + Commit**

Run: `npx vitest run src/lib/storage.test.ts` → PASS.

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat(storage): localStorage 저장/복원 + JSON 내보내기/가져오기 (TDD)"
```

---

### Task 5: 그래프 연산 + 상태

**Files:** Create `src/lib/graph-ops.ts` (+`.test.ts`), `src/lib/graph-store.ts`

- [x] **Step 1: 실패 테스트 작성 (순수 연산)**

```ts
// src/lib/graph-ops.test.ts
import { describe, it, expect } from 'vitest'
import { degree, isIsolated } from './graph-ops'
import type { GraphEdge } from './types'

const edges: GraphEdge[] = [
  { id: 'e1', source: 'a', target: 'b' },
  { id: 'e2', source: 'a', target: 'c' },
]
describe('graph-ops', () => {
  it('degree = 연결 수', () => {
    expect(degree(edges, 'a')).toBe(2)
    expect(degree(edges, 'b')).toBe(1)
  })
  it('isIsolated = 연결 0', () => {
    expect(isIsolated(edges, 'z')).toBe(true)
    expect(isIsolated(edges, 'a')).toBe(false)
  })
})
```

- [x] **Step 2: 실패 확인 → 구현**

Run: `npx vitest run src/lib/graph-ops.test.ts` → FAIL, 그다음:

```ts
// src/lib/graph-ops.ts
import type { GraphEdge } from './types'
export function degree(edges: GraphEdge[], nodeId: string): number {
  return edges.filter((e) => e.source === nodeId || e.target === nodeId).length
}
export function isIsolated(edges: GraphEdge[], nodeId: string): boolean {
  return degree(edges, nodeId) === 0
}
```

Run: `npx vitest run src/lib/graph-ops.test.ts` → PASS.

- [x] **Step 3: zustand 스토어**

```ts
// src/lib/graph-store.ts
import { create } from 'zustand'
import type { GraphNode, GraphEdge } from './types'

interface GraphState {
  nodes: GraphNode[]
  edges: GraphEdge[]
  addNode: (n: GraphNode) => void
  removeNode: (id: string) => void
  addEdge: (source: string, target: string) => void
  removeEdge: (id: string) => void
  setAll: (nodes: GraphNode[], edges: GraphEdge[]) => void
}

export const useGraph = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  addNode: (n) => set((s) => (s.nodes.some((x) => x.id === n.id) ? s : { nodes: [...s.nodes, n] })),
  removeNode: (id) =>
    set((s) => ({ nodes: s.nodes.filter((n) => n.id !== id), edges: s.edges.filter((e) => e.source !== id && e.target !== id) })),
  addEdge: (source, target) =>
    set((s) =>
      source === target ||
      s.edges.some((e) => (e.source === source && e.target === target) || (e.source === target && e.target === source))
        ? s
        : { edges: [...s.edges, { id: `${source}-${target}`, source, target }] }
    ),
  removeEdge: (id) => set((s) => ({ edges: s.edges.filter((e) => e.id !== id) })),
  setAll: (nodes, edges) => set({ nodes, edges }),
}))
```

(`npm install zustand` 필요 시 설치)

- [x] **Step 4: Commit**

Run: `npx vitest run` (전체) → PASS.

```bash
git add src/lib/graph-ops.ts src/lib/graph-ops.test.ts src/lib/graph-store.ts package.json
git commit -m "feat(graph): degree·isIsolated 연산(TDD) + zustand 그래프 스토어"
```

---

### Task 6: velog 라우트 (/api/velog)

**Files:** Create `src/lib/velog.ts` (+`.test.ts`), `src/app/api/velog/route.ts`

- [x] **Step 1: URL 파싱 실패 테스트 (순수)**

```ts
// src/lib/velog.test.ts
import { describe, it, expect } from 'vitest'
import { parseVelogUrl } from './velog'

describe('parseVelogUrl', () => {
  it('username과 slug를 뽑는다', () => {
    expect(parseVelogUrl('https://velog.io/@jjub0217/some-post')).toEqual({ username: 'jjub0217', urlSlug: 'some-post' })
  })
  it('velog 주소가 아니면 null', () => {
    expect(parseVelogUrl('https://example.com/a')).toBeNull()
  })
})
```

- [x] **Step 2: 실패 확인 → 구현**

Run FAIL, 그다음:

```ts
// src/lib/velog.ts
export interface VelogRef {
  username: string
  urlSlug: string
}

export function parseVelogUrl(url: string): VelogRef | null {
  const m = url.match(/velog\.io\/@([^/]+)\/([^/?#]+)/)
  if (!m) return null
  return { username: m[1], urlSlug: decodeURIComponent(m[2]) }
}

export async function fetchVelogMarkdown(ref: VelogRef): Promise<string> {
  const res = await fetch('https://v2.velog.io/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'query($u:String,$s:String){post(username:$u,url_slug:$s){body}}',
      variables: { u: ref.username, s: ref.urlSlug },
    }),
  })
  const json = await res.json()
  const body = json?.data?.post?.body
  if (typeof body !== 'string') throw new Error('velog 본문을 찾지 못함')
  return body
}
```

Run: `npx vitest run src/lib/velog.test.ts` → PASS (parseVelogUrl만 테스트, fetch는 라우트에서 수동 검증).

- [x] **Step 3: 서버 라우트**

```ts
// src/app/api/velog/route.ts
import { NextResponse } from 'next/server'
import { parseVelogUrl, fetchVelogMarkdown } from '@/lib/velog'

export async function POST(req: Request) {
  const { url } = await req.json() // 입구: 바깥 입력
  const ref = parseVelogUrl(url ?? '')
  if (!ref) return NextResponse.json({ error: 'velog 주소가 아니에요' }, { status: 400 })
  try {
    const markdown = await fetchVelogMarkdown(ref)
    return NextResponse.json({ markdown })
  } catch {
    return NextResponse.json({ error: 'velog에서 글을 가져오지 못했어요' }, { status: 502 })
  }
}
```

- [x] **Step 4: 수동 검증 + Commit**

Run: `npm run dev` → 다른 터미널에서
`curl -s -X POST localhost:3000/api/velog -H "Content-Type: application/json" -d '{"url":"https://velog.io/@jjub0217/Next.js의-세-가지-렌더링-방식"}' | head -c 200`
Expected: `{"markdown":"..."}` (마크다운 일부).

```bash
git add src/lib/velog.ts src/lib/velog.test.ts src/app/api/velog/route.ts
git commit -m "feat(velog): URL 파싱(TDD) + GraphQL 본문 가져오는 서버 라우트"
```

---

### Task 7: 입력 UI (파일 업로드 + velog 주소 → 후보)

**Files:** Create `src/components/InputPanel.tsx`

- [x] **Step 1: 컴포넌트 작성**

```tsx
// src/components/InputPanel.tsx
'use client'
import { useState } from 'react'
import { extractCandidates } from '@/lib/extractor'
import type { Candidate } from '@/lib/types'

export function InputPanel({ onCandidates }: { onCandidates: (c: Candidate[]) => void }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const c = extractCandidates(text)
    if (c.length === 0) setError('뽑을 개념이 없어요')
    onCandidates(c)
  }

  async function handleVelog() {
    setError('')
    const res = await fetch('/api/velog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    if (!res.ok) {
      setError('velog를 가져오지 못했어요 (마크다운을 직접 붙여넣어 보세요)')
      return
    }
    const { markdown } = await res.json()
    onCandidates(extractCandidates(markdown))
  }

  return (
    <div className="space-y-2">
      <input type="file" accept=".md" onChange={handleFile} />
      <div className="flex gap-2">
        <input className="border px-2" placeholder="velog 글 주소" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="border px-2" onClick={handleVelog}>
          가져오기
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
```

- [x] **Step 2: 수동 검증 + Commit**

`page.tsx`에 임시로 붙여 `npm run dev` → .md 업로드 시 후보가 콘솔/상태에 들어오는지 확인.

```bash
git add src/components/InputPanel.tsx
git commit -m "feat(input): .md 업로드 + velog 주소로 후보 추출"
```

---

### Task 8: 후보 확인 UI (→ 점 확정)

**Files:** Create `src/components/CandidateReview.tsx`

- [x] **Step 1: 컴포넌트 작성**

```tsx
// src/components/CandidateReview.tsx
'use client'
import { useState } from 'react'
import type { Candidate } from '@/lib/types'
import { useGraph } from '@/lib/graph-store'

export function CandidateReview({ candidates }: { candidates: Candidate[] }) {
  const addNode = useGraph((s) => s.addNode)
  const [topic, setTopic] = useState('기타')

  function accept(c: Candidate) {
    addNode({ id: c.text, label: c.text, topic })
  }

  return (
    <div className="space-y-1">
      <input className="border px-2" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="주제(색)" />
      <ul>
        {candidates.map((c) => (
          <li key={c.text} className="flex gap-2">
            <span>{c.text}</span>
            <button className="text-blue-500" onClick={() => accept(c)}>
              채택
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

(편집/버리기는 "채택 안 하면 버림"으로 단순화. 편집은 채택 후 라벨 수정 — 다음 반복.)

- [x] **Step 2: 수동 검증 + Commit**

`npm run dev` → 후보 "채택" 시 스토어에 점 추가되는지(다음 Task의 그래프로 확인).

```bash
git add src/components/CandidateReview.tsx
git commit -m "feat(review): 후보 채택 → 개념 점 확정(주제 지정)"
```

---

### Task 9: 그래프 화면 (react-force-graph)

**Files:** Create `src/components/GraphView.tsx`. `npm install react-force-graph`

⚠️ react-force-graph는 브라우저 전용(canvas) → **dynamic import + ssr:false** 필수.

- [x] **Step 1: 컴포넌트 작성**

```tsx
// src/components/GraphView.tsx
'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useGraph } from '@/lib/graph-store'
import { degree } from '@/lib/graph-ops'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

const COLORS = ['#4f46e5', '#16a34a', '#dc2626', '#d97706', '#0891b2', '#9333ea']
const colorOf = (topic: string) => COLORS[[...topic].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length]

export function GraphView() {
  const { nodes, edges, addEdge, removeEdge } = useGraph()
  const [pending, setPending] = useState<string | null>(null) // 연결 시작 노드

  const data = {
    // weak = 연결이 없거나(고립) 적은(약연결) 점: degree ≤ 1
    nodes: nodes.map((n) => ({ id: n.id, label: n.label, topic: n.topic, weak: degree(edges, n.id) <= 1 })),
    links: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
  }

  function onNodeClick(node: { id: string }) {
    if (!pending) setPending(node.id)
    else {
      addEdge(pending, node.id) // 클릭 두 번 = 수동 연결
      setPending(null)
    }
  }

  return (
    <ForceGraph2D
      graphData={data}
      nodeLabel="label"
      nodeColor={(n: any) => (n.weak ? '#9ca3af' : colorOf(n.topic))} // 고립·약연결 = 회색 강조
      nodeVal={(n: any) => (n.weak ? 6 : 4)} // + 크게
      onNodeClick={onNodeClick}
      onLinkClick={(l: any) => removeEdge(l.id)} // 선 클릭 = 삭제
    />
  )
}
```

(연결선 자동 추천·삭제 UI는 다음 반복. 고립 점은 회색+크게로 강조.)

- [x] **Step 2: page.tsx 조립 + 저장 연결**

```tsx
// src/app/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { InputPanel } from '@/components/InputPanel'
import { CandidateReview } from '@/components/CandidateReview'
import { GraphView } from '@/components/GraphView'
import { useGraph } from '@/lib/graph-store'
import { saveGraph, loadGraph } from '@/lib/storage'
import type { Candidate } from '@/lib/types'

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const { nodes, edges, setAll } = useGraph()

  useEffect(() => {
    const g = loadGraph()
    setAll(g.nodes, g.edges)
  }, [setAll]) // 첫 로드 복원
  useEffect(() => {
    saveGraph({ nodes, edges })
  }, [nodes, edges]) // 변경 시 저장

  return (
    <main className="space-y-4 p-4">
      <InputPanel onCandidates={setCandidates} />
      <CandidateReview candidates={candidates} />
      <div style={{ height: 500 }}>
        <GraphView />
      </div>
    </main>
  )
}
```

- [x] **Step 3: 수동 검증 + Commit**

`npm run dev` → 후보 채택 → 그래프에 점 표시 → 점 두 번 클릭으로 연결 → 같은 주제 같은 색, 고립 점 회색·크게 확인.

```bash
git add src/components/GraphView.tsx src/app/page.tsx package.json
git commit -m "feat(graph): react-force-graph 렌더·색·수동연결·고립강조"
```

---

### Task 10: 검색 + 주제 필터

**Files:** Create `src/components/SearchFilter.tsx`, Modify `GraphView`/`page.tsx`로 필터 적용

- [x] **Step 1: 컴포넌트 작성**

```tsx
// src/components/SearchFilter.tsx
'use client'
export function SearchFilter({
  query,
  onQuery,
  topics,
  active,
  onToggle,
}: {
  query: string
  onQuery: (q: string) => void
  topics: string[]
  active: Set<string>
  onToggle: (t: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input className="border px-2" placeholder="개념 검색" value={query} onChange={(e) => onQuery(e.target.value)} />
      {topics.map((t) => (
        <button key={t} className={active.has(t) ? 'font-bold' : 'opacity-50'} onClick={() => onToggle(t)}>
          {t}
        </button>
      ))}
    </div>
  )
}
```

- [x] **Step 2: 필터 로직 연결**

`page.tsx`에서 `query`·`active`(켜진 주제) 상태를 두고, GraphView에 넘길 nodes를 `label`에 query 포함 + topic이 active에 속하는 것으로 거른다(빈 active = 전체). edges는 양끝 노드가 보일 때만.

- [x] **Step 3: 수동 검증 + Commit**

`npm run dev` → 검색어로 점 줄어드는지, 주제 토글로 색 그룹 켜고 끄기 확인.

```bash
git add src/components/SearchFilter.tsx src/app/page.tsx
git commit -m "feat(filter): 개념 검색 + 주제별 거르기"
```

---

### Task 11: 페이지 컨트롤 (JSON 내보내기/가져오기 + 점 삭제)

**Files:** Create `src/components/Controls.tsx`, Modify `src/app/page.tsx`

- [x] **Step 1: 컨트롤 컴포넌트**

```tsx
// src/components/Controls.tsx
'use client'
import { useGraph } from '@/lib/graph-store'
import { exportJSON, importJSON } from '@/lib/storage'

export function Controls() {
  const { nodes, edges, setAll, removeNode } = useGraph()

  function download() {
    const blob = new Blob([exportJSON({ nodes, edges })], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'my-graph.json'
    a.click()
  }
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const g = importJSON(await file.text()) // 입구: 바깥 데이터
      setAll(g.nodes, g.edges)
    } catch {
      alert('올바른 그래프 JSON이 아니에요')
    }
  }
  return (
    <div className="flex items-center gap-2">
      <button className="border px-2" onClick={download}>
        JSON 내보내기
      </button>
      <label className="cursor-pointer border px-2">
        JSON 가져오기
        <input type="file" accept=".json" className="hidden" onChange={upload} />
      </label>
      <select className="border" value="" onChange={(e) => e.target.value && removeNode(e.target.value)}>
        <option value="">점 삭제…</option>
        {nodes.map((n) => (
          <option key={n.id} value={n.id}>
            {n.label}
          </option>
        ))}
      </select>
    </div>
  )
}
```

(점 삭제 시 스토어 `removeNode`가 연결선도 함께 정리 — Task 5. 선 삭제는 그래프에서 선 클릭 — Task 9.)

- [x] **Step 2: page.tsx에 추가**

`page.tsx`의 `<main>` 안 맨 위(InputPanel 위)에 `<Controls />`를 넣고 `import { Controls } from '@/components/Controls'`.

- [x] **Step 3: 수동 검증 + Commit**

`npm run dev` → JSON 내보내기(파일 다운로드) → 새 탭/캐시 비운 뒤 JSON 가져오기로 복원 → "점 삭제"로 점·연결선 함께 사라지는지 확인.

```bash
git add src/components/Controls.tsx src/app/page.tsx
git commit -m "feat(controls): JSON 내보내기/가져오기 + 점 삭제"
```

---

### 마무리

- [x] 전체 테스트: `npx vitest run` → 모두 PASS. `npm run lint` → 통과. `npx tsc --noEmit` → 에러 없음.
- [x] 골든패스 수동 점검: 로그 업로드 → 후보 채택 → 점 → 두 번 클릭 연결 → 새로고침해도 저장됨(localStorage) → JSON 내보내기/가져오기.
- [x] 사용자에게 동작 회귀 테스트 요청 후, `feat/mvp` 브랜치 정리(사용자가 머지).

## 다음(roadmap, 별도 계획)

배포 · 이해도 측정(퀴즈) · 다음 학습 추천 · 연결선 자동 추천 · 컴포넌트/E2E 테스트.
