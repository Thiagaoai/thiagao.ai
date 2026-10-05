import { escapeHtml } from '../shared/request-guard.ts';
import { getSiteUrl } from './config.ts';
import { categoryLabel, editionUrl, formatEditionDate, shareLinks } from './edition.ts';
import type { BriefingPost, EditionItem } from './types';

export { escapeHtml } from '../shared/request-guard.ts';

type EditionRenderOptions = { unsubscribeUrl: string | null };

function normalizeUrl(path: string) {
  return `${getSiteUrl().replace(/\/$/, '')}${path}`;
}

export function renderRichText(value: string) {
  return escapeHtml(value)
    .split(/\n{2,}/)
    .map((paragraph) => `<p style="margin:0 0 14px;color:#d4d4d8;font-size:16px;line-height:1.75;">${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

function renderItem(item: EditionItem, index: number) {
  const isTool = item.kind === 'tool';
  const border = isTool ? '#155e75' : '#27272a';
  const background = isTool ? '#06283a' : '#101216';
  const toolLabel = isTool
    ? `<div style="color:#67e8f9;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;margin-bottom:10px;">Para testar hoje</div>`
    : '';

  return `
                  <tr>
                    <td style="padding:16px;border:1px solid ${border};border-radius:22px;background:${background};">
                      ${toolLabel}
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
                        <tr>
                          <td style="color:#38bdf8;font-size:13px;font-weight:900;padding-right:10px;">${String(index + 1).padStart(2, '0')}</td>
                          <td><span style="display:inline-block;padding:5px 9px;border:1px solid #1f4e66;border-radius:999px;background:#06283a;color:#bae6fd;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;">${escapeHtml(categoryLabel(item.category))}</span></td>
                        </tr>
                      </table>
                      <h2 style="margin:0;color:#ffffff;font-size:22px;line-height:1.25;font-weight:900;">${escapeHtml(item.title)}</h2>
                      <p style="margin:12px 0 0;color:#d4d4d8;font-size:16px;line-height:1.7;">${escapeHtml(item.summary)}</p>
                      <p style="margin:12px 0 0;color:#67e8f9;font-size:15px;line-height:1.65;"><strong>Por que importa:</strong> ${escapeHtml(item.whyItMatters)}</p>
                      <p style="margin:14px 0 0;font-size:14px;line-height:1.5;"><a href="${escapeHtml(item.source.url)}" style="color:#e5e7eb;text-decoration:underline;font-weight:800;">Ler na fonte · ${escapeHtml(item.source.publisher)}</a></p>
                    </td>
                  </tr>
                  <tr><td style="height:12px;line-height:12px;font-size:0;">&nbsp;</td></tr>`;
}

function shareButton(href: string, label: string, primary = false) {
  const look = primary ? 'background:#16a34a;color:#ffffff;border:1px solid #16a34a;' : 'border:1px solid #334155;color:#e5e7eb;';
  return `<a href="${escapeHtml(href)}" style="display:inline-block;margin:0 8px 8px 0;${look}text-decoration:none;font-size:14px;font-weight:900;padding:12px 18px;border-radius:999px;">${label}</a>`;
}

export function renderEditionEmail(post: BriefingPost, { unsubscribeUrl }: EditionRenderOptions) {
  const logoUrl = normalizeUrl('/brand/thigaoai-logo-512.png');
  const dateLine = formatEditionDate(post.publishedAt);
  const share = shareLinks(post, 'email');
  const siteUrl = editionUrl(post, { source: 'newsletter', medium: 'email' });
  const shareText = post.shareText?.trim();
  const shareQuote = shareText
    ? `<p style="margin:0 0 14px;color:#a1a1aa;font-size:14px;line-height:1.55;font-style:italic;">“${escapeHtml(shareText)}”</p>`
    : '';

  const body =
    post.items.length > 0
      ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${post.items.map(renderItem).join('')}
                </table>`
      : renderRichText(post.brief);

  const unsubscribe = unsubscribeUrl
    ? `<a href="${escapeHtml(unsubscribeUrl)}" style="color:#a1a1aa;text-decoration:underline;">Sair da lista</a>`
    : 'Para sair, responda com SAIR.';

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(post.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#030405;color:#f4f4f5;font-family:Inter,Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(post.dek)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#030405;padding:20px 8px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;border:1px solid #20242c;border-radius:28px;overflow:hidden;background:#08090d;">
            <tr>
              <td style="padding:28px 24px 24px;background:#05070b;background-image:linear-gradient(135deg,#05070b 0%,#08111f 48%,#061a31 100%);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td valign="top" style="width:72px;">
                      <img src="${escapeHtml(logoUrl)}" width="60" height="60" alt="Thiagao Ai" style="display:block;width:60px;height:60px;border-radius:16px;border:1px solid #263241;background:#050505;" />
                    </td>
                    <td valign="middle" style="padding-left:14px;">
                      <div style="color:#38bdf8;font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;margin-bottom:6px;">Thiagao Ai Daily</div>
                      <div style="color:#94a3b8;font-size:13px;line-height:1.5;">${escapeHtml(dateLine)}</div>
                    </td>
                  </tr>
                </table>
                <h1 style="margin:26px 0 0;color:#ffffff;font-size:34px;line-height:1.08;font-weight:900;letter-spacing:-.02em;">${escapeHtml(post.title)}</h1>
                <p style="margin:16px 0 0;color:#d6e4f0;font-size:17px;line-height:1.65;">${escapeHtml(post.dek)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px;">
                ${body}
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;">
                  <tr>
                    <td style="padding:16px;border:1px solid #155e75;border-radius:22px;background:#06283a;">
                      <div style="color:#67e8f9;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;">Take do dia</div>
                      <p style="margin:10px 0 0;color:#f8fafc;font-size:19px;line-height:1.55;font-weight:750;">${escapeHtml(post.takeaway)}</p>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:28px;padding-top:22px;border-top:1px solid #27272a;">
                  <p style="margin:0 0 8px;color:#f4f4f5;font-size:16px;line-height:1.6;font-weight:800;">Gostou? Manda para alguém que acompanha IA.</p>
                  ${shareQuote}
                  ${shareButton(share.whatsapp, 'WhatsApp', true)}${shareButton(share.x, 'X')}${shareButton(share.linkedin, 'LinkedIn')}
                  <div style="margin-top:6px;">
                    <a href="${escapeHtml(siteUrl)}" style="display:inline-block;border:1px solid #27272a;color:#a1a1aa;text-decoration:none;font-size:13px;font-weight:800;padding:10px 16px;border-radius:999px;">Ler no site</a>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 18px 24px;border-top:1px solid #20242c;background:#07080b;color:#71717a;font-size:12px;line-height:1.65;">
                Você recebe o Thiagao Ai Daily porque assinou em thiagao.io. Responda este email para falar com o Thiago.<br />
                ${unsubscribe}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderEditionText(post: BriefingPost, { unsubscribeUrl }: EditionRenderOptions) {
  const dateLine = formatEditionDate(post.publishedAt);
  const items =
    post.items.length > 0
      ? post.items
          .map((item, index) =>
            [
              item.kind === 'tool' ? 'PARA TESTAR HOJE' : null,
              `${index + 1}. ${item.title}`,
              item.summary,
              `Por que importa: ${item.whyItMatters}`,
              `Fonte: ${item.source.url}`,
            ]
              .filter((line) => line !== null)
              .join('\n'),
          )
          .join('\n\n')
      : post.brief;

  return [
    'THIAGAO AI DAILY',
    dateLine || null,
    '',
    post.title,
    '',
    post.dek,
    '',
    items,
    '',
    `Take do dia: ${post.takeaway}`,
    '',
    `Ler no site: ${editionUrl(post, { source: 'newsletter', medium: 'email' })}`,
    '',
    'Gostou? Manda para alguém que acompanha IA.',
    '',
    'Você recebe o Thiagao Ai Daily porque assinou em thiagao.io. Responda este email para falar com o Thiago.',
    unsubscribeUrl ? `Sair da lista: ${unsubscribeUrl}` : 'Para sair, responda com SAIR.',
  ]
    .filter((line) => line !== null)
    .join('\n');
}
