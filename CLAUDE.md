# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a Shopify Online Store 2.0 theme with **no build pipeline** — no package.json, no bundler. All CSS/JS assets are pre-built.

```bash
shopify theme dev              # Local development server with hot reload
shopify theme push             # Push theme to Shopify store
shopify theme pull             # Pull latest theme from store
shopify theme check            # Lint Liquid, JSON, and theme best practices
```

## Architecture

**Shopify OS 2.0 theme** (King Theme v2.0.5) customized for the Sudist fashion brand.

- **`layout/`** — `theme.liquid` (main layout), `password.liquid` (password page)
- **`templates/`** — JSON files defining which sections appear on each page. Multiple variants exist per page type for specific use cases (e.g., `product.polo.json`, `collection.marseille.json`, `page.atelier.json`)
- **`sections/`** — Self-contained Liquid UI blocks with their own `{% schema %}`, settings, and blocks. Rendered by templates.
- **`snippets/`** — Reusable Liquid partials, included via `{% render 'snippet-name' %}`
- **`assets/`** — Pre-built CSS and JS files (no compile step)
- **`config/`** — `settings_schema.json` (theme customizer UI definition), `settings_data.json` (current setting values)
- **`locales/`** — 60 translation files. Primary languages: French (`fr.json`) and English (`en.default.json`)

## Key Assets

**JavaScript:**
- `theme.js` — Main entry: GSAP init, cart interactions, animation helpers, DOM utilities
- `header.js` — Header behavior (sticky, transparent, mega-menu)
- `pubsub.js` — Pub/sub event system for cross-component communication

**Libraries:** GSAP (animations + ScrollTrigger + SplitText), Swiper (carousels), LazyLoad

**CSS loading strategy:**
- Critical CSS loaded synchronously: `base.css`, `theme.css`
- Non-critical CSS async-loaded via `media="print"` + `onload` swap: `component.css`, library CSS, section-specific CSS
- CSS custom properties defined in `snippets/context-style-variables.liquid`

## Conventions

- Section schemas use translatable names: `"name": "t:sections.section-name.name"`
- Translations via `| t` filter with namespaced keys (e.g., `'products.product.add_to_cart' | t`)
- BEM-style CSS classes (e.g., `.header--navigation-main`)
- camelCase for Liquid variables, kebab-case for file names
- Shared JS variables and Shopify routes set in `snippets/context-variables.liquid`

## External Integrations

- Chat widget and B2B pricing: `sav-assistant-next.vercel.app`
- Google Maps API (store locator section)
- Shopify Predictive Search API
