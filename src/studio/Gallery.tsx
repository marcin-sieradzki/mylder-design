// The gallery: the studio's intro and the New design box in a column on the left, and every
// design, newest first, as a ruled table beside it, each row with its first screen drawn small. A
// row opens the design's board.
import { Alert, EmptyState, Separator, Text } from '@mylder/perron'
import type { Theme } from '../canvas/protocol.ts'
import { designs } from '../designs/registry.ts'
import { DEVICE_SIZE, type Design } from '../designs/types.ts'
import { useRun } from '../generate/run.ts'
import { Frame } from './Frame.tsx'
import { NewDesign } from './PromptPanel.tsx'
import { h1 } from '../kit/headings.tsx'
import { StudioBar } from './StudioBar.tsx'
import { hrefOf } from './useRoute.ts'

/** The box a row's preview fits in, in CSS px: a desktop screen's shape at 240 px wide. */
const PREVIEW = { width: 240, height: 150 }

function DesignRow({ design, theme }: { design: Design; theme: Theme }) {
  const cover = design.screens.find((s) => s.device === 'desktop') ?? design.screens[0]
  const size = cover ? DEVICE_SIZE[cover.device] : PREVIEW
  const scale = Math.min(PREVIEW.width / size.width, PREVIEW.height / size.height)
  return (
    <tr className="studio-designs-row">
      <td>
        <div className="studio-designs-preview">
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
      </td>
      <th scope="row" className="studio-designs-design">
        <a href={hrefOf({ page: 'design', designId: design.id })}>
          <Text variant="heading-sm">{design.title}</Text>
        </a>
        <Text variant="body-sm" emphasis="secondary">
          {design.summary}
        </Text>
      </th>
      <td className="studio-designs-number">
        <Text variant="data">{design.screens.length}</Text>
      </td>
      <td className="studio-designs-number">
        <Text variant="data">{design.explorations?.length || '—'}</Text>
      </td>
      <td className="studio-designs-number">
        <Text variant="data-sm" emphasis="secondary">
          {design.date}
        </Text>
      </td>
    </tr>
  )
}

export interface GalleryProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  /** The address named a design that doesn't exist */
  missing?: boolean
}

export function Gallery({ theme, onThemeChange, missing }: GalleryProps) {
  const { available } = useRun()
  return (
    <div className="studio-gallery">
      <StudioBar
        theme={theme}
        onThemeChange={onThemeChange}
        title={
          <Text variant="caption" emphasis="secondary">
            All designs
          </Text>
        }
      />
      <aside className="studio-gallery-side" aria-label="About and new design">
        <div className="studio-gallery-intro">
          <Text variant="heading-lg" render={h1}>
            Designs for Mylder
          </Text>
          <Text variant="body-sm" emphasis="secondary">
            New features for Mylder, the live map of Copenhagen&rsquo;s buses, S-tog, metro and
            trains, designed with Claude Code on the Perron design system. Open one to look closer,
            switch its tweaks and edit a draft of your own. Your draft stays in this browser.
          </Text>
        </div>
        <Separator />
        <NewDesign />
        <Text variant="caption" emphasis="secondary" className="studio-gallery-foot">
          Built on <a href="https://marcin-sieradzki.github.io/perron/">Perron</a>, for{' '}
          <a href="https://github.com/marcin-sieradzki/mylder">Mylder</a>. Source on{' '}
          <a href="https://github.com/marcin-sieradzki/mylder-design">GitHub</a>.
        </Text>
      </aside>
      <main className="studio-gallery-main">
        {missing ? (
          <Alert color="warning" title="No such design">
            The address names a design this studio doesn&rsquo;t have. Here are the ones it has.
          </Alert>
        ) : null}
        <table className="studio-designs" aria-label="Designs">
          <colgroup>
            <col className="studio-designs-col-preview" />
            <col />
            <col className="studio-designs-col-number" />
            <col className="studio-designs-col-number" />
            <col className="studio-designs-col-number" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">
                <Text variant="overline" emphasis="secondary">
                  {designs.length} {designs.length === 1 ? 'design' : 'designs'}
                </Text>
              </th>
              <th scope="col">
                <Text variant="overline" emphasis="secondary">
                  Design
                </Text>
              </th>
              <th scope="col" className="studio-designs-number">
                <Text variant="overline" emphasis="secondary">
                  Screens
                </Text>
              </th>
              <th scope="col" className="studio-designs-number">
                <Text variant="overline" emphasis="secondary">
                  Explorations
                </Text>
              </th>
              <th scope="col" className="studio-designs-number">
                <Text variant="overline" emphasis="secondary">
                  Generated
                </Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {designs.map((design) => (
              <DesignRow key={design.id} design={design} theme={theme} />
            ))}
          </tbody>
        </table>
        <EmptyState
          className="studio-designs-next"
          title={
            available
              ? 'The next design starts from a brief in New design'
              : 'The next design starts from a brief on the maintainer’s machine'
          }
        >
          Claude writes three directions, keeps one and draws it here.
        </EmptyState>
      </main>
    </div>
  )
}
