import type { MetadataRoute } from 'next';
import { getPublishedBriefings } from '@/lib/briefing/posts';

const siteUrl = 'https://thiagao.io';

// The sitemap is otherwise frozen at build time (the Docker build has no Supabase env), so new editions
// would never appear; revalidating hourly makes it pick them up.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts } = await getPublishedBriefings({ limit: 60 });
  return [
    {
      url: siteUrl,
      lastModified: new Date('2026-04-24'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/newsletter`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/farmz3d`,
      lastModified: new Date('2026-09-26'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/reviews-machine`,
      lastModified: new Date('2026-09-26'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/newsletter/${post.slug}`,
      lastModified: new Date(post.publishedAt ?? post.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
