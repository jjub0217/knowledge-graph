// ───────────────────────────────────────────────────────────────────────────
// 이 파일은 "테스트 파일"입니다. (이름이 .test.ts 라서 Vitest가 테스트로 인식)
// TDD의 첫 단계인 RED: 아직 구현(extractor.ts)이 없는 상태에서, "이 함수가
// 어떻게 동작하길 원하는지"를 먼저 테스트로 적어 일부러 실패시켜 봅니다.
// ───────────────────────────────────────────────────────────────────────────

// [import] vitest 라이브러리 안에 들어있는 함수 3개(describe·it·expect)를 "꺼내온다".
//   - 중괄호 { } 로 골라 꺼내는 것 = "이름 있는 가져오기(named import)".
//   - 참고: vitest.config.ts 에 globals:true 를 켜둬서 사실 import 없이도 쓸 수 있지만,
//     어디서 온 함수인지 명확히 보이도록 일부러 명시적으로 import 합니다.
import { describe, it, expect } from 'vitest'

// [import] 우리가 "이제부터 만들 함수" extractCandidates 를 같은 폴더('./')의
//   extractor 파일에서 꺼내온다. 지금은 그 파일이 없어서 이 줄부터 실패합니다(=RED의 원인).
//   테스트는 extractCandidates를 import해서 쓰겠다고 적어놨는데,
//   그 함수가 아직 존재하지 않음 → 그래서 테스트가 실패(RED).
//   다음 단계(GREEN)에서 이 함수를 직접 만들어 실패를 통과로 바꿉니다.

import { extractCandidates } from './extractor'

