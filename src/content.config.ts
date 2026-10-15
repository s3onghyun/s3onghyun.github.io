import { defineCollection, z } from 'astro:content';

const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string()),
  category: z.enum(['tech', 'study', 'life']),
  language: z.enum(['ko', 'en']).default('ko'),
  updatedAt: z.coerce.date().optional(),
  series: z.string().optional(),
  draft: z.boolean().default(true),
});

const posts = defineCollection({ schema: postSchema });
const templates = defineCollection({ schema: postSchema });

export const collections = { posts, templates };
