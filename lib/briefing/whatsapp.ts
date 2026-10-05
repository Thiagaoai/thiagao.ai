import { getSiteUrl } from './config.ts';
import { editionUrl, formatEditionDate } from './edition.ts';
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
  const groupUrl = getSolocodandoWhatsAppUrl();
  const groupLine = groupUrl ? `Grupo Solocodando: ${groupUrl}` : 'Grupo Solocodando: peça o link no @thiagaoAi';

  if (post.items.length > 0) {
    const date = formatEditionDate(post.publishedAt, 'short');
    return [
      date ? `*Thiagao Ai Daily* · ${date}` : '*Thiagao Ai Daily*',
      `*${clean(post.title)}*`,
      '',
      clean(post.dek),
      '',
      ...post.items.map((item, index) => `${index + 1}. *${clean(item.title)}* — ${clean(item.whyItMatters)}`),
      '',
      `*Take do dia:* ${clean(post.takeaway)}`,
      '',
      `Edição completa: ${editionUrl(post, { source: 'whatsapp', medium: 'group' })}`,
      groupLine,
    ].join('\n');
  }

  const sourceUrl = post.sources[0]?.url;
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
    `Briefing completo: ${editionUrl(post)}`,
    groupLine,
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
    `Briefing: ${ctaUrl || normalizeUrl('/newsletter')}`,
    groupUrl ? `Grupo Solocodando: ${groupUrl}` : 'Grupo Solocodando: peça o link no @thiagaoAi',
  ]
    .filter(Boolean)
    .join('\n');
}