// [describe] 관련된 여러 테스트를 하나로 "묶는(그룹짓는)" 메소드.
//   - 1번째 인자 '개념 후보 추출' : 이 묶음의 "이름표(라벨)"인 그냥 문자열.
//       콘솔에 제목처럼 찍힌다. 검사 대상을 알아보기 쉽게 한글로 적은 이름표일 뿐, 함수 자체는 아님.
//   - 2번째 인자 () => { ... } : 콜백 함수. 이 안에 실제 테스트(it)들을 담는다.
//       describe는 이 콜백을 즉시 실행해서 안의 it 들을 "등록"한다.
describe('개념 후보 추출', () => {
  // [it] 테스트 "한 개"를 정의하는 메소드. ("it should ~" 처럼 읽으라고 이름이 it)
  //   - 1번째 인자 '제목에서 개념을 뽑는다' : 이 테스트가 "무엇을 기대하는지"를 적는 설명 문장.
  //       실패하면 이 문장이 그대로 콘솔에 떠서 "무엇이 깨졌는지" 바로 안다.
  //   - 2번째 인자 () => { ... } : 콜백 함수. 이 안에서 실제로 "검사"를 수행한다.
  it('제목에서 개념을 뽑는다', () => {
    // [expect] "실제 값"을 감싸서 "이걸 검사하겠다"고 선언하는 메소드.
    //   expect(검사할 값).matcher(기대값) 형태로 쓴다. (matcher = 기대를 표현하는 메소드)
    //  - 여기서 "검사할 값"은 extractCandidates('## React useEffect')의 결과로, 배열이 들어온다.
    //  예시: 배열 [{ text:'React useEffect', source:'heading' }] 가 들어온다.
    //  expect(검사할 값) 의 반환값은,  matcher(검사 메소드)들이 잔뜩 달린 "검사 도구 객체"가 된다.
    /** {
    toContainEqual: f(),   // "포함하나?" 검사 함수
    toEqual:        f(),   // "전체 같나?" 검사 함수
    toHaveLength:   f(),   // "길이 n인가?" 검사 함수
    toBe:           f(),
    ... (수십 개)
  }
   */
    // [.toContainEqual] matcher: "이 배열 안에, 내가 준 객체와 '값이 똑같은' 원소가 들어있나?"
    //   - 순서·다른 원소는 상관없이, 깊은 비교(객체 속 값까지 비교)로 포함 여부만 본다.
    //   - 함수가 객체들의 배열을 돌려주므로, 그 안에 이 객체 하나가 있으면 통과.
    console.log('test 파일', extractCandidates('## React useEffect'))

    expect(extractCandidates('## React useEffect')).toContainEqual({ text: 'React useEffect', source: 'heading' })
  })

  // [it] 테스트 한 개
  // — 1번째 인자 '인라인 코드를 뽑는다' : 이 테스트가 "무엇을 기대하는지"를 적는 설명 문장.
  // 2번째 인자 () => {} = 검사 콜백. 이 안에서 실제로 "검사"를 수행한다.
  it('인라인 코드를 뽑는다', () => {
    // [expect] 검사할 값 = extractCandidates('의존성 배열 `deps` 학습') 의 반환값(후보 배열).
    //   예시: [{ text:'deps', source:'code' }] 가 들어온다. (expect는 이 값을 기억한 "검사 도구 객체"를 돌려줌)
    // [.toContainEqual] matcher: 그 배열 안에 { text:'deps', source:'code' } 와 값이 똑같은 원소가 있나?
    //   백틱(`)으로 감싼 `deps` 같은 "인라인 코드"를 source:'code' 후보로 뽑길 기대.
    expect(extractCandidates('의존성 배열 `deps` 학습')).toContainEqual({ text: 'deps', source: 'code' })
  })

  // [it] 테스트 한 개 — 1번째 인자 '볼드를 뽑는다' = 기대 동작 설명, 2번째 인자 () => {} = 검사 콜백.
  it('볼드를 뽑는다', () => {
    // [expect] 검사할 값 = extractCandidates('**클로저**가 핵심') 의 반환값(후보 배열).
    //   예시: [{ text:'클로저', source:'bold' }] 가 들어온다.
    // [.toContainEqual] matcher: 그 배열 안에 { text:'클로저', source:'bold' } 와 값이 똑같은 원소가 있나?
    //   별표 두 개(**)로 감싼 **클로저** 같은 "볼드"를 source:'bold' 후보로 뽑길 기대.
    expect(extractCandidates('**클로저**가 핵심')).toContainEqual({ text: '클로저', source: 'bold' })
  })

  // [it] 테스트 한 개 — 1번째 인자 '빈 글이면 빈 배열' = 기대 동작 설명, 2번째 인자 () => {} = 검사 콜백.
  it('빈 글이면 빈 배열', () => {
    // [expect] 검사할 값 = extractCandidates('') 의 반환값. 빈 문자열이라 뽑을 게 없어 [] (빈 배열)이 들어온다.
    // [.toEqual] matcher: "전체 값"이 기대값과 '깊게 똑같은가'를 본다. (toContainEqual은 '포함', toEqual은 '전체 일치')
    //   결과가 정확히 빈 배열 [] 이어야 통과.
    expect(extractCandidates('')).toEqual([])
  })

  // [it] 테스트 한 개 — 1번째 인자 '같은 후보는 한 번만' = 기대 동작 설명, 2번째 인자 () => {} = 검사 콜백. (중복 제거 검사)
  it('같은 후보는 한 번만', () => {
    // 같은 'deps'가 두 번 나와도 중복 없이 한 번만 뽑히는지(중복 제거) 검사.
    // 먼저 함수 반환값을 변수 candidates 에 담는다. (중복 제거됐다면 'deps' 후보는 1개뿐일 것)
    const candidates = extractCandidates('`deps` 그리고 또 `deps`')
    // [expect] 검사할 값 = candidates.filter((candidate) => candidate.text === 'deps') — text가 'deps'인 원소만 골라 만든 새 배열.
    //   (.filter = 조건에 맞는 원소만 추려 새 배열을 돌려주는 자바스크립트 내장 메소드)
    // [.toHaveLength] matcher: 그 배열의 길이(.length)가 정확히 1인지 본다. (1개뿐 = 중복이 제거됨)
    expect(candidates.filter((candidate) => candidate.text === 'deps')).toHaveLength(1)
  })
})
