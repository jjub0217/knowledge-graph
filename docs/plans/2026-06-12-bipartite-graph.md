# 이분 그래프 C-MVP 구현 계획

> **체크박스 갱신 규칙**: Task·Step을 끝내면 그때그때 `- [ ]`를 `- [x]`로 (PR·머지 시점에 함께). 진행 상황과 문서가 어긋나지 않게. → conventions.md §6.
> **구현 코드는 사용자가 직접 타이핑**, Claude는 제시·리뷰만. 아래 코드는 *참고안*이다.

**Goal:** 여러 자료(`.md`·velog)를 넣으면 개념을 자동 추출·정규화해 **문서·개념 이분 그래프**를 자동으로 그리고, 공유 개념으로 자료들이 이어지는 걸 발견하는 웹앱(C-MVP).

**Architecture:** 순수 로직(`normalize`·`graph-builder`·`graph-ops`)은 `src/lib`에 TDD로. **그래프 = 올린 문서 집합의 파생**(store가 문서 보관 → 매번 빌드). 화면은 클라이언트(canvas, react-force-graph-2d). 저장은 로그인 시 Supabase(문서 집합 영속).

**Tech Stack:** Next.js 16 · React 19 · TS 5 · Tailwind 4 · zustand · react-force-graph-2d · Supabase. 테스트: Vitest(유닛) + RTL(폼) + **Playwright(E2E·canvas 게이트, 신규)**.

**참고 문서:** spec `docs/specs/2026-06-12-bipartite-graph-design.md` · ADR 0013(피벗)·0014(문서 집합 저장)·0011(DB)·0012(dev/prod) · roadmap.

**브랜치 규칙:** 이슈 생성 → 작업 브랜치 `feat/N-설명`(main 직접 커밋 X) → **Task별 작은 PR**(Kimi 빈응답 방지) → Kimi 리뷰 → **사용자 머지**. 커밋 = Conventional Commits(scope 없음, `type: 한국어 제목 (#N)`).

> ✅ **DB 영속 대상 = "문서 집합"(확정)**: Task 8에서 옛 nodes/edges 테이블 대신 `documents`를 저장한다. 그래프는 파생이라 문서만 저장하면 복원 시 다시 빌드된다. **이유**: 빌더(추출·정규화·필터)가 로드맵대로 계속 바뀌어도 — 저장된 *문서*로 다시 빌드하면 개선이 옛 데이터에 자동 반영되어 데이터 마이그레이션 세금이 안 든다(원천만 저장). (반려한 대안: 빌드된 그래프 저장 — 인프라 재사용은 쉬우나 빌더 변경마다 마이그레이션 필요·진실의 원천이 둘로 갈림.)

---

### Task 1: 브랜치 + 데이터 모델/타입 갱신

**Files:** Modify `src/lib/types.ts`

평평한 `{id,label,topic}` → 노드에 `kind` 추가, 엣지는 문서→개념 멤버십. 입력 단위 `DocumentInput` 신설.

- [ ] **Step 1: 브랜치**

```bash
git checkout -b feat/N-bipartite-types
```

- [ ] **Step 2: 타입 작성**

```ts
// src/lib/types.ts
export interface Candidate {
  text: string
  source: 'heading' | 'code' | 'bold'
}

export type NodeKind = 'document' | 'concept'

export interface GraphNode {
  id: string
  kind: NodeKind
  label: string // 화면 표시 (개념은 첫 등장 원형 표기)
}

export interface GraphEdge {
  id: string
  source: string // 문서 노드 id
  target: string // 개념 노드 id (방향: 문서 → 개념, 멤버십)
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// 입력 단위: 자료 하나(= 문서 노드 + 거기서 뽑은 개념들)
export interface DocumentInput {
  id: string // 출처 기반 안정 키 (파일명 또는 velog URL)
  label: string // 화면 표시 (파일명 또는 velog 제목/URL)
  concepts: string[] // 추출된 원형 개념 텍스트(정규화 전)
}
```

- [ ] **Step 3: 타입체크 + Commit**

`npx tsc --noEmit` → (이 시점엔 옛 모델 쓰는 곳에서 에러가 날 수 있음. 후속 Task에서 정리되므로, 이 Task는 타입 파일만 커밋.)

```bash
git add src/lib/types.ts
git commit -m "feat: 이분 그래프 타입(kind·멤버십 엣지·DocumentInput) (#N)"
```

