# Findings & Decisions

## Requirements

- The site must use Astro static pages and Markdown content collections.
- It needs Korean-first terminal/Vim styling, post/tag navigation, RSS, sitemap, Open Graph metadata, a 404 page, and a prepared GitHub Pages workflow.
- All posts remain drafts and must use public-source material only.

## Research Findings

- Existing iterations completed the foundation, content collection, post listing, reader pages, and home-page recent-post section.
- Tag labels now link to static archives. The collection currently has six unique ASCII tags: `neovim`, `open-source`, `macos`, `developer-tools`, `opentelemetry`, and `jaeger`.

## Technical Decisions

| Decision | Rationale |
|---|---|
| Build tag archive routes from `getCollection('posts')` | Keeps tag content static, typed, and dependency-free. |
| Pass raw tag strings through `getStaticPaths()` | Astro emits clean static archive URLs for the current tag vocabulary. |

## Issues Encountered

| Issue | Resolution |
|---|---|
| None | — |

## Resources

- `BLOG_SPEC.md`
- `src/content.config.ts`
- `src/pages/posts/index.astro`
