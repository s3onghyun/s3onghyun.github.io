import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL('https://s3onghyun.github.io');
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
  const updatedAt = posts[0]?.data.publishedAt ?? new Date();
  const items = posts.map((post) => {
    const url = new URL(`/posts/${post.id.replace(/\.md$/, '')}/`, baseUrl).href;

    return `
      <item>
        <title>${escapeXml(post.data.title)}</title>
        <description>${escapeXml(post.data.description)}</description>
        <link>${url}</link>
        <guid isPermaLink="true">${url}</guid>
        <pubDate>${post.data.publishedAt.toUTCString()}</pubDate>
      </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>SEONGHYUN HONG</title>
    <description>Platform / DevOps engineer의 기술 노트</description>
    <link>${baseUrl.href}</link>
    <language>ko</language>
    <lastBuildDate>${updatedAt.toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
