# Blog spec (objective for overnight build)

Personal developer blog of s3onghyun (SEONGHYUN HONG), Platform/DevOps engineer:
GitLab (self-managed, Runner, Helm), Observability (Prometheus, Grafana, Loki, OpenTelemetry), Kubernetes, and open-source contribution.
Target URL: https://s3onghyun.github.io/ (GitHub Pages user site). Note that https://s3onghyun.github.io/nvim-edu/ is an existing project site and must keep working.

## Style (owner preference, overrides any earlier styling)
- Clean terminal / Vim-inspired look, not a generic dark-mode blog: monospace-first typography (e.g. JetBrains Mono / IBM Plex Mono with a readable Korean fallback), a terminal-window or Vim-buffer layout (prompt-style headings like `$ cat post.md` or a Vim statusline/modeline, `~` empty-line gutter, line-number feel where it reads well), a restrained terminal colour palette, and tasteful ASCII/ANSI-style art (e.g. an ASCII banner or small terminal art on the home page).
- Must stay readable and accessible: sufficient contrast, real text (not images of text), responsive on mobile, no gimmicks that hurt reading. One calm theme is fine; a light/dark toggle is optional, not required.
- Keyboard-friendly navigation is a plus (e.g. `j`/`k` to move between posts, `/` to search), as long as normal navigation still works.
- Syntax highlighting for code blocks, copy button, heading anchors, table of contents on long posts.

## Stack
- Astro static site with Markdown/MDX content collections. Keep dependencies few.
- Pages: home (short intro + recent posts), posts list with tags, tag pages, about, projects, RSS, sitemap, Open Graph meta, 404.
- Korean is the main language; a post may be English.
- No analytics or third-party trackers.
- GitHub Actions workflow for GitHub Pages deploy prepared in `.github/workflows/`, but nothing is pushed or deployed.

## Content (drafts only, every post `draft: true`)
Use only material that is already public:
- Projects page: nvim-edu (https://github.com/s3onghyun/nvim-edu), bulchimbeon / 불침번 (https://github.com/s3onghyun/bulchimbeon), otelcol-doctor (https://github.com/s3onghyun/otelcol-doctor).
- Draft posts: building bulchimbeon (source: its public README and the author's public posts https://dev.to/s3onghyun and https://zenn.dev/s3onghyun), building nvim-edu (its public README), and one open-source contribution story based on public merged PRs (e.g. perses/perses#4266, open-telemetry/opentelemetry-collector-contrib#49568, containerd/nerdctl#5064).
- About page: role and interests only.

## Hard rules
- Never mention customer or client names, employer-internal projects, internal hostnames, credentials, or anything confidential. Do not name the employer.
- Never include job-search, career-change, interview, or resume content.
- Never push, create remote repositories, or deploy.
- Each change must keep `npm run build` passing.