---

### Task 2: 정규화 `normalize` ⭐ TDD

**Files:** Create `src/lib/normalize.ts` (+`.test.ts`)

규칙: **앞뒤 공백 제거 → 소문자 → 공백·`-`·`_` 묶음을 공백 하나로.** 비교·병합용 *키*만 만든다(표시는 원형 유지). 표기가 다른 의미적 동일성(클로저/closure)은 다루지 않음(ADR 0013 보류).

- [ ] **Step 1: 실패 테스트**

```ts
// src/lib/normalize.test.ts
import { describe, it, expect } from 'vitest'
import { normalizeConcept } from './normalize'

describe('normalizeConcept', () => {
  it('대소문자를 통일한다', () => {
    expect(normalizeConcept('React')).toBe(normalizeConcept('react'))
  })
  it('앞뒤 공백을 없앤다', () => {
    expect(normalizeConcept('  클로저  ')).toBe('클로저')
  })
  it('공백·하이픈·언더스코어를 공백 하나로 묶는다', () => {
    expect(normalizeConcept('use-effect')).toBe('use effect')
    expect(normalizeConcept('use_effect')).toBe('use effect')
    expect(normalizeConcept('use   effect')).toBe('use effect')
  })
  it('빈 값은 빈 값', () => {
    expect(normalizeConcept('   ')).toBe('')
  })
})
```

- [ ] **Step 2: 실패 확인 → 최소 구현**

```ts
// src/lib/normalize.ts
export function normalizeConcept(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ' ')
    .trim()
}
```

- [ ] **Step 3: 통과 + Commit**

`npx vitest run src/lib/normalize.test.ts` → PASS.

```bash
git add src/lib/normalize.ts src/lib/normalize.test.ts
git commit -m "feat: 개념 표기 정규화 함수 (TDD) (#N)"
```

---

### Task 3: 그래프 빌더 `graph-builder` ⭐ TDD (핵심)

**Files:** Create `src/lib/graph-builder.ts` (+`.test.ts`)

문서들 → 이분 그래프. **같은 정규화 키 = 같은 개념 노드(병합)** → 여러 문서가 그 개념을 *다리* 삼아 이어진다. 개념 노드 `label`은 **첫 등장 원형**. 한 문서가 같은 개념을 여러 번 담아도 멤버십 엣지는 하나.

- [ ] **Step 1: 실패 테스트 (골든 케이스 = "두 문서가 공유 개념으로 이어진다")**

```ts
// src/lib/graph-builder.test.ts
import { describe, it, expect } from 'vitest'
import { buildGraph } from './graph-builder'
import type { DocumentInput } from './types'

const docs: DocumentInput[] = [
  { id: 'react.md', label: 'react.md', concepts: ['useEffect', '클로저'] },
  { id: 'js.md', label: 'js.md', concepts: ['클로저', '스코프'] },
]

describe('buildGraph', () => {
  it('문서·개념 노드를 만든다', () => {
    const g = buildGraph(docs)
    expect(g.nodes.filter((n) => n.kind === 'document')).toHaveLength(2)
    expect(g.nodes.filter((n) => n.kind === 'concept')).toHaveLength(3) // useEffect·클로저·스코프
  })
  it('공유 개념은 하나의 노드로 병합되어 두 문서를 잇는다', () => {
    const g = buildGraph(docs)
    const 클로저 = g.nodes.filter((n) => n.kind === 'concept' && n.label === '클로저')
    expect(클로저).toHaveLength(1)
    // 클로저 노드로 들어오는 멤버십 엣지가 두 문서에서 하나씩
    const into클로저 = g.edges.filter((e) => e.target === 클로저[0].id)
    expect(into클로저).toHaveLength(2)
  })
  it('정규화로 표기가 다른 같은 개념을 병합한다', () => {
    const g = buildGraph([
      { id: 'a', label: 'a', concepts: ['React'] },
      { id: 'b', label: 'b', concepts: ['react'] },
    ])
    expect(g.nodes.filter((n) => n.kind === 'concept')).toHaveLength(1)
  })
  it('개념 노드 label은 첫 등장 원형을 유지한다', () => {
    const g = buildGraph([
      { id: 'a', label: 'a', concepts: ['React'] },
      { id: 'b', label: 'b', concepts: ['react'] },
    ])
    expect(g.nodes.find((n) => n.kind === 'concept')!.label).toBe('React')
  })
  it('한 문서가 같은 개념을 여러 번 담아도 멤버십 엣지는 하나', () => {
    const g = buildGraph([{ id: 'a', label: 'a', concepts: ['클로저', '클로저'] }])
    expect(g.edges).toHaveLength(1)
  })
  it('빈 개념은 노드가 안 된다', () => {
    const g = buildGraph([{ id: 'a', label: 'a', concepts: ['', '  '] }])
    expect(g.nodes.filter((n) => n.kind === 'concept')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: 실패 확인 → 구현**

```ts
// src/lib/graph-builder.ts
import type { DocumentInput, Graph, GraphNode, GraphEdge } from './types'
import { normalizeConcept } from './normalize'

