# Findings & Decisions

## Requirements

- Home needs a supplied text-only face in a neofetch-style block.
- UI chrome is English; post titles and Markdown content remain Korean.
- `/tags/` must exist in addition to individual tag archives.
- The page needs a real monospaced Korean-capable type stack, a non-force
  GitHub Pages helper, and local screenshot evidence.
- Never mention an employer, customer, internal system, or job-search content.

## Research Findings

- `docs/style-research.md` records seven GitHub themes inspected through
  `gh-axi`, including stars, recent activity, demos/READMEs, and the design
  ideas selected for this implementation.
- The live Terminal and Spectre demos confirmed that prompt-like metadata and
  simple, keyboard-aware navigation can coexist with readable post listings.
- Current site already has static individual tag archives, but no static tag
  index route. It also declares monospaced fonts without actually loading one.
- The supplied ASCII face has a compact fixed-column shape that is safer than
  the wide braille rendition for a responsive browser layout.

## Technical Decisions

| Decision | Rationale |
|---|---|
| Generate tag index data from the same content collection used by tag pages | No duplicate taxonomy source or runtime API is needed. |
| Keep the portrait in an Astro string rendered by `pre` | It is selectable text, preserves its cells, and never exposes an image of the supplied photo. |
| Keep the deployment action out of CI | The requested script can be run deliberately later and does not require workflow-token scope. |

## Issues Encountered

| Issue | Resolution |
|---|---|
| Broad GitHub search results contained unrelated repositories | Selected candidates by exact repository metadata and inspected their READMEs/demos instead. |
