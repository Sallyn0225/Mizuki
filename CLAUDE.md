# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mizuki is a modern, feature-rich static blog template built with Astro 5. It features advanced functionality including anime tracking, diary/timeline pages, photo albums, and a highly customizable component system with dual sidebar layouts.

**Tech Stack:**
- Astro 5.16+ (SSG framework)
- Svelte 5 (interactive components)
- Tailwind CSS (styling)
- TypeScript (type safety)
- pnpm (package manager - **required**)

## Development Commands

### Prerequisites
- Node.js >= 20
- pnpm >= 9 (enforced via `preinstall` hook)

### Core Commands

```bash
# Install dependencies
pnpm install

# Development server (auto-syncs content, runs at localhost:4321)
pnpm dev

# Type checking
pnpm check
pnpm type-check        # TSC with isolatedDeclarations

# Code quality
pnpm format            # Format with Prettier
pnpm lint              # ESLint with auto-fix

# Build (syncs content, builds Astro, generates search index, compresses fonts)
pnpm build

# Preview production build
pnpm preview

# Content management
pnpm new-post <filename>    # Create new post with frontmatter template
```

### Content & Build Scripts

```bash
# Content synchronization (auto-runs before dev/build)
pnpm sync-content      # Sync from external content repo
pnpm init-content      # Initialize content repository

# Font optimization (runs during build)
pnpm compress-fonts    # Subset TTF fonts for used characters
pnpm test-font-compression

# SEO
pnpm submit            # Submit to IndexNow
```

## Architecture Overview

### Configuration System

**Central config**: `src/config.ts` - All site configuration is centralized here:
- `siteConfig` - Site metadata, theme, language, feature toggles
- `navBarConfig` - Navigation structure (supports nested menus)
- `profileConfig` - Author/sidebar profile
- `sidebarLayoutConfig` - **Component ordering and placement**
- `musicPlayerConfig`, `announcementConfig`, `sakuraConfig`, etc.

**Key principle**: Configuration-driven architecture. Components load based on config, not hardcoded imports.

### Sidebar Layout System

The sidebar system (`sidebarLayoutConfig` in config.ts) uses a **unified component registry**:

```typescript
sidebarLayoutConfig: {
  position: "both" | "unilateral",  // Dual or single sidebar
  components: [
    {
      type: "profile" | "announcement" | "categories" | "tags" | "calendar" | "site-stats",
      enable: boolean,
      order: number,              // Lower = higher priority
      position: "top" | "sticky",
      sidebar: "left" | "right",  // Which sidebar to render in
      class: "onload-animation",  // Animation classes
      animationDelay: number,     // Stagger animations
    }
  ]
}
```

**Layout behavior**:
- `position: "both"` = Dual sidebars (desktop only, right sidebar hidden on mobile)
- `position: "unilateral"` = Single left sidebar
- TOC component automatically repositions when sidebar is on right
- Article grid layout (`postListLayout.defaultMode: "grid"`) requires single sidebar

### Content Collections

Defined in `src/content.config.ts` using Astro 5's file-based loader:

**Posts** (`src/content/posts/*.md`):
- Schema includes: title, published, tags, category, draft, pinned, priority
- Password protection: `encrypted: true` + `password` field
- Custom permalinks: `permalink` field (overrides alias)
- Sorting: pinned → priority → date (desc)

**Special pages** (`src/content/spec/*.md`):
- Used for: about, friends pages
- No strict schema

### Routing

- `/posts/[...slug].astro` - Standard post pages
- `/[permalink].astro` - Custom permalink support (see `src/utils/permalink-utils.ts`)
- `/[...page].astro` - Paginated home/archive
- Feature pages: `/anime`, `/diary`, `/albums`, `/friends`, `/projects`, `/skills`, `/timeline`, `/devices`
  - Toggle visibility via `siteConfig.featurePages`

### Component Structure

