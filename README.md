# s3onghyun.github.io

Personal notes site built with Astro.

## Writing a post

Templates live in `src/content/templates/`. They are intentionally outside the posts collection, so their `draft: true` frontmatter never appears in the site listings or RSS feed.

Copy the template you need into `src/content/posts/`, rename it with a URL-safe slug, and replace every bracketed placeholder. Keep `draft: true` while writing. When a note is ready for the site's normal post collection, review its metadata and follow the publishing policy before changing that flag.

- `book-note.md` — books: title, author, read date, one-line take, quotations, and thoughts.
- `escape-room-log.md` — escape rooms: theme, venue, date, party size, result, time left, and a spoiler-free review.
- `study-note.md` — study series: topic, key concepts, code example, exercises, and references. Set `series` to group related notes on `/study/`.

Every post needs one `category`: `tech` for infrastructure, DevOps, and open-source work; `study` for learning series; or `life` for books and escape-room keepsakes.

## Development

```sh
npm install
npm run dev
npm run build
```
