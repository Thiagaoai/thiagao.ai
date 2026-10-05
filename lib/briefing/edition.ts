import { getSiteUrl } from './config.ts';
import type { BriefingPost } from './types';

export function editionPath(post: Pick<BriefingPost, 'slug'>) {
  return `/newsletter/${post.slug}`;
}

export function editionUrl(post: Pick<BriefingPost, 'slug'>, utm?: { source: string; medium: string; campaign?: string }) {
  const url = new URL(editionPath(post), getSiteUrl());
  if (utm) {
    url.searchParams.set('utm_source', utm.source);
    url.searchParams.set('utm_medium', utm.medium);
    url.searchParams.set('utm_campaign', utm.campaign ?? post.slug);
  }
  return url.toString();
}

export function shareLinks(post: Pick<BriefingPost, 'slug' | 'title' | 'shareText'>, medium = 'share') {
  const url = editionUrl(post, { source: 'share', medium });
  const text = post.shareText ?? post.title;
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    url,
  };
}

// Display names for BriefingTag values (the tags stay ASCII in the database and in URL filters).
const CATEGORY_LABELS: Record<string, string> = {
  AI: 'IA',
  Automacao: 'Automação',
  DevTools: 'Dev tools',
  Hardware: 'Hardware',
  BigTech: 'Big tech',
  Agents: 'Agentes',
  Startups: 'Startups',
  Infra: 'Infra',
};

export function categoryLabel(tag: string) {
  return CATEGORY_LABELS[tag] ?? tag;
}

export function formatEditionDate(iso: string | null, style: 'full' | 'short' = 'full') {
  if (!iso) return '';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/New_York', dateStyle: style === 'full' ? 'full' : 'medium' }).format(new Date(iso));
}
