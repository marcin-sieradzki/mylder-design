// A node's address in a screen: the indices of its element ancestors below the screen's root,
// such as `0.2.1`. A screen renders the same tree every time, so an address found in one visit
// finds the same element in the next.

export function pathOf(element: Element, root: Element): string | undefined {
  const indices: number[] = []
  let node: Element | null = element
  while (node && node !== root) {
    const parent: Element | null = node.parentElement
    if (!parent) return undefined
    indices.unshift(Array.prototype.indexOf.call(parent.children, node))
    node = parent
  }
  return node === root && indices.length > 0 ? indices.join('.') : undefined
}

export function elementAt(root: Element, path: string): Element | undefined {
  let node: Element | undefined = root
  for (const index of path.split('.')) {
    node = node?.children[Number(index)]
    if (!node) return undefined
  }
  return node
}
