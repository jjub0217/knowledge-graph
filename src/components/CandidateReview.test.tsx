import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CandidateReview } from './CandidateReview'
import { useGraph } from '@/lib/graph-store'

describe('CandidateReview', () => {
  // 각 테스트 전에 스토어 비우기 (테스트끼리 안 섞이게 — localStorage.clear()와 같은 정신)
  beforeEach(() => useGraph.setState({ nodes: [], edges: [] }))

  // [it] 테스트 "한 개"를 정의하는 메소드. ("it should ~" 처럼 읽으라고 이름이 it)
  //   - 1번째 인자 '제목에서 개념을 뽑는다' : 이 테스트가 "무엇을 기대하는지"를 적는 설명 문장.
  //       실패하면 이 문장이 그대로 콘솔에 떠서 "무엇이 깨졌는지" 바로 안다.
  //   - 2번째 인자 () => { ... } : 콜백 함수. 이 안에서 실제로 "검사"를 수행한다.
  it('후보를 화면에 보여준다', () => {
    render(<CandidateReview candidates={[{ text: '클로저', source: 'bold' }]} />)
    // screen = 그려진 화면
    // screen.getByText('클로저') = 그 텍스트를 가진 요소 찾기
    // toBeInTheDocument() = 화면에 있나 검사
    expect(screen.getByText('클로저')).toBeInTheDocument()
  })

  it('채택을 누르면 스토어에 점이 추가된다', () => {
    render(<CandidateReview candidates={[{ text: '클로저', source: 'bold' }]} />)
    // fireEvent.click(요소) = 클릭 흉내
    fireEvent.click(screen.getByText('채택'))
    /**
     *  useGraph.getState() = {
          nodes: [ { id: '클로저', label: '클로저', topic: '기타' } ],  // ← 점들의 배열
          edges: [],
          addNode: f, removeNode: f, …                                  // action 함수들
        }
        // useGraph.getState().nodes = 스토어에서 점들의 배열 읽기
        // toHaveLength(1) = 배열 길이(.length)가 정확히 1인가 
     */
    expect(useGraph.getState().nodes).toHaveLength(1)

    /**
     *  nodes[0] = 배열의 첫 번째 점 → { id:'클로저', label:'클로저', topic:'기타' }
    // useGraph.getState() = 스토어 세팅
    // toBe('클로저') = 정확히 '클로저'인가
     */
    expect(useGraph.getState().nodes[0].label).toBe('클로저')
  })
})
