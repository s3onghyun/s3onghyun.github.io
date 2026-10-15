import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site';
import { isPublished, postMarkdownUrl, postModifiedAt, postUrl } from '../lib/content';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('posts'))
    .filter(isPublished)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
  const fullText = posts.map((post) => [
    `# ${post.data.title}`,
    '',
    `URL: ${new URL(postUrl(post), siteConfig.url).href}`,
    `Markdown: ${new URL(postMarkdownUrl(post), siteConfig.url).href}`,
    `Published: ${post.data.publishedAt.toISOString().slice(0, 10)}`,
    `Updated: ${postModifiedAt(post).toISOString().slice(0, 10)}`,
    '',
    post.body.trim(),
  ].join('\n')).join('\n\n---\n\n');

  return new Response(`# ${siteConfig.name}: full published posts\n\n${fullText}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
