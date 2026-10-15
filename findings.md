# Findings

- All three current posts have `draft: true`; therefore no posts should appear in `sitemap.xml`, RSS, or `llms.txt` until they are published.
- The current site already supplies a canonical URL and Open Graph title, but lacks robots, llms files, JSON-LD, Twitter metadata, and verification hooks.
- `apple-touch-icon.png` is a suitable existing fallback social image.
- Astro endpoint routes can generate `llms.txt` and `llms-full.txt` at build time, while a public `robots.txt` is the correct static crawler policy file.
