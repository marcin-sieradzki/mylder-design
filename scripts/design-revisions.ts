// A Vite plugin that serves virtual:design-revisions: a short hash of each design folder's files,
// so a visitor's draft knows which version of the design it was made on.
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import type { Plugin } from 'vite'

const ID = 'virtual:design-revisions'
const RESOLVED = `\0${ID}`

function filesUnder(dir: string): string[] {
  return readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const path = join(dir, name)
      return statSync(path).isDirectory() ? filesUnder(path) : [path]
    })
}

/** Each design folder's revision, by folder name. */
export function designRevisions(designsDir: string): Record<string, string> {
  const revisions: Record<string, string> = {}
  for (const name of readdirSync(designsDir).sort()) {
    const dir = join(designsDir, name)
    if (!statSync(dir).isDirectory()) continue
    const hash = createHash('sha256')
    for (const file of filesUnder(dir)) {
      hash.update(relative(dir, file))
      hash.update(readFileSync(file))
    }
    revisions[name] = hash.digest('hex').slice(0, 12)
  }
  return revisions
}

export function designRevisionsPlugin(designsDir: string): Plugin {
  return {
    name: 'mylder-design:revisions',
    resolveId: (id) => (id === ID ? RESOLVED : undefined),
    load: (id) =>
      id === RESOLVED ? `export default ${JSON.stringify(designRevisions(designsDir))}` : undefined,
    configureServer(server) {
      // a design's file changed, came or went: work the revisions out again on the next load
      server.watcher.on('all', (_event, file) => {
        if (!file.startsWith(designsDir)) return
        const module = server.moduleGraph.getModuleById(RESOLVED)
        if (module) server.moduleGraph.invalidateModule(module)
      })
    },
  }
}
