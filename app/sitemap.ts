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
  ];
}
