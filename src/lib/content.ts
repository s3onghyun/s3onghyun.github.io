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

// Series entries may include story interludes; their explicit order is intentional.
export const seriesNeighbors = (post: CollectionEntry<'posts'>, posts: CollectionEntry<'posts'>[]) => {
  if (!post.data.series) return {};
  const episodes = posts
    .filter((other) => other.data.series === post.data.series && (other.id === post.id || isPublished(other)))
    .sort((a, b) => (a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER)
      || a.data.publishedAt.getTime() - b.data.publishedAt.getTime() || a.id.localeCompare(b.id));
  const index = episodes.findIndex((other) => other.id === post.id);
  return { prev: episodes[index - 1], next: episodes[index + 1] };
};
