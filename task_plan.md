# Task Plan: Terminal/Vim-inspired personal blog

## Goal

Build the Astro blog described in `BLOG_SPEC.md`, keeping every incremental change production-buildable.

## Current Phase

Phase 2 — RSS, sitemap, 404, and deployment workflow remain.

## Phases

### Phase 1: Foundation and core content

- [x] Establish shared terminal/Vim styling and core pages.
- [x] Add schema-validated draft posts and post reader pages.
- **Status:** complete

### Phase 2: Required navigation and discovery surfaces

- [x] Add tag navigation and tag archive pages.
- [ ] Add RSS, sitemap, and 404 surfaces.
- [ ] Add GitHub Pages deployment workflow.
- **Status:** in_progress

### Phase 3: Reading enhancements

- [ ] Add syntax highlighting, copy controls, heading anchors, and long-post navigation where appropriate.
- **Status:** pending

### Phase 4: Verification

- [ ] Run `npm run build` after each change and perform final specification review.
- **Status:** in_progress

## Decisions Made

| Decision | Rationale |
|---|---|
| Deliver one independently verifiable site improvement per iteration | Matches the orchestrated incremental workflow. |
| Use Astro content collections for tag archives | Reuses typed post metadata without dependencies. |

## Errors Encountered

| Error | Attempt | Resolution |
|---|---:|---|
| Planning-file patch used an incorrect context string | 1 | Re-read the files and applied a targeted patch. |
