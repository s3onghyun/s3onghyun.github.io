# Progress Log

## Session: 2026-10-15

### Phase 1: Research and audit

- **Status:** complete
- Confirmed the isolated worktree and created `fm/blog-style-pass`.
- Audited the current components and reproduced the missing `/tags/` index.
- Researched terminal/Vim-inspired GitHub themes via `gh-axi`; documented the
  resulting direction in `docs/style-research.md`.

### Phase 2: Interface and routes

- **Status:** complete
- Reworked the shared layout and palette into a light Vim-buffer treatment;
  added loaded JetBrains Mono and D2Coding web fonts plus `j`/`k` scrolling.
- Added selectable ASCII face art and neofetch facts to the home page.
- Added `/tags/`, made surrounding UI copy English, and created the manual
  `scripts/deploy-gh-pages.sh` helper without a workflow.

### Phase 3: Validation and handoff

- **Status:** complete
- `npm run build` passed after `npm ci`, emitting the tag index and all tag
  archives.
- Browser-checked home, a Korean post, and `/tags/` through
  `chrome-devtools-axi`; confirmed the `j` key scrolls and web-font requests
  return successfully.
- Opened the Terminal and Spectre live demos as a final research check; their
  restrained navigation and post metadata support the chosen direction.
- Saved `docs/screenshots/home.png` and `docs/screenshots/post.png`.
- Reviewed the staged diff, checked the deployment script with `bash -n`, and
  committed the implementation on `fm/blog-style-pass`.

## Test Results

| Test | Expected | Actual | Status |
|---|---|---|---|
| Worktree check | Disposable task path | Confirmed | ✓ |
| `npm run build` | Static site and new `/tags/` route build | 15 pages built | ✓ |
| Local browser | Home, Korean post, tag index and keyboard scroll | Correct routes and content | ✓ |

## Error Log

| Timestamp | Error | Attempt | Resolution |
|---|---|---:|---|
| 2026-10-15 | Unsupported `--json` flag in `gh-axi search repos` | 1 | Used `gh-axi api /search/repositories` with `--jq`. |
| 2026-10-15 | `astro: command not found` before dependencies were installed | 1 | Ran `npm ci`; build passed. |
| 2026-10-15 | Gutter showed literal `\A` | 1 | Fixed the CSS line-break escape and regenerated screenshots. |
