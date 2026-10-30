// The dev server's generate route: the studio's prompt box asks it to run Claude Code in this
// repository, on the maintainer's own machine and Claude subscription, and streams what Claude
// does back as newline-delimited GenerateEvents. It exists only under `vite` (dev); the static
// build has no server, so on the public site nobody can generate.
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import type { IncomingMessage } from 'node:http'
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
  'mcp__perron__list_tokens',
  'mcp__perron__search_docs',
  'mcp__perron__get_reference',
]

async function bodyOf(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8')
}

const claudeAvailable = () => spawnSync('claude', ['--version'], { stdio: 'ignore' }).status === 0

export function generatePlugin(root: string): Plugin {
  let run: ChildProcess | undefined
  let available: boolean | undefined

  return {
    name: 'mylder-design:generate',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(GENERATE_ROUTE, (request, response) => {
        void (async () => {
          if (request.method === 'GET') {
            available ??= claudeAvailable()
            const status: GenerateStatus = { available, running: run !== undefined }
            response.setHeader('content-type', 'application/json')
            response.end(JSON.stringify(status))
            return
          }
          if (request.method === 'DELETE') {
            run?.kill('SIGINT')
            response.statusCode = 204
            response.end()
            return
          }
          if (request.method !== 'POST') {
            response.statusCode = 405
            response.end()
            return
          }
          if (run) {
            response.statusCode = 409
            response.end('Claude is already working on a design.')
            return
          }
          const body = JSON.parse(await bodyOf(request)) as GenerateRequest
          if (!body.prompt?.trim()) {
            response.statusCode = 400
            response.end('A brief is needed.')
            return
          }
          response.setHeader('content-type', 'application/x-ndjson')
          const send = (event: GenerateEvent) => response.write(`${JSON.stringify(event)}\n`)

          const args = ['-p', instructionFor(body), '--output-format', 'stream-json', '--verbose']
          args.push('--mcp-config', '.mcp.json', '--allowedTools', ...ALLOWED_TOOLS)
          if (process.env.MYLDER_DESIGN_MODEL) args.push('--model', process.env.MYLDER_DESIGN_MODEL)
          if (process.env.MYLDER_DESIGN_EFFORT)
            args.push('--effort', process.env.MYLDER_DESIGN_EFFORT)
          // the skill screenshots its screens through this same dev server
          const env = {
            ...process.env,
            MYLDER_DESIGN_URL: server.resolvedUrls?.local[0]?.replace(/\/$/, ''),
          }
          const child = spawn('claude', args, { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] })
          run = child

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
            run = undefined
            response.end()
          })
          // the studio tab closed or stopped reading: stop Claude too
          response.on('close', () => {
            if (!response.writableFinished) child.kill('SIGINT')
          })
        })()
      })
    },
  }
}
