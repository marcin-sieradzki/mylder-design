import { beforeEach, describe, expect, it } from 'vitest'
import { Applier, isTextNode, withEdit, type Change, type Edit } from './edits.ts'
import { elementAt, pathOf } from './paths.ts'

let root: HTMLElement

beforeEach(() => {
  document.body.innerHTML = `
    <div id="root">
      <section data-layer="Panel" style="padding: 4px">
        <h2>Rush hour</h2>
        <p>From <b>07:00</b> to 09:00</p>
      </section>
      <footer>Simulated data</footer>
    </div>`
  root = document.getElementById('root')!
})

describe('paths', () => {
  it('finds an element again from its path', () => {
    const bold = root.querySelector('b')!
    const path = pathOf(bold, root)
    expect(path).toBe('0.1.0')
    expect(elementAt(root, path!)).toBe(bold)
  })

  it('has no path for the root or an element outside it', () => {
    expect(pathOf(root, root)).toBeUndefined()
    expect(pathOf(document.body, root)).toBeUndefined()
    expect(elementAt(root, '5.0')).toBeUndefined()
  })
})

describe('Applier', () => {
  const edit = (e: Change & { node: string }) => ({ screen: 'desktop', ...e }) as Edit

  it('sets text, token styles and hides', () => {
    const missing = new Applier().apply(root, [
      edit({ node: '0.0', kind: 'text', value: 'Morning rush' }),
      edit({ node: '0', kind: 'background', token: 'color.surface.raised' }),
      edit({ node: '1', kind: 'hide' }),
    ])
    expect(missing).toEqual([])
    expect(root.querySelector('h2')!.textContent).toBe('Morning rush')
    const panel = root.querySelector('section')!
    expect(panel.style.getPropertyValue('background')).toBe('var(--perron-color-surface-raised)')
    expect(panel.style.getPropertyValue('padding')).toBe('4px')
    expect(root.querySelector('footer')!.style.display).toBe('none')
  })

  it('puts every touched node back before applying a shorter list', () => {
    const applier = new Applier()
    applier.apply(root, [
      edit({ node: '0.0', kind: 'text', value: 'Morning rush' }),
      edit({ node: '0', kind: 'padding', token: 'space.600' }),
    ])
    applier.apply(root, [])
    expect(root.querySelector('h2')!.textContent).toBe('Rush hour')
    expect(root.querySelector('section')!.getAttribute('style')).toBe('padding: 4px')
  })

  it('remembers text a person typed over, so undo restores the design', () => {
    const applier = new Applier()
    const heading = root.querySelector('h2')!
    applier.remember(heading)
    heading.textContent = 'Typed'
    applier.apply(root, [])
    expect(heading.textContent).toBe('Rush hour')
  })

  it('reports edits whose node is gone', () => {
    const gone = edit({ node: '9', kind: 'hide' })
    expect(new Applier().apply(root, [gone])).toEqual([gone])
  })
})

describe('isTextNode and withEdit', () => {
  it('edits text only where an element holds text alone', () => {
    expect(isTextNode(root.querySelector('h2')!)).toBe(true)
    expect(isTextNode(root.querySelector('p')!)).toBe(false)
  })

  it('replaces an edit of the same kind on the same node', () => {
    const first: Edit = { screen: 's', node: '0', kind: 'gap', token: 'space.100' }
    const second: Edit = { screen: 's', node: '0', kind: 'gap', token: 'space.200' }
    const other: Edit = { screen: 's', node: '0', kind: 'hide' }
    expect(withEdit([first, other], second)).toEqual([other, second])
  })
})