```
src/components/
├── widget/           # Sidebar/reusable widgets (Profile, Tags, Calendar, etc.)
├── control/          # UI controls (BackToTop, Pagination, FloatingTOC)
├── layout/           # Layout components (RightSideBar)
├── misc/             # Utilities (Icon, ImageWrapper, FullscreenWallpaper)
└── comment/          # Comment integrations (Twikoo)

src/layouts/
├── Layout.astro           # Base HTML layout (head, scripts)
└── MainGridLayout.astro   # Grid system with sidebars + TOC
```

**Widget Manager** (`src/utils/widget-manager.ts`): Dynamically loads sidebar components based on `sidebarLayoutConfig`.

### Markdown Pipeline

**Remark plugins** (AST transformations):
- `remark-math` - Parse LaTeX math
- `remark-reading-time` - Calculate reading time (custom plugin)
- `remark-directive` - Custom directive syntax (e.g., `::github{repo="user/repo"}`)
- `remark-mermaid` - Mermaid diagram preprocessing

**Rehype plugins** (HTML transformations):
- `rehype-katex` - Render math with KaTeX
- `rehype-slug` - Generate heading IDs
- `rehype-autolink-headings` - Add anchor links
- `rehype-components` - Custom components (GitHub cards, admonitions)
- `rehype-mermaid` - Mermaid rendering

**Custom plugins** (`src/plugins/`):
- `remark-excerpt.js` - Extract post excerpts
- `rehype-component-github-card.mjs` - GitHub repo cards
- `rehype-component-admonition.mjs` - Callout boxes (note/tip/warning/caution/important)
- Expressive Code plugins: custom copy button, language badges

### Internationalization

**System**: `src/i18n/`
- `translation.ts` - Main i18n function
- `languages/*.ts` - Translation files (en, zh_CN, zh_TW, ja)
- Usage: `i18n(I18nKey.key)` or `getTranslation(lang)[key]`

**Supported languages**: en, zh_CN, zh_TW, ja, ko, es, th, vi, tr, id
- Set via `siteConfig.lang`

### Path Aliases

Configured in `tsconfig.json`:
```typescript
"@components/*" → "src/components/*"
"@assets/*"     → "src/assets/*"
"@constants/*"  → "src/constants/*"
"@utils/*"      → "src/utils/*"
"@i18n/*"       → "src/i18n/*"
"@layouts/*"    → "src/layouts/*"
"@/*"           → "src/*"
```

### Data Files

`src/data/*.ts` - Static data for feature pages:
- `anime.ts` - Anime tracking data (if `anime.mode: "local"`)
- `diary.ts` - Diary/moments entries
- `friends.ts` - Friend link cards
- `projects.ts` - Project showcase
- `skills.ts` - Skills/tech stack
- `timeline.ts` - Personal timeline events
- `devices.ts` - Device collection

### Styling System

**Approach**: Tailwind-first with custom CSS variables
- Main styles: `src/styles/main.css`
- Theme colors: HSL-based via `--hue` CSS variable (set from `siteConfig.themeColor.hue`)
- Dark mode: Automatic via `@media (prefers-color-scheme: dark)`
- Animations: Swup transitions (`transition-swup-*` classes)

**Wallpaper modes**:
- `banner` - Top banner (configurable opacity/blur)
- `fullscreen` - Full background wallpaper
- `none` - No wallpaper

### Font System

**Font compression** (production only):
- `scripts/compress-fonts.js` - Subsets TTF fonts using fontmin
- `src/config.ts` fonts: `asciiFont` (English), `cjkFont` (CJK fallback)
- Only TTF format supported for compression
- Dev mode shows browser default fonts; compression only visible in production builds

### Search Integration

**Pagefind** (static search index):
- Runs during build: `pagefind --site dist`
- Automatically indexes all pages
- No runtime overhead

### Critical Build Hooks

Build sequence (`pnpm build`):
1. `prebuild` script runs `sync-content.js`
2. Astro builds to `dist/`
3. Pagefind indexes `dist/` directory
4. `compress-fonts.js` subsets font files

## Development Guidelines

### Component Development

