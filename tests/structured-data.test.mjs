import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);
const articleTypes = new Set(['BlogPosting', 'TechArticle']);
const requiredFields = ['headline', 'description', 'url', 'datePublished', 'dateModified', 'author', 'inLanguage'];

const pages = (await readdir(dist, { recursive: true })).filter((path) => path.endsWith('.html'));
const errors = [];
let articles = 0;

for (const page of pages) {
  const html = await readFile(new URL(page, dist), 'utf8');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  for (const [, raw] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      errors.push(`${page}: invalid JSON-LD (${error.message})`);
      continue;
    }
    if (data['@context'] !== 'https://schema.org') errors.push(`${page}: missing schema.org @context`);
    for (const node of data['@graph'] ?? [data]) {
      if (!articleTypes.has(node['@type'])) continue;
      articles++;
      for (const field of requiredFields) if (!node[field]) errors.push(`${page}: ${node['@type']} missing ${field}`);
      const published = Date.parse(node.datePublished);
      const modified = Date.parse(node.dateModified);
      if (Number.isNaN(published) || Number.isNaN(modified)) errors.push(`${page}: unparseable dates`);
      else if (modified < published) errors.push(`${page}: dateModified ${node.dateModified} < datePublished ${node.datePublished}`);
      if (node.url !== canonical) errors.push(`${page}: url ${node.url} != canonical ${canonical}`);
    }
  }
}

assert.ok(articles > 0, 'no BlogPosting/TechArticle JSON-LD found in dist');
assert.deepEqual(errors, []);
console.log(`Structured data checks passed (${pages.length} pages, ${articles} articles)`);
