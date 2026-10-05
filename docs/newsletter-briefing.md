# Thiagao Ai Daily — edição diária

A newsletter é uma edição por dia (dia de New York), gerada pelo agente, publicada no site e enviada por email.

## O que é uma edição

- **Manchete** e **intro** (dek) do dia.
- **5 a 7 notícias**, cada uma com título, resumo, fonte e link.
- **Para testar hoje**: uma sugestão prática para o leitor experimentar.
- **Take do dia**: a opinião curta do Thiagao sobre o que importa.
- **Compartilhar**: WhatsApp, X, LinkedIn e copiar link.

Cada edição fica na tabela `daily_digest_posts`, com os itens estruturados em `items` (migration `supabase/migrations/009_daily_edition_items.sql`). O slug é `daily-<data>` (ex.: `daily-2026-10-05`); uma edição forçada no mesmo dia vira `daily-<data>-<hhmm>`.

## Pipeline

```
collect  → dedupe   → rank      → write          → publish        → send
RSS      normaliza   frescor     LLM (DeepSeek    daily_digest_    Resend em lotes
Perplex. URL/título  fonte       por padrão),     posts, no ar     de 100, com
X        vs 14 dias  memória     JSON validado    na hora          descadastro
                                 ou fallback
```

1. **Coleta** (`lib/briefing/agent.ts`, catálogo em `lib/briefing/sources.ts`): feeds RSS, Perplexity e X. Feed fora do ar, ou Perplexity/X sem chave, só geram uma nota; nunca derrubam a execução.
2. **Dedupe e ranking** (`dedupe.ts`, `ranking.ts`, `memory.ts`): descarta o que já saiu nos últimos 14 dias de edições, penaliza tópico repetido e limita a quantidade por fonte.
3. **Redação** (`writer.ts`): um LLM em endpoint compatível com OpenAI escolhe e escreve os itens. A resposta é validada com zod.
4. **Publicação**: grava a edição em `daily_digest_posts` e publica na hora.
5. **Envio** (`email.ts`, `email-template.ts`): Resend, em lotes de 100, com link e cabeçalhos de descadastro por destinatário.

### Quando o redator cai para o fallback

O redator tenta uma vez e, se o JSON vier inválido, tenta de novo com os erros. Se falhar de novo, ou se não houver chave (`NEWSLETTER_WRITER_API_KEY` / `DEEPSEEK_API_KEY`), ou se a chamada der timeout, monta a edição com um template estruturado a partir dos itens ranqueados. Ele nunca lança erro. A resposta da rota informa `writer: "llm"` ou `writer: "fallback"`, e o fallback é mais seco que o texto do LLM.

## Rotas

Páginas:

- `/newsletter`: arquivo e edição mais recente (o código está em `app/briefing/page.tsx`; `/briefing` é alias com canonical em `/newsletter`).
- `/newsletter/[slug]`: página da edição, com manchete, notícias, "Para testar hoje", "Take do dia", compartilhar, anterior/próxima e formulário de assinatura.
- `/newsletter/sair`: confirmação de descadastro (estados `done` e `invalid`; `noindex`).
- `/admin/newsletter?token=ADMIN_DASHBOARD_TOKEN`: painel de aprovação e disparo manual.

API:

- `POST /api/newsletter/subscribe`: grava o email no Supabase.
- `POST /api/newsletter/unsubscribe`: descadastra (ver abaixo).
- `POST /api/agent/daily-digest`: roda o agente do dia. Autoriza por `Authorization: Bearer AGENT_CRON_SECRET` ou pela sessão admin.
- `POST /api/admin/publish`: publica um draft existente e, opcionalmente, envia o email.
- `GET /api/admin/newsletter/status`: diagnóstico das variáveis (`checks` e `ready`). Em produção exige `Authorization: Bearer ADMIN_API_TOKEN`.

### `POST /api/agent/daily-digest`

Corpo: `{ "dryRun"?: boolean, "force"?: boolean }`.

- **`dryRun: true`**: roda o agente inteiro, inclusive o redator (que custa uma chamada ao LLM), e devolve `{ draft, writer, run }` sem gravar, publicar nem enviar.
- **Sem `force`** (o caso do cron), a rota é idempotente por dia de New York e decide:
  - já existe edição do dia e ela foi enviada: **pula** (`{ ok: true, skipped: true, reason, campaign }`);
  - existe edição publicada mas o email não saiu: **reenvia** essa edição (`{ resent: true }`);
  - existe um draft órfão do dia (gerado, não publicado): **publica e envia** (`{ recovered: true }`);
  - não existe nada: **cria** a edição, publica e envia.
