# Mylder Design

A design studio for [Mylder](https://github.com/marcin-sieradzki/mylder), the live map of Copenhagen's buses, S-tog, metro and trains. Every design here is a new Mylder feature, generated with Claude Code on the [Perron](https://marcin-sieradzki.github.io/perron/) design system and drawn as real Perron screens for a phone and a desktop.

**[Open the studio](https://marcin-sieradzki.github.io/mylder-design/)**

![A visitor opens Rush hour replay, plays the morning, jumps to a disruption, types over the title, gives the header a Perron surface, turns a tweak, switches to light and undoes it all](docs/media/studio.gif)

[The same walk-through as a video](docs/media/studio.mp4). It was recorded with `node scripts/record.ts rush-hour-replay` against the static build.

## The designs

- **[Rush hour replay](designs/rush-hour-replay/)**: replay this morning's rush hour, 06:00 to 10:00, as Mylder recorded it, with City pulse following the clock and the busiest minute and the disruptions a press away. Generated from the studio's own prompt box with the `design` skill: three directions, one kept, three screens, four tweaks.
- **[Mylder today](designs/mylder-today/)**: Mylder's map screen as it ships today, the reference every new design starts from.

## What you can do

- **Look.** Each design shows its screens side by side, the directions it set aside along the way and the brief it came from. Switch light and dark, and zoom.
- **Interact.** The screens work: scrub a timeline, switch a tab.
- **Edit a draft.** Click any part of a screen to select it, double-click text to type over it, pick a Perron colour, space or radius for it, hide it, and turn the design's tweaks. Undo and redo as you go. Your draft is kept in your browser only; the saved design never changes, and nothing is sent anywhere.
- **Hand it back.** "Copy as a prompt for Claude" turns a draft into instructions the maintainer can paste into Claude Code to make it part of the design.

There is no login and no server. The public site can't generate designs; only the maintainer's machine can.

## How it works

A design is a folder in [`designs/`](designs/): a `design.ts` that describes it (title, brief, screens, the explorations set aside, tweaks) and one React component per screen, built from `@mylder/perron`, its patterns and a small kit in [`src/kit/`](src/kit/) (a drawing of Copenhagen with vehicles moving in their data states, and Perron's icons). The studio draws each screen in a same-origin iframe from `canvas.html`, and applies a visitor's draft to it as a list of edits kept in `localStorage`. Each edit names an element by its place in the screen and sets text or a Perron token, so a draft can never step outside Perron.

Generating runs [Claude Code](https://claude.com/claude-code) with the [`design` skill](.claude/skills/design/SKILL.md): it reads Mylder's brief in [`docs/mylder.md`](docs/mylder.md) and Perron's brand and voice, makes three directions, keeps one with a reason for setting the others aside, builds its desktop and phone screens and tweaks, then checks its own work with `npm run check` and screenshots of every screen in both themes.

## Generating a design

On the maintainer's machine, signed in to Claude Code:

```sh
npm install
npm run dev
```

Open http://localhost:5173 and write a brief in the prompt box, or revise an open design from its page. The dev server runs `claude -p "/design …"` in this repository on your own subscription and streams what Claude does into the page; the new screens appear on the board as they are written. `MYLDER_DESIGN_MODEL` and `MYLDER_DESIGN_EFFORT` pick the model and its effort, such as `opus` and `high`.

Or run the skill straight from Claude Code: `/design a replay of this morning's rush hour`.

To look at screens the way the skill does: `node scripts/shoot.ts <design-id>` with the dev server running (`npx playwright install chromium` once).

## Scripts

| Script                  | What it does                                               |
| ----------------------- | ---------------------------------------------------------- |
| `npm run dev`           | The studio with the prompt box, on http://localhost:5173   |
| `npm run build`         | The static site in `dist/`; `BASE_PATH` sets its base path |
| `npm run check`         | Types, lint, format, unit tests and the build              |
| `npm run e2e`           | The public site's flows in a browser, on the build         |
| `node scripts/shoot.ts` | Screenshots of a design's screens in light and dark        |

The site deploys to GitHub Pages from `main`.
