import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site';
import { isPublished, postMarkdownUrl, postUrl } from '../lib/content';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('posts'))
    .filter(isPublished)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
  const postLinks = posts.length
    ? posts.map((post) => `- [${post.data.title}](${new URL(postUrl(post), siteConfig.url).href}) ([Markdown](${new URL(postMarkdownUrl(post), siteConfig.url).href})): ${post.data.description}`).join('\n')
    : '- Published posts will be listed here as they are released.';

  return new Response(`# ${siteConfig.name}\n\n> ${siteConfig.description}\n\nSeonghyun Hong writes Korean and English notes about infrastructure, DevOps, observability, and open source.\n\n## Author\n\n- [GitHub](${siteConfig.author.github})\n\n## Categories\n\n- [Tech](${siteConfig.url}/tech/): Infrastructure, DevOps, and open-source notes.\n- [Study](${siteConfig.url}/study/): Learning notes and series.\n- [Life](${siteConfig.url}/life/): Books and escape-room notes.\n\n## Published posts\n\n${postLinks}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
