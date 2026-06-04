// 우리가 Task 2에서 만든 types.ts에서 Candidate 타입을 꺼내옵니다.
import type { Candidate } from './types'

// 이제부터 이 함수(extractCandidates)를 만들 겁니다. : 버전1
// export function extractCandidates(markdown: string): Candidate[] {
//   // return []

//   // 뽑은 후보를 담을 빈 배열을 하나 만듭니다.
//   const candidates: Candidate[] = []

//   // 제목(#)에서 개념 뽑기
//   for (const line of markdown.split('\n')) {
//     const match = line.match(/^#{1,6}\s+(.+)$/)
//     if (match) candidates.push({ text: match[1].trim(), source: 'heading' })
//   }

//   console.log('markdown', markdown) // ## React useEffect
//   console.log('candidates', candidates) // [ { text: 'React useEffect', source: 'heading' } ]

//   // 인라인 코드(`...`)에서 뽑기
//   for (const match of markdown.matchAll(/`([^`]+)`/g)) {
//     candidates.push({ text: match[1].trim(), source: 'code' })
//   }

//   // 볼드(**...**)에서 뽑기
//   for (const match of markdown.matchAll(/\*\*([^*]+)\*\*/g)) {
//     candidates.push({ text: match[1].trim(), source: 'bold' })
//   }

//   return candidates
//   // npx vitest run src/lib/extractor.test.ts
// }

// 이제부터 이 함수(extractCandidates)를 만들 겁니다. : 버전2
export function extractCandidates(markdown: string): Candidate[] {
  const candidates: Candidate[] = []
  const seenTexts: string[] = [] // 이미 넣은 후보 텍스트 목록 (중복 확인용)

  // 펜스 코드블록(``` … ```)을 먼저 제거 — 안의 코드는 개념이 아니므로 추출 대상에서 뺀다.
  const withoutFences = markdown.replace(/```[\s\S]*?```/g, '')

  // 후보 하나를 추가하되, 빈 값·중복은 거른다 (세 곳에서 공통으로 씀)
  function addCandidate(rawText: string, source: Candidate['source']) {
    const text = rawText.trim()
    if (!text) return // 빈 값이면 안 넣음
    if (seenTexts.includes(text.toLowerCase())) return // 이미 목록에 있으면 건너뜀 (중복 제거)
    seenTexts.push(text.toLowerCase())
    candidates.push({ text, source })
  }

  // 제목(#)에서 개념 뽑기
  for (const line of withoutFences.split('\n')) {
    const match = line.match(/^#{1,6}\s+(.+)$/)
    if (match) addCandidate(match[1], 'heading')
  }

  // 인라인 코드(`...`)에서 뽑기
  for (const match of withoutFences.matchAll(/`([^`]+)`/g)) {
    addCandidate(match[1], 'code')
  }

  // 볼드(**...**)에서 뽑기
  for (const match of withoutFences.matchAll(/\*\*([^*]+)\*\*/g)) {
    addCandidate(match[1], 'bold')
  }

  return candidates
}