**Adding sidebar components**:
1. Create component in `src/components/widget/<Name>.astro`
2. Register in `src/utils/widget-manager.ts` component map
3. Add config entry to `sidebarLayoutConfig.components[]` in config.ts
4. Use `enable`, `order`, `sidebar`, `animationDelay` to control behavior

**Component best practices**:
- Use path aliases (`@components/`, `@utils/`, etc.)
- Leverage Tailwind utilities over custom CSS
- Follow existing animation patterns (`.onload-animation` class + `animationDelay`)
- Respect responsive breakpoints from `sidebarLayoutConfig.responsive`

### Adding Feature Pages

1. Create page in `src/pages/<name>.astro`
2. Add toggle to `siteConfig.featurePages.<name>`
3. Add navigation entry to `navBarConfig.links[]`
4. Create data file in `src/data/<name>.ts` if needed
5. Add i18n keys to all language files

### Markdown Features

**Post frontmatter** (required fields: `title`, `published`):
```yaml
---
title: Post Title
published: 2024-12-28
description: SEO description
image: ./cover.jpg         # Relative to post file
tags: [tag1, tag2]
category: Category Name
draft: false               # Hide in production
pinned: true               # Pin to top
priority: 1                # Lower = higher (for pinned posts)
permalink: custom-url      # Override default URL
encrypted: true            # Password protect
password: secret123
lang: ja                   # Override site language
---
```

**Custom directives**:
- GitHub cards: `::github{repo="user/repo"}`
- Admonitions: `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, `> [!CAUTION]`, `> [!IMPORTANT]`

### Configuration Changes

When modifying `src/config.ts`:
- TypeScript types defined in `src/types/config.ts`
- Changes require dev server restart
- Validate against type definitions before saving
- Test with both light/dark themes and desktop/mobile viewports

### TOC System

**Modes** (`siteConfig.toc.mode`):
- `"float"` - Floating button (FloatingTOC component)
- `"sidebar"` - Inline sidebar (TOC component, repositions with sidebar)

**Configuration**:
- `depth: 1-6` - Heading levels to show
- `useJapaneseBadge: boolean` - Use あいう... instead of 123...

### Theme System

**Color customization**:
- `siteConfig.themeColor.hue`: 0-360 (controls accent color)
- `siteConfig.themeColor.fixed`: Hides theme picker from users
- Colors auto-generate from hue using HSL transformations

**Banner modes**:
- Supports desktop/mobile separate images
- Carousel or random selection
- Wave effects (performance mode available)
- Integration with PicFlow API for dynamic images

## Common Pitfalls

1. **PNPM required**: npm/yarn will fail due to `preinstall` script
2. **Font compression**: Only visible in production builds, not dev mode
3. **Content sync**: Auto-runs before dev/build, may fail silently (`|| true`)
4. **Grid layout**: Requires `sidebarLayoutConfig.position: "unilateral"`
5. **Right sidebar**: Hidden on mobile unless using unilateral mode
6. **Permalink changes**: Requires clearing Astro cache (`rm -rf .astro/`)
7. **Type checking**: Use `pnpm check` for full validation (includes Astro compiler)
8. **Image paths**: Posts use relative paths (`./image.jpg`), config uses absolute (`/assets/`)

## Testing Workflow

```bash
# Development cycle
pnpm dev              # Start server + watch mode

# Before commit
pnpm format           # Auto-format all src files
pnpm lint             # Fix linting issues
pnpm check            # Validate Astro + TypeScript

# Production validation
pnpm build            # Full build with search index
pnpm preview          # Test production build locally
```

## Special Features

**Password-protected posts**: Use bcrypt hashing (salt rounds configurable via `BCRYPT_SALT_ROUNDS` env var, default 12)

**Umami analytics**: Configure via `umamiConfig` + `UMAMI_API_KEY` env var

**Live2D mascot**: Pio configuration in `pioConfig` (draggable/fixed modes)

**Music player**: Supports local files or Meting API (NetEase, QQ Music, Kugou)

**Sakura effects**: Configurable falling petals (performance-intensive)
