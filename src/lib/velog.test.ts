import { describe, it, expect } from 'vitest'
import { parseVelogUrl } from './velog'

describe('parseVelogUrl', () => {
  it('username과 slug를 뽑는다', () => {
    expect(parseVelogUrl('https://velog.io/@jjub0217/some-post')).toEqual({ username: 'jjub0217', urlSlug: 'some-post' })
  })
  it('velog 주소가 아니면 null', () => {
    // toBeNull =  값이 정확히 null인가
    expect(parseVelogUrl('https://example.com/a')).toBeNull()
  })
})
