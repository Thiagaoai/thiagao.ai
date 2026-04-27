# ThigaoA.i Briefing

Esta e a versao B do site. A landing atual continua intacta em `/`; o teste editorial fica em `/briefing`.

## Rotas

- `/briefing`: site B publico com newsletter, filtros e posts publicados.
- `/admin/newsletter?token=ADMIN_DASHBOARD_TOKEN`: aprovacao humana dos drafts.
- `POST /api/newsletter/subscribe`: captura emails no Supabase.
- `POST /api/agent/daily-digest`: roda o agente diario e salva drafts.
- `POST /api/admin/publish`: publica um draft e opcionalmente envia email via Resend.
- `GET /api/admin/newsletter/status`: diagnostico de variaveis configuradas. Requer `Authorization: Bearer ADMIN_API_TOKEN` em producao.

Aliases para teste A/B:

- `/newslatter`
- `/newsletter`

## Setup Supabase

1. Crie um projeto Supabase.
2. Rode `supabase/migrations/001_newsletter_briefing.sql` no SQL editor.
3. Configure no Dokploy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Setup Resend

Resend nao e obrigatorio para publicar no site. Ele so e necessario para enviar email aos assinantes. O Supabase salva emails e posts; Resend entrega o email.

Remetente padrao do projeto:

- `NEWSLETTER_FROM="ThigaoA.i Briefing <dockplus@dockplusai.com>"`
- `NEWSLETTER_REPLY_TO=dockplus@dockplusai.com`

Passos:

1. Entre no Resend.
2. Adicione/verifique o dominio `dockplusai.com`.
3. Copie os registros DNS que o Resend mostrar.
4. No DNS do `dockplusai.com`, adicione esses registros sem apagar MX/email existentes.
5. Aguarde o Resend marcar o dominio como verificado.
6. Crie uma API key no Resend.
7. Configure no Dokploy:
   - `RESEND_API_KEY`
   - `NEWSLETTER_FROM`
   - `NEWSLETTER_REPLY_TO`

Se preferir separar marca pessoal do email da empresa depois, use:

- `NEWSLETTER_FROM="ThigaoA.i Briefing <briefing@thiagao.io>"`

Nesse caso, o dominio verificado no Resend precisa ser `thiagao.io`.

## Setup Composio MCP

Composio ajuda se ele estiver conectado ao Supabase/Resend/GitHub e expuser essas ferramentas para o Codex. Nesta sessao, nenhuma tool Composio/Supabase apareceu no `tool_search`, entao o projeto foi preparado sem depender disso.

O que o Composio poderia acelerar:

- Criar ou inspecionar projeto Supabase.
- Rodar SQL migration.
- Criar variaveis/secrets em provedores conectados.
- Consultar tabelas e testar inserts.

O que ainda precisa estar seguro:

- Nunca commitar `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ADMIN_API_TOKEN` ou `AGENT_CRON_SECRET`.
- Nunca commitar `COMPOSIO_API_KEY`.
- Se o MCP pedir login/token, configure no app do Composio ou no ambiente local, nao dentro do repo.

Script preparado:

```bash
node scripts/composio/create-session.mjs
```

Runner local seguro, pedindo a key escondida no terminal:

```bash
npm run composio:session:local
```

Antes de rodar:

```bash
npm install @composio/core
```

Variaveis locais:

```bash
COMPOSIO_API_KEY=...
COMPOSIO_USER_ID=thiagaoai-local
```

Toolkits que o script tenta conectar:

- `gmail`
- `composio`
- `github`
- `googlecalendar`
- `notion`
- `googlesheets`
- `slack`
- `supabase`
- `outlook`
- `perplexityai`
- `twitter`
- `googledrive`
- `googledocs`
- `hubspot`
- `linear`
- `airtable`

## Diagnostico

Depois de configurar as variaveis no Dokploy, teste:

```bash
curl https://thiagao.io/api/admin/newsletter/status \
  -H "Authorization: Bearer $ADMIN_API_TOKEN"
```

Localmente:

```bash
curl http://localhost:3003/api/admin/newsletter/status
```

## Job diario

Configure os secrets no GitHub:

- `BRIEFING_AGENT_URL`: `https://thiagao.io/api/agent/daily-digest`
- `AGENT_CRON_SECRET`: mesmo valor usado no Dokploy.

O workflow roda as 17h America/New_York e cria drafts. Nada e publicado automaticamente.

## Aprovacao

Configure no Dokploy:

- `ADMIN_API_TOKEN`
- `ADMIN_DASHBOARD_TOKEN`

Acesse `/admin/newsletter?token=ADMIN_DASHBOARD_TOKEN`, revise o draft e escolha:

- `Publicar`
- `Publicar + email`
