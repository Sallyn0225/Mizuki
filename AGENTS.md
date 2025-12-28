# Repository Guidelines

## Project Structure & Module Organization

- `src/`: Astro + TypeScript source
  - `src/pages/`: route entrypoints (`*.astro`, `*.ts` like `rss.xml.ts`)
  - `src/components/`: UI components (`PascalCase.astro`, `*.svelte`)
  - `src/content/`: content collections (`posts/*.md`, `spec/*.md`)
  - `src/utils/`: shared utilities (`kebab-case.ts`)
  - `src/styles/`: global styles (CSS/Stylus)
- `public/`: static assets served as-is (e.g. `public/images/`, `public/js/`)
- `scripts/`: Node.js helper scripts (content sync, new posts, font compression)
- `docs/`: project docs and screenshots

## Build, Test, and Development Commands

Prerequisites: Node.js >= 20 and `pnpm` (enforced by `preinstall`).

- `pnpm install`: install dependencies
- `pnpm dev`: start dev server at `http://localhost:4321`
- `pnpm check`: Astro compiler/type checks (CI gate)
- `pnpm type-check`: `tsc --noEmit` validation
- `pnpm format`: format `src/` with Prettier
- `pnpm lint`: best-effort lint/fix of `src/` (not currently a CI gate)
- `pnpm build`: production build to `dist/` (also runs Pagefind + font compression)
- `pnpm preview`: serve `dist/` locally
- `pnpm new-post <slug>`: generate a new post template
- `pnpm sync-content`: sync content (optional; runs in `predev`/`prebuild`, failures are ignored)

Tip: set `ENABLE_CONTENT_SYNC=false` when you don’t have the external content repo (CI does this).

## Coding Style & Naming Conventions

- Formatting: Prettier (`pnpm format`), default tabs with `tabWidth: 4`, `printWidth: 80`, and `endOfLine: crlf`; CSS uses 2-space indentation.
- Linting: `pnpm lint` is intended to run ESLint auto-fixes; treat it as optional unless CI starts gating on it.
- Naming:
  - Components: `PascalCase` in `src/components/`
  - Utilities: `kebab-case` in `src/utils/`
- Imports: prefer path aliases from `tsconfig.json` (e.g. `@components/*`, `@utils/*`).

## Testing Guidelines

There is no dedicated unit test runner configured. Validation is primarily:

- `pnpm check` and `pnpm type-check` for correctness
- `pnpm build && pnpm preview` for production regressions (especially UI/layout changes)

## Commit & Pull Request Guidelines

- Commits generally follow Conventional Commit style: `feat(scope): ...`, `fix: ...`, `refactor: ...`, `perf: ...`, `chore: ...`.
- PRs should follow `.github/pull_request_template.md`: describe changes, link issues, include screenshots for UI changes, and provide a clear “How To Test”.

## Security & Configuration Tips

- Use `.env.example` as the baseline and keep local secrets in `.env` (never commit it).
- Deployment configuration lives in `vercel.json`.

## Agent Notes

- Read `CLAUDE.md` for architecture details (content collections, sidebar registry, build hooks).
