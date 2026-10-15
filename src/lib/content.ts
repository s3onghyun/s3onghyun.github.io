import type { CollectionEntry } from 'astro:content';

export const isPublished = (post: CollectionEntry<'posts'>) => !post.data.draft;

export const postUrl = (post: CollectionEntry<'posts'>) =>
  `/posts/${post.id.replace(/\.md$/, '')}/`;

export const postModifiedAt = (post: CollectionEntry<'posts'>) =>
  post.data.updatedAt ?? post.data.publishedAt;
