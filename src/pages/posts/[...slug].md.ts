import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { siteConfig } from '../../config/site';
import { isPublished, postMarkdownUrl, postModifiedAt, postUrl } from '../../lib/content';

export async function getStaticPaths() {
  const posts = (await getCollection('posts')).filter(isPublished);
  return posts.map((post) => ({
    params: { slug: post.id.replace(/\.md$/, '') },
    props: { post },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const post = props.post;
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
  ].join('\n');
  return new Response(markdown, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
