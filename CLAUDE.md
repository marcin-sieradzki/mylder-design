# Mylder Design

A design studio for Mylder, the live map of Copenhagen's transit: designs for new Mylder features, each a folder of React screens on the Perron design system (`@mylder/perron`), shown on a static site where anyone can edit a draft that stays in their browser. Designs are generated only here, on the maintainer's machine, with Claude Code. See `README.md` for the scripts.

- Generating, revising or applying a draft to a design: use the `design` skill (`/design`). It holds every rule for a design's files.
- The product a design is for: `docs/mylder.md`.
- Perron's tokens, docs and component APIs: the Perron MCP (`.mcp.json`), and the props in `node_modules/@mylder/perron/dist/`.
- The studio (`src/`) is built from Perron too: its components and patterns first, its tokens for every colour, space and radius, and its voice for every word.
- Writing or changing React code: follow the `vercel-react-best-practices` skill; its Next.js and server rules don't apply to this static site.
- Skills and this file: write them with the `writing-for-agents` skill.
- Repository text (code, docs, commits, pull requests) names no person; say "the maintainer".
- Work is done when `npm run check` passes, and for studio changes `npm run e2e` too.
