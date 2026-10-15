import type { CollectionEntry } from 'astro:content';
import { siteConfig } from '../config/site';
import { postModifiedAt, postUrl } from './content';

const absoluteUrl = (path: string) => new URL(path, siteConfig.url).href;

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      url: `${siteConfig.url}/`,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: 'ko',
    },
    {
      '@type': 'Person',
      '@id': `${siteConfig.url}/#author`,
      name: siteConfig.author.name,
      url: `${siteConfig.url}/`,
      sameAs: [siteConfig.author.github],
    },
  ],
});

export const postJsonLd = (post: CollectionEntry<'posts'>) => ({
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: post.data.title,
  description: post.data.description,
  url: absoluteUrl(postUrl(post)),
  datePublished: post.data.publishedAt.toISOString(),
  dateModified: postModifiedAt(post).toISOString(),
  inLanguage: post.data.language,
  keywords: post.data.tags,
  author: {
    '@id': `${siteConfig.url}/#author`,
    '@type': 'Person',
    name: siteConfig.author.name,
    url: siteConfig.author.github,
  },
});

export const breadcrumbJsonLd = (name: string, path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${siteConfig.url}/`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name,
      item: absoluteUrl(path),
    },
  ],
});