- **`force: true`**: ignora as edições existentes, cria uma edição nova (`daily-<data>-<hhmm>`) e envia para todos os assinantes de novo. A entrega dupla é intencional.
- Respostas: 200 quando publicou ou reenviou, inclusive quando o email foi pulado por falta de `RESEND_API_KEY` ou de assinantes (`email.skipped: true`); 502 quando o Resend falhou, para o cron ficar vermelho; 500 quando o Supabase não está configurado, deu erro, ou nenhum item foi gerado (a resposta traz `notes`); nesses casos nada é enviado.

Rodadas duplicadas do cron (21h e 22h UTC, por causa do horário de verão) são seguras por causa dessa idempotência.

## Painel `/admin/newsletter`

- **Pré-visualizar edição de hoje**: chama a rota com `dryRun`. Usa o redator (consome uma chamada ao LLM) e não grava nada.
- **Gerar, publicar e enviar agora**: chama a rota com `force`. Pede confirmação, porque envia a edição nova para todos os assinantes.
- Os drafts pendentes mostram assunto e quantidade de itens; escolha `Publicar` ou `Publicar + email`.

## Descadastro

- Todo email leva um link para `/newsletter/sair?...` com email e token assinado (HMAC) e os cabeçalhos `List-Unsubscribe` (URL de `POST /api/newsletter/unsubscribe`) e `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058).
- `POST /api/newsletter/unsubscribe` lê `email` e `token` do corpo (JSON ou formulário) ou da query string, porque o one-click do provedor manda só `List-Unsubscribe=One-Click` no corpo. Não exige mesma origem. Com token inválido não altera nada (400, ou redirect para `state=invalid`). Com token válido marca o assinante como `unsubscribed` e registra o evento `unsubscribe`; responde JSON, ou redireciona (303) para `/newsletter/sair?state=done` quando o `Accept` pede HTML.
- O segredo do token é `NEWSLETTER_UNSUBSCRIBE_SECRET`, ou `AGENT_CRON_SECRET` se ele não existir. Sem nenhum dos dois, os emails saem sem link de descadastro assinado.

## Variáveis de ambiente

Obrigatórias para o fluxo completo:

- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: banco (assinantes e edições).
- `RESEND_API_KEY`, `NEWSLETTER_FROM`, `NEWSLETTER_REPLY_TO`: envio (ver Resend abaixo).
- `AGENT_CRON_SECRET`: autoriza o cron.
- `ADMIN_API_TOKEN`, `ADMIN_DASHBOARD_TOKEN`: painel e diagnóstico.
- `NEXT_PUBLIC_SITE_URL`: base dos links absolutos (padrão `https://thiagao.io`, o mesmo canônico das páginas).

Redator (todas opcionais; sem chave, a edição sai pelo fallback):

- `NEWSLETTER_WRITER_API_KEY`: chave do LLM. Se ausente, usa `DEEPSEEK_API_KEY`.
- `NEWSLETTER_WRITER_BASE_URL`: endpoint compatível com OpenAI. Padrão `https://api.deepseek.com`.
- `NEWSLETTER_WRITER_MODEL`: padrão `deepseek-chat`.

Outras opcionais:

- `NEWSLETTER_UNSUBSCRIBE_SECRET`: segredo do token de descadastro (padrão: `AGENT_CRON_SECRET`).
- `PERPLEXITY_API_KEY` (e `PERPLEXITY_MODEL`): pesquisa fresca.
- `X_BEARER_TOKEN` (ou `TWITTER_BEARER_TOKEN`): sinais do X.
- `LANGSMITH_API_KEY`, `LANGSMITH_TRACING=true`: tracing.

O endpoint de status reporta tudo isso em `checks`, e `ready.writer` / `ready.unsubscribe` dizem se o redator e o descadastro estão configurados.

## Setup Supabase

