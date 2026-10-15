import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { siteConfig } from '../../config/site';
import { isPublished, postMarkdownUrl, postModifiedAt, postUrl, relatedPosts } from '../../lib/content';

export async function getStaticPaths() {
  const posts = (await getCollection('posts')).filter(isPublished);
  return posts.map((post) => ({
    params: { slug: post.id.replace(/\.md$/, '') },
    props: { post, related: relatedPosts(post, posts) },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { post, related } = props;
  const markdown = [
    `# ${post.data.title}`,
    '',
    `URL: ${new URL(postUrl(post), siteConfig.url).href}`,
    `Markdown: ${new URL(postMarkdownUrl(post), siteConfig.url).href}`,
    `Published: ${post.data.publishedAt.toISOString().slice(0, 10)}`,
    `Updated: ${postModifiedAt(post).toISOString().slice(0, 10)}`,
    '',
    post.body.trim(),
    '',
    ...(related.length ? ['## Related posts', '', ...related.map((other) => `- [${other.data.title}](${new URL(postUrl(other), siteConfig.url).href})`), ''] : []),
  ].join('\n');
  return new Response(markdown, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