export function buildGraph(documents: DocumentInput[]): Graph {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const conceptIdByKey = new Map<string, string>() // 정규화 키 → 개념 노드 id
  const seenEdge = new Set<string>()

  for (const doc of documents) {
    const docNodeId = `doc:${doc.id}`
    nodes.push({ id: docNodeId, kind: 'document', label: doc.label })

    for (const raw of doc.concepts) {
      const key = normalizeConcept(raw)
      if (!key) continue // 빈 개념 제외

      let conceptId = conceptIdByKey.get(key)
      if (!conceptId) {
        conceptId = `concept:${key}`
        conceptIdByKey.set(key, conceptId)
        nodes.push({ id: conceptId, kind: 'concept', label: raw.trim() }) // 첫 등장 원형
      }

      const edgeId = `${docNodeId}->${conceptId}`
      if (seenEdge.has(edgeId)) continue // 같은 문서-개념 쌍 중복 제거
      seenEdge.add(edgeId)
      edges.push({ id: edgeId, source: docNodeId, target: conceptId })
    }
  }
  return { nodes, edges }
}
```

- [ ] **Step 3: 통과 + Commit**

`npx vitest run src/lib/graph-builder.test.ts` → PASS.

```bash
git add src/lib/graph-builder.ts src/lib/graph-builder.test.ts
git commit -m "feat: 문서→이분 그래프 빌더(개념 병합·멤버십 엣지) (TDD) (#N)"
```

---

### Task 4: graph-ops 확인 + graph-store 파생 전환

**Files:** Modify `src/lib/graph-ops.ts`(+test 보강), `src/lib/graph-store.ts`

- [ ] **Step 1: graph-ops** — `degree`/`isIsolated`는 엣지 기반이라 그대로 동작. 테스트에 멤버십 엣지 케이스 한 줄 추가(문서/개념 양쪽 degree 계산 확인). `isIsolated = degree 0` 유지.

- [ ] **Step 2: store를 "문서 보관 + 파생 그래프"로 재작성**

```ts
// src/lib/graph-store.ts
import { create } from 'zustand'
import type { DocumentInput, Graph } from './types'
import { buildGraph } from './graph-builder'

interface GraphState {
  documents: DocumentInput[]
  graph: Graph // 파생 — documents에서 빌드
  addDocument: (doc: DocumentInput) => void // 같은 id면 교체(중복 입력 병합)
  removeDocument: (id: string) => void
  setDocuments: (docs: DocumentInput[]) => void // 복원용
}

function rebuild(documents: DocumentInput[]): Pick<GraphState, 'documents' | 'graph'> {
  return { documents, graph: buildGraph(documents) }
}