1. Crie (ou restaure) o projeto Supabase.
2. Rode as migrations de `supabase/migrations/` no SQL editor, começando por `001_newsletter_briefing.sql` e terminando em `009_daily_edition_items.sql` (colunas `items`, `subject` e `share_text` em `daily_digest_posts` e o tipo de evento `unsubscribe`).
3. Configure no Dokploy `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.

## Setup Resend

Resend não é obrigatório para publicar no site. Ele só é necessário para enviar email aos assinantes. O Supabase salva emails e edições; o Resend entrega o email.

Remetente padrão do projeto:

- `NEWSLETTER_FROM="Thiagao Ai Briefing <dockplus@dockplusai.com>"`
- `NEWSLETTER_REPLY_TO=dockplus@dockplusai.com`

Passos:

1. Entre no Resend.
2. Adicione/verifique o domínio `dockplusai.com`.
3. Copie os registros DNS que o Resend mostrar.
4. No DNS do `dockplusai.com`, adicione esses registros sem apagar MX/email existentes.
5. Aguarde o Resend marcar o domínio como verificado.
6. Crie uma API key no Resend.
7. Configure no Dokploy: `RESEND_API_KEY`, `NEWSLETTER_FROM`, `NEWSLETTER_REPLY_TO`.

Se preferir separar marca pessoal do email da empresa depois, use `NEWSLETTER_FROM="Thiagao Ai Briefing <briefing@thiagao.io>"`. Nesse caso, o domínio verificado no Resend precisa ser `thiagao.io`.

Os scripts de `scripts/composio` continuam no repositório, mas não fazem parte do fluxo da newsletter.

## Testar localmente

Sem Supabase, o modo `LOCAL_DEMO_DB=1` usa um arquivo JSON local (`.data/local-db.json`, ignorado pelo git):

```bash
LOCAL_DEMO_DB=1 npm run dev   # porta 3002
```

Em outro terminal, primeiro uma prévia sem gravar:

```bash
curl -X POST localhost:3002/api/agent/daily-digest -H 'content-type: application/json' -d '{"dryRun":true}'
```

Sem chave de LLM a resposta traz `"writer":"fallback"`. Para criar e publicar a edição localmente (sem `RESEND_API_KEY` o email é pulado: `email.skipped: true`):

```bash
curl -X POST localhost:3002/api/agent/daily-digest -H 'content-type: application/json' -d '{}'
```

Depois abra `http://localhost:3002/newsletter` e `http://localhost:3002/newsletter/daily-<data>`. Repetir o mesmo comando reenvia a edição ainda não enviada (`resent: true`) em vez de criar outra. Diagnóstico das variáveis:

```bash
curl http://localhost:3002/api/admin/newsletter/status
```

## Cron diário (GitHub Actions)

O workflow `.github/workflows/daily-briefing.yml` ("Daily Thiagao Ai Edition") chama `POST /api/agent/daily-digest` às 17h de New York (cron `0 21,22 * * *` em UTC, com checagem da hora de New York). Secrets no GitHub:

- `BRIEFING_AGENT_URL`: URL completa da rota, por exemplo `https://<dominio>/api/agent/daily-digest`.
- `AGENT_CRON_SECRET`: o mesmo valor usado no Dokploy.

Execução manual (aba Actions, "Run workflow"): `dry_run` (prévia sem gravar) e `force` (nova edição, envia para todos de novo). Ambos começam em `false`; um disparo manual sem `force` é idempotente como o cron.

### Por que o cron parou e como reativar

O GitHub desativa workflows agendados em repositórios sem atividade por 60 dias. Este foi desativado em 2026-06-29 (`disabled_inactivity`). Para reativar:

```bash
gh workflow enable daily-briefing.yml
```

(ou pela aba Actions, botão "Enable workflow").

### O passo "Keep the schedule enabled"

O último passo do job roda `gh workflow enable daily-briefing.yml` com o `github.token` do próprio job (`permissions: actions: write`), com `if: always()`, mesmo quando a chamada da rota falha. Isso impede que o workflow seja desativado por inatividade enquanto ele continuar rodando. Ele **não** reativa um workflow que já foi desativado: um workflow desativado não dispara mais e o passo nunca executa, então a primeira reativação é manual (comando acima). A action `gautamkrishnar/keepalive-workflow` não é usada porque o repositório dela está bloqueado no GitHub desde abril de 2025.

## Passos manuais depois do merge

1. Restaurar o projeto Supabase da newsletter (pode estar pausado) e conferir no Dokploy `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
2. Rodar `supabase/migrations/009_daily_edition_items.sql` no SQL editor.
3. Definir no Dokploy as variáveis do redator (`NEWSLETTER_WRITER_API_KEY` ou `DEEPSEEK_API_KEY`) e conferir `RESEND_API_KEY`, `AGENT_CRON_SECRET`, `ADMIN_API_TOKEN` e `ADMIN_DASHBOARD_TOKEN`.
4. Mesclar o PR (o deploy sai pelo workflow "Build & Deploy").
5. Reativar o cron: `gh workflow enable daily-briefing.yml` (ou pela aba Actions). O passo de keep-enabled evita nova desativação.
6. Opcional: definir `NEWSLETTER_UNSUBSCRIBE_SECRET` no Dokploy (sem ele, usa `AGENT_CRON_SECRET`).
7. Conferir `/api/admin/newsletter/status` e rodar uma prévia pelo painel antes da primeira edição real.

Nunca commite `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ADMIN_API_TOKEN`, `AGENT_CRON_SECRET` nem chaves de LLM.
