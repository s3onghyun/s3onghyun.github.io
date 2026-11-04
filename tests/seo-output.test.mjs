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
for (const slug of ['building-bulchimbeon', 'building-nvim-edu']) {
  assert.match(llms, new RegExp(`https://s3onghyun\\.github\\.io/posts/${slug}/`));
  assert.match(llms, new RegExp(`https://s3onghyun\\.github\\.io/posts/${slug}\\.md`));
}

const fullLlms = await readDist('llms-full.txt');
assert.match(fullLlms, /# SEONGHYUN HONG: full published posts/);
assert.match(fullLlms, /caffeinate -d/);
assert.match(fullLlms, /nvim --headless/);

for (const slug of ['building-bulchimbeon', 'building-nvim-edu']) {
  const markdown = await readDist(`posts/${slug}.md`);
  assert.match(markdown, new RegExp(`URL: https://s3onghyun\\.github\\.io/posts/${slug}/`));
  assert.match(markdown, new RegExp(`Markdown: https://s3onghyun\\.github\\.io/posts/${slug}\\.md`));
  assert.match(markdown, /Published: 2026-10-14/);
}

const home = await readDist('index.html');
assert.match(home, /<html lang="ko">/);
assert.match(home, /property="og:image"/);
assert.match(home, /name="twitter:card" content="summary"/);
const homeGraph = jsonLd(home)[0]['@graph'];
assert.ok(homeGraph.some((entry) => entry['@type'] === 'WebSite'));
assert.deepEqual(homeGraph.find((entry) => entry['@type'] === 'Person').sameAs, ['https://github.com/s3onghyun']);
assert.match(home, /s3onghyun\.goatcounter\.com\/count/);
assert.match(home, /data-goatcounter-count="\/"/);
assert.match(home, /data-goatcounter-label="home visitors"/);
assert.match(home, /s3onghyun\.goatcounter\.com\/counter/);
assert.match(home, /navigator\.doNotTrack !== '1'/);
assert.match(home, /navigator\.globalPrivacyControl/);
assert.doesNotMatch(home, /giscus\.app\/client\.js/);

const post = await readDist('posts/building-bulchimbeon/index.html');
assert.match(post, /<link rel="alternate" type="text\/markdown" href="\/posts\/building-bulchimbeon\.md">/);
assert.match(post, /data-goatcounter-count="\/posts\/building-bulchimbeon\/"/);
assert.match(post, /data-goatcounter-label="views"/);
assert.match(post, /data-goatcounter-count[^>]* hidden/);
assert.match(post, /src="https:\/\/giscus\.app\/client\.js"/);
assert.match(post, /data-repo="s3onghyun\/s3onghyun\.github\.io"/);
assert.match(post, /data-repo-id="R_kgDOVJXxjA"/);
assert.match(post, /data-category="Announcements"/);
assert.match(post, /data-category-id="DIC_kwDOVJXxjM4DKNUH"/);
assert.match(post, /data-mapping="pathname"/);
assert.match(post, /data-strict="1"/);
assert.match(post, /data-reactions-enabled="1"/);
assert.match(post, /data-input-position="top"/);
assert.match(post, /data-lang="ko"/);
assert.match(post, /data-loading="lazy"/);
assert.match(post, /data-theme="light"/);
assert.match(post, /iframe\.giscus-frame/);
assert.ok(post.indexOf('data-goatcounter-count="/posts/building-bulchimbeon/"') < post.indexOf('id="giscus-script"'));
assert.match(post, />결론</);
assert.match(post, />적용</);
assert.match(post, />확인일</);
assert.match(post, />Sources</);
const postGraph = jsonLd(post)[0]['@graph'];
const website = postGraph.find((entry) => entry['@type'] === 'WebSite');
const person = postGraph.find((entry) => entry['@type'] === 'Person');
const postData = postGraph.find((entry) => entry['@type'] === 'TechArticle');
assert.ok(website && person && postData);
for (const field of ['headline', 'mainEntityOfPage', 'datePublished', 'dateModified', 'author', 'inLanguage', 'keywords', 'about', 'citation', 'image']) assert.ok(postData[field]);
assert.equal(postData.inLanguage, 'ko');
assert.equal(postData.isPartOf['@id'], website['@id']);
assert.equal(postData.author['@id'], person['@id']);
assert.equal(website.publisher['@id'], person['@id']);
assert.ok(postData.citation.every((citation) => citation.url.startsWith('https://')));

const category = await readDist('tech/index.html');
const crumbs = jsonLd(category)[0];
assert.equal(crumbs['@type'], 'BreadcrumbList');
assert.equal(crumbs.itemListElement.length, 2);

const sitemap = await readDist('sitemap.xml');
assert.match(sitemap, /building-bulchimbeon/);
assert.match(sitemap, /building-nvim-edu/);
assert.doesNotMatch(sitemap, /preserving-jaeger/);

// Related posts: published siblings are linked at the end of each post (HTML and .md); drafts never are.
for (const [slug, other] of [['building-bulchimbeon', 'building-nvim-edu'], ['building-nvim-edu', 'building-bulchimbeon']]) {
  const related = (await readDist(`posts/${slug}/index.html`)).match(/<nav class="related[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(related, `${slug} has a related posts section`);
  assert.match(related[1], new RegExp(`href="/posts/${other}/"`));
  assert.doesNotMatch(related[1], new RegExp(`/posts/${slug}/|preserving-jaeger-sampled-flag`));
  assert.ok((related[1].match(/<li/g) ?? []).length <= 3);
  const markdown = await readDist(`posts/${slug}.md`);
  assert.match(markdown, new RegExp(`## Related posts\\n\\n- \\[[^\\]]+\\]\\(https://s3onghyun\\.github\\.io/posts/${other}/\\)`));
  assert.doesNotMatch(markdown.split('## Related posts')[1], /preserving-jaeger-sampled-flag/);
}
// cs-comic series: prev/next links follow the published story order, including interludes.
const ep1 = await readDist('posts/cs-comic-01-batched-background-migrations/index.html');
const ep2 = await readDist('posts/cs-comic-02-mvcc-vacuum/index.html');
const interlude1 = await readDist('posts/cs-comic-interlude-01-first-week/index.html');
const ep3 = await readDist('posts/cs-comic-03-btree-index/index.html');
assert.match(ep1, /href="\/posts\/cs-comic-interlude-01-first-week\/" rel="next"/);
assert.doesNotMatch(ep1, /rel="prev"/);
assert.match(interlude1, /href="\/posts\/cs-comic-01-batched-background-migrations\/" rel="prev"/);
assert.match(interlude1, /href="\/posts\/cs-comic-02-mvcc-vacuum\/" rel="next"/);
assert.match(ep2, /href="\/posts\/cs-comic-interlude-01-first-week\/" rel="prev"/);
assert.match(ep2, /type="image\/avif"[\s\S]*type="image\/webp"[\s\S]*loading="lazy"/);
assert.match(ep2, /property="og:image" content="https:\/\/s3onghyun\.github\.io\/comics\/cs-comic\/ep02-title-card\.png"/);
assert.match(ep2, /giscus\.app\/client\.js/);
const series = await readDist('series/cs-comic/index.html');
assert.match(series, /cs-comic-01-batched-background-migrations/);
assert.match(series, /막간 1<\/span>/);
assert.match(series, /3화<\/span> <a href="\/posts\/cs-comic-03-btree-index/);
assert.doesNotMatch(ep3, /rel="next"/);
assert.match(await readDist('sitemap.xml'), /https:\/\/s3onghyun\.github\.io\/series\/cs-comic\//);
console.log('SEO output checks passed');
