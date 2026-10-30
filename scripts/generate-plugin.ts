// The dev server's generate route: the studio's prompt box asks it to run Claude Code in this
// repository, on the maintainer's own machine and Claude subscription, and streams what Claude
// does back as newline-delimited GenerateEvents. It exists only under `vite` (dev); the static
// build has no server, so on the public site nobody can generate.
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import {
  eventsOf,
  GENERATE_ROUTE,
  type GenerateEvent,
  type GenerateRequest,
  type GenerateStatus,
} from '../src/generate/events.ts'

/** What Claude Code is told: run the design skill on the brief, or revise a design with it. */
export function instructionFor({ prompt, designId }: GenerateRequest): string {
  return designId ? `/design revise ${designId}: ${prompt}` : `/design ${prompt}`
}

/** The tools Claude Code may use without asking, for a run nobody is there to approve. */
const ALLOWED_TOOLS = [
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'Skill',
  'Bash(npm run *)',
  'Bash(npx prettier *)',
  'Bash(node scripts/*)',
  'Bash(rm designs/*)',
  'Bash(mv designs/*)',
  'mcp__perron__list_tokens',
  'mcp__perron__search_docs',
  'mcp__perron__get_reference',
]

/** How long a stopped run gets to finish before it is killed outright. */
const STOP_GRACE_MS = 5000

async function bodyOf(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8')
}

/**
 * Whether a request comes from the studio itself. A page on any other site could otherwise
 * post to localhost and start Claude: browsers send Origin with every cross-site POST, and only
 * a JSON body (which needs a preflight this route never answers) is taken.
 */
export function fromStudio(request: IncomingMessage): boolean {
  const origin = request.headers.origin
  if (origin !== undefined && origin !== `http://${request.headers.host}`) return false
  return (
    request.method !== 'POST' ||
    (request.headers['content-type'] ?? '').startsWith('application/json')
  )
}

const claudeAvailable = () => spawnSync('claude', ['--version'], { stdio: 'ignore' }).status === 0

function answer(response: ServerResponse, status: number, text = '') {
  response.statusCode = status
  response.end(text)
}

export function generatePlugin(root: string): Plugin {
  let run: ChildProcess | undefined
  /** A POST is between its check and its spawn */
  let starting = false
  let available: boolean | undefined

  const stop = () => {
    const child = run
    if (!child) return
    child.kill('SIGINT')
    setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
    }, STOP_GRACE_MS).unref()
  }

  return {
    name: 'mylder-design:generate',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(GENERATE_ROUTE, (request, response) => {
        if (!fromStudio(request)) return answer(response, 403)
        if (request.method === 'GET') {
          available ??= claudeAvailable()
          const status: GenerateStatus = { available, running: run !== undefined || starting }
          response.setHeader('content-type', 'application/json')
          return response.end(JSON.stringify(status))
        }
        if (request.method === 'DELETE') {
          stop()
          return answer(response, 204)
        }
        if (request.method !== 'POST') return answer(response, 405)
        if (run || starting) return answer(response, 409, 'Claude is already working on a design.')
        starting = true

        void (async () => {
          let body: GenerateRequest
          try {
            body = JSON.parse(await bodyOf(request)) as GenerateRequest
          } catch {
            starting = false
            return answer(response, 400, 'The request is not JSON.')
          }
          if (typeof body.prompt !== 'string' || !body.prompt.trim()) {
            starting = false
            return answer(response, 400, 'A brief is needed.')
          }
          response.setHeader('content-type', 'application/x-ndjson')
          const send = (event: GenerateEvent) => response.write(`${JSON.stringify(event)}\n`)

          const args = ['-p', instructionFor(body), '--output-format', 'stream-json', '--verbose']
          args.push('--mcp-config', '.mcp.json', '--allowedTools', ...ALLOWED_TOOLS)
          if (process.env.MYLDER_DESIGN_MODEL) args.push('--model', process.env.MYLDER_DESIGN_MODEL)
          if (process.env.MYLDER_DESIGN_EFFORT)
            args.push('--effort', process.env.MYLDER_DESIGN_EFFORT)
          // the skill screenshots its screens through this same dev server
          const url = server.resolvedUrls?.local[0]?.replace(/\/$/, '')
          const env = { ...process.env, MYLDER_DESIGN_URL: url }
          const child = spawn('claude', args, { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] })
          run = child
          starting = false

          let buffered = ''
          child.stdout.setEncoding('utf8')
          child.stdout.on('data', (chunk: string) => {
            buffered += chunk
            const lines = buffered.split('\n')
            buffered = lines.pop() ?? ''
            for (const line of lines) for (const event of eventsOf(line)) send(event)
          })
          let errors = ''
          child.stderr.setEncoding('utf8')
          child.stderr.on('data', (chunk: string) => (errors += chunk))
          child.on('error', (error) => send({ type: 'error', message: error.message }))
          child.on('close', (code) => {
            for (const event of eventsOf(buffered)) send(event)
            if (code !== 0)
              send({ type: 'error', message: errors.trim() || `claude exited ${code}` })
            if (run === child) run = undefined
            response.end()
          })
          // the studio tab closed or stopped reading: stop Claude too
          response.on('close', () => {
            if (!response.writableFinished && run === child) stop()
          })
        })()
      })
    },
  }
}
