// The gallery: every design, newest first, each a card with its first screen drawn small. A card
// opens the design's board.
import { Alert, Tag, Text } from '@mylder/perron'
import type { Theme } from '../canvas/protocol.ts'
import { designs } from '../designs/registry.ts'
import { DEVICE_SIZE, type Design } from '../designs/types.ts'
import { Frame } from './Frame.tsx'
import { NewDesign } from './PromptPanel.tsx'
import { h1, h2 } from '../kit/headings.tsx'
import { StudioBar } from './StudioBar.tsx'
import { hrefOf } from './useRoute.ts'

/** The box a card's preview fits in, in CSS px: a desktop screen's shape at 360 px wide. */
const PREVIEW = { width: 360, height: 225 }

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

function DesignCard({ design, theme }: { design: Design; theme: Theme }) {
  const cover = design.screens.find((s) => s.device === 'desktop') ?? design.screens[0]
  const size = cover ? DEVICE_SIZE[cover.device] : PREVIEW
  const scale = Math.min(PREVIEW.width / size.width, PREVIEW.height / size.height)
  return (
    <a className="studio-card" href={hrefOf({ page: 'design', designId: design.id })}>
      <div className="studio-card-preview">
        {cover ? (
          <Frame
            designId={design.id}
            screen={cover}
            theme={theme}
            scale={scale}
            tweaks={{}}
            mode="static"
          />
        ) : null}
      </div>
      <div className="studio-card-body">
        <Text variant="heading-sm" render={h2}>
          {design.title}
        </Text>
        <Text variant="body-sm" emphasis="secondary">
          {design.summary}
        </Text>
        <div className="studio-card-tags">
          <Tag>{plural(design.screens.length, 'screen', 'screens')}</Tag>
          {design.explorations?.length ? (
            <Tag variant="dashed">
              {plural(design.explorations.length, 'exploration', 'explorations')}
            </Tag>
          ) : null}
          <Text variant="data-sm" emphasis="tertiary">
            {design.date}
          </Text>
        </div>
      </div>
    </a>
  )
}

export interface GalleryProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  /** The address named a design that doesn't exist */
  missing?: boolean
}

export function Gallery({ theme, onThemeChange, missing }: GalleryProps) {
  return (
    <div className="studio-gallery">
      <StudioBar theme={theme} onThemeChange={onThemeChange} />
      <main className="studio-gallery-main">
        <div className="studio-gallery-intro">
          <Text variant="display" render={h1}>
            Designs for Mylder
          </Text>
          <Text variant="body" emphasis="secondary">
            New features for Mylder, the live map of Copenhagen&rsquo;s buses, S-tog, metro and
            trains, designed with Claude Code on the Perron design system. Open one to look closer,
            switch its tweaks and edit a draft of your own. Your draft stays in this browser.
          </Text>
        </div>
        {missing ? (
          <Alert color="warning" title="No such design">
            The address names a design this studio doesn&rsquo;t have. Here are the ones it has.
          </Alert>
        ) : null}
        <NewDesign />
        <div className="studio-gallery-grid">
          {designs.map((design) => (
            <DesignCard key={design.id} design={design} theme={theme} />
          ))}
        </div>
      </main>
      <footer className="studio-gallery-foot">
        <Text variant="caption" emphasis="secondary">
          Built on <a href="https://marcin-sieradzki.github.io/perron/">Perron</a>, for{' '}
          <a href="https://github.com/marcin-sieradzki/mylder">Mylder</a>. Source on{' '}
          <a href="https://github.com/marcin-sieradzki/mylder-design">GitHub</a>.
        </Text>
      </footer>
    </div>
  )
}
