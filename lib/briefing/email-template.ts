import { getSiteUrl } from './config';
import type { BriefingPost } from './types';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeUrl(path: string) {
  return `${getSiteUrl().replace(/\/$/, '')}${path}`;
}

export function renderBriefingText(post: BriefingPost) {
  const sources = post.sources.map((source) => `${source.publisher}: ${source.url}`).join('\n');

  return [
    'ThigaoA.i Daily News',
    '',
    post.title,
    '',
    post.dek,
    '',
    post.brief,
    '',
    `Take principal: ${post.takeaway}`,
    '',
    'Fontes:',
    sources,
    '',
    normalizeUrl('/newslatter'),
  ].join('\n');
}

export function renderBriefingEmail(post: BriefingPost) {
  const logoUrl = normalizeUrl('/brand/thigaoai-logo-512.png');
  const briefingUrl = normalizeUrl('/newslatter');
  const sourceUrl = post.sources[0]?.url ?? briefingUrl;
  const sourceLabel = post.sources[0]
    ? `${post.sources[0].publisher} - ${post.sources[0].title}`
    : 'Fonte principal';
  const sources = post.sources
    .map(
      (source) => `
        <tr>
          <td style="padding:14px 0;border-top:1px solid #27272a;">
            <a href="${escapeHtml(source.url)}" style="color:#67e8f9;text-decoration:none;font-weight:700;">${escapeHtml(source.publisher)}</a>
            <div style="color:#a1a1aa;font-size:13px;line-height:1.5;margin-top:4px;">${escapeHtml(source.title)}</div>
          </td>
        </tr>
      `,
    )
    .join('');
  const tags = post.tags
    .slice(0, 4)
    .map(
      (tag) =>
        `<span style="display:inline-block;margin:0 6px 8px 0;padding:7px 10px;border:1px solid #1f4e66;border-radius:999px;background:#06283a;color:#bae6fd;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;">${escapeHtml(tag)}</span>`,
    )
    .join('');

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
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#030405;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;border:1px solid #20242c;border-radius:28px;overflow:hidden;background:#08090d;">
            <tr>
              <td style="padding:0;background:#05070b;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#05070b;">
                  <tr>
                    <td style="padding:34px 30px 28px;background:linear-gradient(135deg,#05070b 0%,#08111f 48%,#061a31 100%);">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td valign="top" style="width:96px;">
                            <img src="${logoUrl}" width="82" height="82" alt="ThigaoA.i" style="display:block;width:82px;height:82px;border-radius:20px;border:1px solid #263241;object-fit:cover;background:#050505;" />
                          </td>
                          <td valign="top" style="padding-left:16px;">
                            <div style="color:#38bdf8;font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;margin-bottom:8px;">ThigaoA.i Daily News</div>
                            <div style="color:#94a3b8;font-size:13px;line-height:1.5;">IA, agentes, automação e software para quem constrói.</div>
                          </td>
                        </tr>
                      </table>
                      <div style="margin-top:28px;">${tags}</div>
                      <h1 style="margin:12px 0 0;color:#ffffff;font-size:38px;line-height:1.04;font-weight:900;letter-spacing:-.02em;">${escapeHtml(post.title)}</h1>
                      <p style="margin:18px 0 0;color:#d6e4f0;font-size:17px;line-height:1.65;">${escapeHtml(post.dek)}</p>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                        <tr>
                          <td>
                            <a href="${escapeHtml(sourceUrl)}" style="display:inline-block;background:#ffffff;color:#050505;text-decoration:none;font-size:14px;font-weight:900;padding:14px 18px;border-radius:999px;">Ler fonte oficial</a>
                          </td>
                          <td style="padding-left:10px;">
                            <a href="${briefingUrl}" style="display:inline-block;border:1px solid #334155;color:#e5e7eb;text-decoration:none;font-size:14px;font-weight:900;padding:13px 18px;border-radius:999px;">Abrir briefing</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:22px;border:1px solid #155e75;border-radius:22px;background:#06283a;">
                      <div style="color:#67e8f9;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;">Take principal</div>
                      <p style="margin:10px 0 0;color:#f8fafc;font-size:19px;line-height:1.55;font-weight:750;">${escapeHtml(post.takeaway)}</p>
                    </td>
                  </tr>
                </table>
                <h2 style="margin:30px 0 12px;color:#ffffff;font-size:23px;line-height:1.2;">O que aconteceu</h2>
                <p style="margin:0;color:#d4d4d8;font-size:16px;line-height:1.75;">${escapeHtml(post.brief)}</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:26px 0;border-collapse:separate;border-spacing:0 10px;">
                  <tr>
                    <td style="padding:18px;border:1px solid #27272a;border-radius:18px;background:#101216;">
                      <div style="color:#fff;font-size:15px;font-weight:900;margin-bottom:6px;">Para builders</div>
                      <div style="color:#bfc6d1;font-size:14px;line-height:1.65;">Transforme a notícia em teste prático: escolha uma tarefa real, entregue contexto, deixe o agente operar ferramentas e cobre verificação do resultado.</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px;border:1px solid #27272a;border-radius:18px;background:#101216;">
                      <div style="color:#fff;font-size:15px;font-weight:900;margin-bottom:6px;">Para operacao</div>
                      <div style="color:#bfc6d1;font-size:14px;line-height:1.65;">O valor está em reduzir microgerenciamento: menos etapas manuais, mais fluxo completo com planejamento, execução e revisão.</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px;border:1px solid #27272a;border-radius:18px;background:#101216;">
                      <div style="color:#fff;font-size:15px;font-weight:900;margin-bottom:6px;">Para conteudo</div>
                      <div style="color:#bfc6d1;font-size:14px;line-height:1.65;">A melhor pauta não é “modelo novo”; é mostrar como essa capacidade muda o trabalho real em sites, automações, atendimento e produto.</div>
                    </td>
                  </tr>
                </table>
                <div style="padding:18px 0 4px;border-top:1px solid #27272a;">
                  <div style="color:#a1a1aa;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;margin-bottom:10px;">Fonte usada</div>
                  <div style="color:#d4d4d8;font-size:14px;line-height:1.6;">${escapeHtml(sourceLabel)}</div>
                </div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;">
                  ${sources}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 30px 30px;border-top:1px solid #20242c;background:#07080b;color:#71717a;font-size:12px;line-height:1.65;">
                Você recebeu este email porque está inscrito no ThigaoA.i Daily News. Responda este email para falar com o Thiago.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
