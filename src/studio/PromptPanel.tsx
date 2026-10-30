// The prompt box. On the maintainer's machine, under `npm run dev`, it runs Claude Code with the
// design skill: a brief makes a new design, a change revises the open one. Everywhere else, and
// on the public site, it says where designs come from instead.
import { Alert, Button, Surface, Text, TextArea } from '@mylder/perron'
import { useState } from 'react'
import type { GenerateEvent } from '../generate/events.ts'
import { startRun, stopRun, useRun } from '../generate/run.ts'

function line(event: GenerateEvent) {
  switch (event.type) {
    case 'text':
      return event.text
    case 'tool':
      return `${event.name} ${event.detail}`.trim()
    case 'done':
      return event.summary
    case 'error':
      return event.message
  }
}

interface PromptPanelProps {
  /** The design to revise; left out, the panel makes a new design */
  designId?: string
  label: string
  placeholder: string
  action: string
}

function PromptPanel({ designId, label, placeholder, action }: PromptPanelProps) {
  const run = useRun()
  const [prompt, setPrompt] = useState('')
  // the run shows where it was started: on its design's page, or in the gallery for a new one
  const mine = run.designId === designId
  const generator = {
    ...run,
    log: mine ? run.log : [],
    outcome: mine ? run.outcome : undefined,
    start: (text: string) => startRun({ prompt: text, designId }),
    stop: stopRun,
  }

  if (!generator.available)
    return (
      <Alert color="neutral" title="Generated on the maintainer's machine">
        Designs here are made with Claude Code on the maintainer&rsquo;s own computer and
        subscription, so this page can&rsquo;t make new ones. Edit a draft instead: it stays in your
        browser.
      </Alert>
    )

  return (
    <Surface variant="raised" className="studio-prompt" data-running={generator.running}>
      <TextArea
        label={label}
        placeholder={placeholder}
        rows={3}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        disabled={generator.running}
      />
      <div className="studio-prompt-actions">
        {generator.running ? (
          <>
            <Text variant="body-sm" emphasis="secondary">
              {mine
                ? 'Claude is working. New screens appear on the board as they are written.'
                : 'Claude is working on another design.'}
            </Text>
            <Button variant="outline" onClick={generator.stop}>
              Stop
            </Button>
          </>
        ) : (
          <Button
            color="brand"
            disabled={!prompt.trim()}
            onClick={() => void generator.start(prompt.trim())}
          >
            {action}
          </Button>
        )}
      </div>
      {generator.log.length > 0 ? (
        <ol className="studio-prompt-log" aria-label="What Claude has done">
          {generator.log.map((event, i) => (
            <li key={i} data-type={event.type}>
              <Text variant={event.type === 'tool' ? 'data-sm' : 'body-sm'} emphasis="secondary">
                {line(event)}
              </Text>
            </li>
          ))}
        </ol>
      ) : null}
      {generator.outcome ? (
        <Alert
          color={generator.outcome.type === 'done' && generator.outcome.ok ? 'success' : 'danger'}
          title={generator.outcome.type === 'done' && generator.outcome.ok ? 'Done' : 'It stopped'}
        >
          {line(generator.outcome)}
        </Alert>
      ) : null}
    </Surface>
  )
}

export function NewDesign() {
  return (
    <PromptPanel
      label="New design"
      placeholder="A feature for Mylder, such as a replay of this morning's rush hour"
      action="Generate"
    />
  )
}

export function ReviseDesign({ designId }: { designId: string }) {
  return (
    <PromptPanel
      designId={designId}
      label="Change this design"
      placeholder="What to change, such as a calmer scrubber or a Danish phone screen"
      action="Revise"
    />
  )
}
