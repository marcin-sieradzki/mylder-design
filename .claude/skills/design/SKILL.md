---
name: design
description: Designing Mylder screens in this studio. Use to generate a new design from a brief, revise a saved design, or apply a visitor's draft that the maintainer pasted in.
argument-hint: '<brief> | revise <design-id>: <change> | <pasted draft>'
---

A design is a folder in `designs/<id>/`: a `design.ts` described with `defineDesign` (`src/designs/types.ts`) and one React component per screen in `screens/`, built on Perron. The studio draws each screen in a phone or desktop frame and lets visitors edit a draft of it. Read `designs/mylder-today/` once: it draws Mylder's map screen as it is today, and every rule below shows in it.

Pick the branch from the arguments: a brief makes a **new design**; `revise <id>: …` is a **revision**; text that starts "Apply this draft to the design" is a **draft to apply**. Nobody may be there to answer questions (the studio runs you with `claude -p`), so when a brief leaves something open, decide, and record the decision in the design's `brief` field under "Decisions".

## Before any screen

1. Read `docs/mylder.md`: the product, its screens today, the data states, the words and the real lines and stops.
2. Read Perron's brand and voice with the Perron MCP's `search_docs` (queries `brand`, `voice`, `data states`, `colour`, `layout`); without the MCP, read `node_modules/@mylder/perron/README.md` and grep `node_modules/@mylder/perron/data/docs.json`.
3. For each Perron component or pattern you use, read its props in `node_modules/@mylder/perron/dist/components/<Name>/<Name>.d.ts` (patterns under `dist/patterns/`). Never guess a prop.

Done when you can name, for the brief, which Perron components and patterns carry it and which data states and words it shows.

## New design

1. **Directions.** Write three phone screens that answer the brief in three clearly different ways (layout, what leads, how much the map shows), as `screens/direction-a.tsx`, `-b`, `-c`. Keep each to the one screen that decides the direction.
2. **Choose.** Screenshot them (see Checking) and look at the images. Keep the direction that best serves a rider and best fits Perron; write one sentence on why each other one was set aside. List those two in `explorations` with their `verdict`; the kept one leaves explorations and becomes the base for step 3.
3. **Build** the kept direction as the design's `screens`: a desktop screen and a phone screen at least, and a second state when the feature has one that matters (empty, scrubbing, a sheet open). Name files by device and state: `desktop.tsx`, `phone.tsx`, `phone-detail.tsx`. Delete the kept direction's file once its screens exist.
4. **Tweaks.** Add two to four tweaks a visitor would want to turn, such as density, the panel's side, how much of the map shows, or which state is in focus. See Tweaks.
5. **Describe** the design in `design.ts`: `id` (the folder), `title` (the feature's name), `summary` (one sentence on what it does for a rider), `brief` (the brief as given, then "Decisions:" with what you decided), `date` (today), `screens`, `explorations`, `tweaks`.
6. Run Checking.

Done when the design has its screens, explorations with verdicts, tweaks, and passes Checking.

## Revision

Change only what the brief asks, in the named design. Keep every screen's id and the order of elements a change doesn't touch: visitors' drafts address elements by their position in the tree. Add a screen rather than reshape one when the brief asks for a new state. Run Checking.

## Draft to apply

The draft lists, per screen, each element by its path below `#root`, its layer and text, and the change. Find each element in the screen's source by its layer and text (paths shift when you edit, so trust the text over the path), make the change with Perron tokens, and make listed tweak values the defaults. Run Checking.

## Writing a screen

- A screen file default-exports a component that takes no props and fills its frame (`height: 100%`). The canvas wraps it in `PerronProvider`; never add another.
- Every `.tsx` in `screens/` is a screen. Put parts the screens share in `parts/` and sample data in `data.ts`, both beside `screens/`.
- Build from `@mylder/perron` and `@mylder/perron/patterns` first, then `#kit` (`CityMap` for the Copenhagen map backdrop, `Icon` for Perron's icons, and `h1`, `h2`, `h3` for Text's `render`, as `render={h2}`). Use a plain element only for layout. If Perron lacks a component the design needs, compose it from Perron parts and say so in "Decisions".
- Style in one CSS file beside the screens (`screens/screens.css` or `screens/<name>.css`), imported by each screen. Use only `var(--perron-…)` for colour, space, radius, shadow, type and motion; no hex, rgb or named colours; px only for a frame's own layout sizes. Prefix every class with the design's id so designs don't collide.
- Lay panels over the map as Mylder does: `Surface variant="glass"` with Perron's panel gap from the edges. At most one brand (yellow) action per screen; everything else is ink.
- Write in Perron's voice: sentence case, plain sentences, the 24-hour clock, a space before units, "—" for unknown, no emoji and no exclamation marks. Use the words in `docs/mylder.md` and real Copenhagen lines, stops and times.
- Render the same tree every time: no `Date.now()`, `Math.random()` or data fetched at run time. Fixed sample data lives in the screen file or a `data.ts` beside it.
- Name the parts a visitor would want to edit with `data-layer="<name in sentence case>"` on their element: panels, headings, key figures, controls. The studio shows these names.
- Interaction is welcome when it shows the idea (a working scrubber, tabs that switch), with React state only.

## Tweaks

A tweak sets `data-tweak-<id>` on the screen's `<html>` to the chosen option's value. The screen's CSS reads it, for example `html[data-tweak-density='compact'] .rush-hour-panel { … }`, and the CSS without the attribute must look like the tweak's `defaultValue`. Never read a tweak from React.

## Checking

1. `npm run check` passes (types, lint, format, the designs' own tests and the build). `npm run format` fixes formatting.
2. With `npm run dev` running, `node scripts/shoot.ts <design-id>` screenshots every screen in light and dark into `.shots/<design-id>/`. Open every image and look: nothing overlaps or is cut off, text is readable on the glass over the map, the phone screen works at 390 px, dark is as finished as light, and the console printed no errors.
3. Fix what you see and shoot again.

Done when the check passes and every screenshot, in both themes, looks finished. End with a short report: the design's id, its screens, the direction kept and why.
