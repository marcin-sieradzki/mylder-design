import { describe, expect, it } from 'vitest'
import { emptyDraft, loadDraft, saveDraft } from './store.ts'

describe('the draft store', () => {
  it('keeps a draft per design and forgets an empty one', () => {
    const draft = {
      ...emptyDraft('abc'),
      edits: [{ screen: 'phone', node: '0', kind: 'hide' as const }],
    }
    saveDraft('rush-hour', draft, localStorage)
    expect(loadDraft('rush-hour', localStorage)).toEqual(draft)
    expect(loadDraft('other', localStorage)).toBeUndefined()
    saveDraft('rush-hour', emptyDraft('abc'), localStorage)
    expect(localStorage.getItem('mylder-design/draft/rush-hour')).toBeNull()
  })

  it('works without storage and ignores what it cannot read', () => {
    expect(loadDraft('x', undefined)).toBeUndefined()
    expect(() => saveDraft('x', emptyDraft('a'), undefined)).not.toThrow()
    localStorage.setItem('mylder-design/draft/broken', '{not json')
    expect(loadDraft('broken', localStorage)).toBeUndefined()
  })
})