export const useGraph = create<GraphState>((set, get) => ({
  documents: [],
  graph: { nodes: [], edges: [] },
  addDocument: (doc) => {
    const rest = get().documents.filter((d) => d.id !== doc.id) // 같은 출처면 갱신
    set(rebuild([...rest, doc]))
  },
  removeDocument: (id) => set(rebuild(get().documents.filter((d) => d.id !== id))),
  setDocuments: (docs) => set(rebuild(docs)),
}))
```

> 옛 `addNode·addEdge·removeNode·removeEdge·setAll`은 제거(파생 모델이라 직접 편집 안 함). 이걸 쓰던 곳(GraphView 수동연결·CandidateReview·Controls)은 다음 Task들에서 정리.

- [ ] **Step 3: Commit**

```bash
git add src/lib/graph-ops.ts src/lib/graph-ops.test.ts src/lib/graph-store.ts
git commit -m "feat: 그래프 스토어를 문서 집합 파생 구조로 전환 (#N)"
```

---

### Task 5: InputPanel 다중 누적 (수정) + RTL

**Files:** Modify `src/components/InputPanel.tsx` (+`.test.tsx`)

자료 하나 입력 → `DocumentInput` 만들어 `addDocument`로 **누적**(기존엔 후보를 부모로 올려 교체했음).

- [ ] **Step 1: 컴포넌트 수정 (요지)**
  - `.md` 업로드: `concepts = extractCandidates(text).map(c => c.text)` → `addDocument({ id: file.name, label: file.name, concepts })`. 여러 번 올리면 쌓임.
  - velog: 응답에서 `markdown` + (가능하면 제목). `id/label = url`(또는 제목), `concepts = extractCandidates(markdown).map(c=>c.text)`.
  - 추출 0개·실패 시 에러 문구(기존 유지). `onCandidates` prop 제거 — 부모 대신 store에 직접 추가.

- [ ] **Step 2: RTL 테스트** — 파일 업로드 이벤트 → store에 문서가 늘고, 추출 0개일 때 에러 문구가 뜨는지. (velog는 fetch mock.)

- [ ] **Step 3: Commit**

```bash
git add src/components/InputPanel.tsx src/components/InputPanel.test.tsx
git commit -m "feat: 입력 패널 다중 자료 누적(문서 노드 생성) + RTL (#N)"
```

---

### Task 6: GraphView 이분 렌더 (수정)

**Files:** Modify `src/components/GraphView.tsx`

- [ ] **Step 1: 수정 (요지)**
  - props 대신 store의 `graph`(파생) 사용: `const { graph } = useGraph()`.
  - **노드 종류 구분**: `nodeColor = n.kind === 'document' ? 파랑 : 회녹색`(고립은 회색 우선). 문서는 `nodeVal` 크게/네모(선택: `nodeCanvasObject`로 사각형) — MVP는 색+크기 차이로 충분.
  - 고립 강조: `isIsolated(graph.edges, n.id)` → 회색·크게(기존 로직 재사용).
  - **제거**: `onNodeClick`(수동 연결)·`onLinkClick`(선 삭제)·`pending` 상태·주제 색 `colorOf`.
  - 라벨 항상 표시(`nodeCanvasObjectMode='after'`)는 유지.

- [ ] **Step 2: 수동 검증** — 자료 2개 올려 공유 개념으로 이어지는지, 문서/개념이 색으로 구분되는지(여기선 눈으로, 자동 게이트는 Task 9 Playwright).

- [ ] **Step 3: Commit**

```bash
git add src/components/GraphView.tsx
git commit -m "feat: 그래프 화면 이분 렌더(문서/개념 구분)·수동연결 제거 (#N)"
```

---

### Task 7: page 조립 + Controls 개편 (문서 목록/삭제)

**Files:** Modify `src/app/page.tsx`, `src/components/Controls.tsx`. **삭제**: `src/components/CandidateReview.tsx`(+test)

- [ ] **Step 1: page.tsx** — `candidates` 상태·`CandidateReview` 제거. 구성: `AuthButton` · `Controls` · `InputPanel` · `SearchFilter` · `GraphView`. 첫 로드/로그인 시 `loadDocuments()` → `setDocuments`, 변경 시 디바운스 저장(Task 8). SearchFilter는 `graph.nodes`에서 동작(개념 라벨 검색 + 문서/개념 토글 정도).

- [ ] **Step 2: Controls 개편** — "점 삭제 select" → **문서 목록 + 문서 삭제**(`removeDocument`). JSON 내보내기/가져오기는 *문서 집합* 기준으로(원하면). CandidateReview import 제거.

- [ ] **Step 3: 수동 검증 + Commit**

```bash
git rm src/components/CandidateReview.tsx src/components/CandidateReview.test.tsx
git add -A
git commit -m "feat: 페이지 조립(채택 단계 제거) + 문서 목록/삭제 (#N)"
```

---

### Task 8: DB 스키마 마이그레이션 + 저장 (수동 검수)

**Files:** Supabase `migrations/*.sql`, Modify `src/lib/storage.ts`, `src/lib/graph-rows.ts`, `src/app/api/graph/route.ts`

> ✅ **영속 대상 = 문서 집합(확정)** — 원천만 저장, 복원 시 재빌드. dev/prod 분리 환경([0012]) 위에서 진행 — **로컬 `supabase start` 먼저**, `db reset` 뒤 재로그인.

- [ ] **Step 1: 마이그레이션** — `documents(id text, user_id uuid FK, label text, concepts text[], created_at)` + RLS(`user_id = auth.uid()`). 옛 `nodes`·`edges` 테이블은 드롭(또는 보류). 저장 = 사용자별 문서 전체 교체 RPC `replace_documents`(원자적, 기존 `replace_graph` 패턴 재사용).

- [ ] **Step 2: storage.ts** — `saveDocuments(docs)`(로그인 시 서버, 비로그인 no-op) / `loadDocuments()`(로그인 시 서버, 비로그인 예시). 옛 `saveGraph/loadGraph`(그래프 단위) 대체.

- [ ] **Step 3: graph-rows.ts (TDD 보강)** — DB 행 ↔ `DocumentInput[]` 변환 순수 함수 `rowsToDocuments`. 유닛 테스트.

- [ ] **Step 4: 수동 검수** — 로그인 → 자료 올림 → 새로고침/다른 기기서 복원 → DB 행 증거. (mock 통과 ≠ 동작 — 실제 브라우저로.)

- [ ] **Step 5: Commit (작은 PR로 분할 권장)**

```bash
git add -A
git commit -m "feat: 문서 집합 DB 스키마·저장/복원 마이그레이션 (#N)"
```

---

### Task 9: example-graph 이분 예시 (첫 방문 시드)

**Files:** Modify `src/lib/example-graph.ts`

- [ ] 첫 방문(비로그인)에 보일 **문서 2~3개 + 공유 개념**으로 이분 예시. "어떻게 쓰는지"가 한눈에 보이도록(공유 개념이 자료를 잇는 그림). `loadDocuments` 비로그인 분기에서 반환.

```bash
git commit -m "feat: 이분 그래프 예시 시드(공유 개념으로 이어진 문서들) (#N)"
```

---

### Task 10: Playwright 셋업 + 골든패스 + canvas 스모크 (자동 게이트)

**Files:** `playwright.config.ts`, `e2e/graph.spec.ts`, devDep `@playwright/test`

> 커버리지 함정 메우기(spec §9). 실제 브라우저라 canvas를 진짜 그림 → RTL이 못 보던 "그래프가 뜨나"를 잡음.

- [ ] **Step 1: 설치/설정** — `npm i -D @playwright/test && npx playwright install chromium`. `playwright.config.ts`(webServer로 `npm run dev` 띄움).
- [ ] **Step 2: 골든패스 + 스모크**
  - 예시 그래프가 있는 첫 화면에서 `<canvas>`가 존재하고 크기 > 0.
  - `.md` 두 개 업로드 → 문서 목록/카운트가 늘고 → `<canvas>` 유지(크래시 없음).
  - **canvas 스모크**: `canvas.toDataURL()` 또는 픽셀 검사로 *완전 빈 화면이 아님* 확인.
  - (시각 회귀 `toHaveScreenshot`은 force 레이아웃 비결정성 때문에 **선택/보류** — 필요 시 위치 고정 후.)
- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: Playwright 골든패스 + canvas 스모크 게이트 (#N)"
```

---

### 마무리

- [ ] 전체 게이트: `npx vitest run` · `npm run lint` · `npx tsc --noEmit` · `npx playwright test` → 모두 통과.
- [ ] **수동 검수(진짜 게이트)**: 자료 여러 개 올려 *공유 개념으로 이어지는지*, 문서/개념 구분·고립 강조, 로그인 저장·복원(멀티기기). "관계가 보기 좋게 드러나나"는 눈으로.
- [ ] 빌드 저널·interview-prep 라이브 갱신(피벗 이유·정규화/빌더 TDD·Playwright 도입 트러블슈팅).
- [ ] 각 Task 작은 PR → Kimi 리뷰 → **사용자 머지**.

## 다음 (roadmap, 별도 계획)

추출 정교화 · 퀴즈로 이해도 측정(LLM은 여기) · 이해도 표시 · 다음 학습 추천 · (노이즈 심하면) "2+문서 공유 개념만" 좁히기 · 개념 별칭/임베딩.
