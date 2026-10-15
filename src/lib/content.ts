import type { CollectionEntry } from 'astro:content';

export const isPublished = (post: CollectionEntry<'posts'>) => !post.data.draft;

export const postUrl = (post: CollectionEntry<'posts'>) =>
  `/posts/${post.id.replace(/\.md$/, '')}/`;

export const postMarkdownUrl = (post: CollectionEntry<'posts'>) =>
  `/posts/${post.id.replace(/\.md$/, '')}.md`;

export const postModifiedAt = (post: CollectionEntry<'posts'>) =>
  post.data.updatedAt ?? post.data.publishedAt;

// Shared tags weigh more than shared category; unrelated and draft posts never appear.
export const relatedPosts = (post: CollectionEntry<'posts'>, posts: CollectionEntry<'posts'>[], limit = 3) =>
  posts
    .filter((other) => other.id !== post.id && isPublished(other))
    .map((other) => ({
      other,
      score: other.data.tags.filter((tag) => post.data.tags.includes(tag)).length * 2
        + Number(other.data.category === post.data.category),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.other.data.publishedAt.getTime() - a.other.data.publishedAt.getTime())
    .slice(0, limit)
    .map(({ other }) => other);
