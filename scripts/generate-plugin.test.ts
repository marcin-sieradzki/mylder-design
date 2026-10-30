import type { IncomingMessage } from 'node:http'
import { describe, expect, it } from 'vitest'
import { fromStudio, instructionFor } from './generate-plugin.ts'

const request = (method: string, headers: Record<string, string>) =>
  ({ method, headers: { host: 'localhost:5173', ...headers } }) as unknown as IncomingMessage

describe('the generate route', () => {
  it('takes the studio’s own JSON posts', () => {
    const json = { 'content-type': 'application/json' }
    expect(fromStudio(request('POST', { origin: 'http://localhost:5173', ...json }))).toBe(true)
    expect(fromStudio(request('POST', json))).toBe(true)
    expect(fromStudio(request('GET', {}))).toBe(true)
  })

  it('refuses other sites and bodies that skip the preflight', () => {
    const json = { 'content-type': 'application/json' }
    expect(fromStudio(request('POST', { origin: 'https://example.com', ...json }))).toBe(false)
    expect(fromStudio(request('DELETE', { origin: 'https://example.com' }))).toBe(false)
    expect(fromStudio(request('POST', { 'content-type': 'text/plain' }))).toBe(false)
  })

  it('runs the design skill on a brief, or on a design to revise', () => {
    expect(instructionFor({ prompt: 'A replay' })).toBe('/design A replay')
    expect(instructionFor({ prompt: 'Calmer', designId: 'rush-hour-replay' })).toBe(
      '/design revise rush-hour-replay: Calmer',
    )
  })
})
