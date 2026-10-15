import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readDist = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((match) => JSON.parse(match[1]));

const robots = await readDist('robots.txt');
for (const crawler of ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot']) {
  assert.match(robots, new RegExp(`User-agent: ${crawler}\\nAllow: /`));
}
assert.match(robots, /Sitemap: https:\/\/s3onghyun\.github\.io\/sitemap\.xml/);

const llms = await readDist('llms.txt');
assert.match(llms, /^# SEONGHYUN HONG/m);
assert.match(llms, /## Author/);
assert.match(llms, /## Categories/);
assert.doesNotMatch(llms, /불침번을 만들며|nvim-edu를 만들며|Jaeger와 OTLP/);

const home = await readDist('index.html');
assert.match(home, /<html lang="ko">/);
assert.match(home, /property="og:image"/);
assert.match(home, /name="twitter:card" content="summary"/);
const homeGraph = jsonLd(home)[0]['@graph'];
assert.ok(homeGraph.some((entry) => entry['@type'] === 'WebSite'));
assert.deepEqual(homeGraph.find((entry) => entry['@type'] === 'Person').sameAs, ['https://github.com/s3onghyun']);

const post = await readDist('posts/building-bulchimbeon/index.html');
const postData = jsonLd(post)[0];
assert.equal(postData['@type'], 'TechArticle');
for (const field of ['headline', 'datePublished', 'dateModified', 'author', 'inLanguage', 'keywords']) assert.ok(postData[field]);
assert.equal(postData.inLanguage, 'ko');

const category = await readDist('tech/index.html');
const crumbs = jsonLd(category)[0];
assert.equal(crumbs['@type'], 'BreadcrumbList');
assert.equal(crumbs.itemListElement.length, 2);

const sitemap = await readDist('sitemap.xml');
assert.doesNotMatch(sitemap, /building-bulchimbeon|building-nvim-edu|preserving-jaeger/);
console.log('SEO output checks passed');
