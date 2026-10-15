# Task Plan: SEO and LLM discovery

## Goal

Generate crawl-friendly discovery files and page metadata for search engines and LLM search tools, while keeping drafts out of feeds and machine discovery.

## Current Phase

Phase 2 — implementation complete; validating production output.

## Phases

### Phase 1: Audit and plan

- [x] Inspect Astro routes, content schema, current metadata, and drafts.
- [x] Identify a shared config and build-time endpoints as the smallest design.
- **Status:** complete

### Phase 2: Implementation

- [x] Add robots, llms endpoints, verification config, and structured data helpers.
- [x] Add crawler metadata, sitemap/draft filtering, and owner checklist.
- [x] Add production-output checks for discovery and JSON-LD shapes.
- **Status:** complete

### Phase 3: Validation and handoff

- [ ] Run the production build and SEO output checks.
- [ ] Review changes, commit on `fm/blog-seo-geo`, and confirm clean state.
- **Status:** in progress

## Decisions

| Decision | Rationale |
|---|---|
| Use `apple-touch-icon.png` as the default OG image | It is an existing site-owned image and avoids adding a separate generated asset. |
| Keep draft pages reachable but exclude drafts from RSS, sitemap, and llms files | Existing authoring UI labels drafts; machine discovery must only advertise published content. |
| Generate `llms-full.txt` from the same concise content as `llms.txt` | There are currently no published posts, so a fuller derivative would add no value. |

## Errors Encountered

| Error | Attempt | Resolution |
|---|---:|---|
| Combined delete/add patch invalid | 1 | Deleted and recreated planning files in separate patches. |
