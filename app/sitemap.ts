import type { MetadataRoute } from 'next';

const siteUrl = 'https://thiagao.io';

export default function sitemap(): MetadataRoute.Sitemap {
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
  ];
}
