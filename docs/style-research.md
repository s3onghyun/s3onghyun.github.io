# Terminal/Vim blog style research

Research was performed with GitHub's authenticated API through `gh-axi` on
2026-10-15. I checked repository metadata (stars and last push) and READMEs,
then inspected the live Terminal and Spectre demos. These are references for ideas only; this
site does not copy their source code.

| Project | Stars / recent activity | Distinctive idea observed | What this site borrows |
|---|---:|---|---|
| [panr/hugo-theme-terminal](https://github.com/panr/hugo-theme-terminal) | 2,813 ★ · pushed 2026-09 | Restrained terminal palette, Fira Code, responsive code blocks, custom colour-system demo | A single calm terminal palette, prompt labels, and readable code surfaces—not a simulated shell. |
| [mrmierzejewski/hugo-theme-console](https://github.com/mrmierzejewski/hugo-theme-console) | 678 ★ · pushed 2026-06 | Fast, responsive console treatment built around a clear monospace stack | Sparse chrome, generous reading space, and console-style metadata. |
| [rhazdon/hugo-theme-hello-friend-ng](https://github.com/rhazdon/hugo-theme-hello-friend-ng) | 1,549 ★ · pushed 2025-11 | Mature personal-blog information architecture with responsive navigation and highlighted code | Keep the terminal treatment subordinate to legibility and navigation. |
| [athul/archie](https://github.com/athul/archie) | 1,430 ★ · pushed 2026-03 | Minimal, markdown-like reading UI with tags and a table of contents | Thin rules, simple archive rows, and content-first spacing. |
| [louisescher/spectre](https://github.com/louisescher/spectre) | 164 ★ · pushed 2026-06 | Astro terminal theme that emphasizes accessibility, responsive layout, content collections, and a fast static site | Treat Astro pages as accessible documents first, then layer terminal cues. |
| [dennisklappe/astro-theme-terminal](https://github.com/dennisklappe/astro-theme-terminal) | 68 ★ · pushed 2025-11 | Astro adaptation of Terminal with Shiki, tag browsing, RSS, CSS variables, and a public demo | Use CSS variables, terminal-like tags, and static discovery pages. |
| [joshruggles/astro-palette](https://github.com/joshruggles/astro-palette) | 20 ★ · pushed 2026-10 | Static Astro personal/blog theme with a terminal look and palette discipline | Keep the implementation framework-light and avoid adding client framework weight. |

## Chosen direction

The redesign combines the content-first restraint of Console and Archie with
Terminal's prompt/status vocabulary. It deliberately avoids a stock black
"hacker" screen: a soft paper background, dark ink, muted green rules, and one
phosphor accent make it feel closer to a well-configured Vim buffer. Prompt
headings, a `~` gutter, line numbers, and modelines provide the terminal/Vim
character without turning the blog into a command emulator.

The supplied ASCII portrait becomes a selectable `pre` block beside a concise
neofetch-style fact list. JetBrains Mono is loaded as the Latin/ASCII web font;
D2Coding is loaded as the Korean-capable monospace fallback so Korean prose and
the terminal grid do not fall back to a proportional UI font.
