import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

const staticPaths = ['/', '/about/', '/projects/', '/posts/'];

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL('https://s3onghyun.github.io');
  const posts = await getCollection('posts');
  const tags = [...new Set(posts.flatMap((post) => post.data.tags))].sort();
  const entries = [
    ...staticPaths.map((path) => ({ path })),
    ...posts.map((post) => ({
      path: `/posts/${post.id.replace(/\.md$/, '')}/`,
      lastmod: post.data.publishedAt,
    })),
    ...tags.map((tag) => ({ path: `/tags/${encodeURIComponent(tag)}/` })),
  ];
  const urls = entries.map(({ path, lastmod }) => {
    const url = new URL(path, baseUrl).href;
    const modified = lastmod ? `\n    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : '';

    return `  <url>\n    <loc>${url}</loc>${modified}\n  </url>`;
  }).join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
