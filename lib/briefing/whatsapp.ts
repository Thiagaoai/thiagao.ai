import { getSiteUrl } from './config';
import type { BriefingPost } from './types';

function normalizeUrl(path: string) {
  return `${getSiteUrl().replace(/\/$/, '')}${path}`;
}

function clean(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function getSolocodandoWhatsAppUrl() {
  return process.env.WHATSAPP_SOLOCODANDO_INVITE_URL || '';
}

export function renderBriefingWhatsApp(post: BriefingPost) {
  const briefingUrl = normalizeUrl(`/newslatter?tag=${encodeURIComponent(post.category)}`);
  const sourceUrl = post.sources[0]?.url;
  const groupUrl = getSolocodandoWhatsAppUrl();
  const tags = post.tags.slice(0, 4).map((tag) => `#${tag.replace(/\s+/g, '')}`).join(' ');

  return [
    '*Solocodando Daily*',
    `*${clean(post.title)}*`,
    '',
    clean(post.dek),
    '',
    `*Por que importa:* ${clean(post.takeaway)}`,
    '',
    `*Contexto:* ${clean(post.brief)}`,
    '',
    sourceUrl ? `Fonte: ${sourceUrl}` : null,
    `Briefing completo: ${briefingUrl}`,
    groupUrl ? `Grupo Solocodando: ${groupUrl}` : 'Grupo Solocodando: peça o link no @thiagaoAi',
    tags ? `\n${tags}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export function renderCustomWhatsApp({
  headline,
  preheader,
  body,
  cardImageUrl,
  ctaUrl,
}: {
  headline: string;
  preheader: string;
  body: string;
  cardImageUrl?: string;
  ctaUrl?: string;
}) {
  const groupUrl = getSolocodandoWhatsAppUrl();

  return [
    '*Solocodando Update*',
    `*${clean(headline)}*`,
    '',
    clean(preheader),
    '',
    clean(body.replace(/<[^>]+>/g, ' ')),
    '',
    cardImageUrl ? `Card: ${cardImageUrl}` : null,
    `Briefing: ${ctaUrl || normalizeUrl('/newslatter')}`,
    groupUrl ? `Grupo Solocodando: ${groupUrl}` : 'Grupo Solocodando: peça o link no @thiagaoAi',
  ]
    .filter(Boolean)
    .join('\n');
}
