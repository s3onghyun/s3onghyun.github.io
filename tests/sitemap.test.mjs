import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const postsDir = new URL('../src/content/posts/', import.meta.url);
const sitemap = await readFile(new URL('../dist/sitemap.xml', import.meta.url), 'utf8');
const lastmods = new Map([...sitemap.matchAll(/<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g)]
  .map(([, loc, lastmod]) => [loc, lastmod]));

// shortcut: line-based frontmatter read of top-level scalars, upgrade to a YAML parser if fields get nested values.
const field = (frontmatter, name) => frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1].trim();

let published = 0;
for (const file of (await readdir(postsDir)).filter((name) => name.endsWith('.md'))) {
  const frontmatter = (await readFile(new URL(file, postsDir), 'utf8')).split('---')[1];
  const url = `https://s3onghyun.github.io/posts/${file.replace(/\.md$/, '')}/`;
  if (field(frontmatter, 'draft') !== 'false') {
    assert.ok(!lastmods.has(url), `draft ${url} must not be in sitemap`);
    continue;
  }
  published++;
  const expected = new Date(field(frontmatter, 'updatedAt') ?? field(frontmatter, 'publishedAt')).toISOString().slice(0, 10);
  assert.equal(lastmods.get(url), expected, `${url} lastmod`);
}

assert.ok(published > 0, 'no published posts checked');
console.log(`Sitemap lastmod checks passed (${published} posts)`);
