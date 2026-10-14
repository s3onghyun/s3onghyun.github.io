# Task Plan: Terminal/Vim style pass

## Goal

Refresh the Astro blog from evidence-based terminal/Vim research: make the
typography genuinely monospaced, add a text-only face/neofetch introduction,
finish tag navigation, provide a safe deploy helper, and verify the result.

## Current Phase

Complete — ready for local merge.

## Phases

### Phase 1: Research and audit

- [x] Inspect the current Astro pages, styles, and existing tag route.
- [x] Research six or more relevant GitHub themes and record the chosen direction.
- **Status:** complete

### Phase 2: Interface and routes

- [x] Apply the Korean-capable monospaced terminal/Vim system.
- [x] Build the home neofetch face block and English UI chrome.
- [x] Add the `/tags/` index and deployment helper.
- **Status:** complete

### Phase 3: Validation and handoff

- [x] Run the production build and inspect local home/post/tag routes.
- [x] Save the final review and commit on the task branch.
- **Status:** complete

## Decisions Made

| Decision | Rationale |
|---|---|
| Use a light phosphor-and-paper palette rather than a generic dark UI | It gives the requested terminal/Vim character while remaining calm and readable. |
| Use JetBrains Mono with D2Coding as the Korean-capable web-font fallback | ASCII keeps a fixed cell width and Korean text has a proper monospaced fallback. |
| Use the supplied ASCII portrait, not the braille version | Its 46-column grid is dependable in browsers and small enough for the responsive home layout. |
| Borrow interaction/layout ideas only | The research sources are not copied; the site remains an original Astro implementation. |

## Errors Encountered

| Error | Attempt | Resolution |
|---|---:|---|
| `gh-axi search repos` does not support `--json` | 1 | Used the authenticated GitHub Search API through `gh-axi api` instead. |
| Combined delete/add patch for the same files was invalid | 1 | Deleted and recreated the planning files in separate patches. |
| First build could not find `astro` | 1 | Installed the lockfile dependencies with `npm ci`; the production build then passed. |
| Initial preview gutter displayed literal `\A` text | 1 | Corrected the CSS escape and regenerated both screenshots. |
