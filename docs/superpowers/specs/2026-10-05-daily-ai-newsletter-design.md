# Thiagao Ai Daily: edição diária de notícias de IA

Data: 2026-10-05. Status: aprovado pelo usuário (padrões: DeepSeek como redator, envio às 17h New York, publicação automática).

## 1. Contexto e problema

O site já tem um pipeline diário (`.github/workflows/daily-briefing.yml` → `POST /api/agent/daily-digest` → agente LangGraph em `lib/briefing/agent.ts` → Supabase → Resend). Ele está quebrado em três níveis:

- Conteúdo: a etapa de síntese não usa modelo de linguagem. Ela cola título e trecho bruto (em inglês) de cada item num esqueleto fixo. Título fixo por dia da semana, "take" fixo, três caixas de texto idênticas no email. Cada dia da semana só olha uma categoria.
- Repetição: só há memória de "laboratório" (OpenAI, Anthropic...) nas últimas cinco edições. Não há dedup de URL nem de título contra edições anteriores. Três drafts por dia são criados e só um é publicado.
- Operação: o workflow agendado foi desativado pelo GitHub por inatividade (`disabled_inactivity`) desde 2026-06-29. O site em produção responde `source: "fallback"`, ou seja, o Supabase não está acessível (projeto pausado ou variáveis ausentes). Feeds de Anthropic, Meta AI, Microsoft AI, LangChain e VentureBeat estão mortos (404/410/429). O email não tem descadastro. O envio corta silenciosamente em 100 assinantes.

## 2. Requisitos do usuário

1. Edição diária com as novidades do dia em IA ("cotidiano").
2. Postagens não podem se repetir.
3. Não pode ser tudo sobre ChatGPT nem os mesmos assuntos.
4. Variação boa, conteúdo do dia, sem coisas chatas ou aleatórias.
5. Site pronto, newsletter funcional e recorrente.
6. Dar vontade de ficar inscrito e de compartilhar.
7. Usar o que já está configurado (DeepSeek, Resend, Supabase, GitHub Actions).

Critérios de sucesso verificáveis:

- Uma edição por dia (chave `daily-YYYY-MM-DD` no fuso America/New_York), com 5 a 7 notícias, cada uma de uma fonte diferente, no máximo 2 por categoria, no máximo 2 sobre OpenAI/ChatGPT.
- Nenhum item cuja URL normalizada ou cujo título (similaridade ≥ 0,5) já apareceu em edição publicada nos últimos 14 dias.
- Só entram itens com até 48 horas; se houver menos de 8 candidatos, a janela abre para 7 dias.
- Se o redator (LLM) falhar, a edição sai mesmo assim em modo fallback estruturado, e a execução registra `writer: "fallback"`.
- Email com descadastro em um clique, cabeçalhos `List-Unsubscribe`, botões de compartilhar e link para a página da edição.
- `npm run check` (lint, testes, build) passa.

## 3. Fora de escopo

- Programa de indicação/referral, tracking de abertura por pixel próprio, A/B de assunto.
- Trocar LangGraph, Resend ou Supabase.
- Mudar o horário de envio (continua 17h New York; é uma linha no cron).
- Restaurar o projeto Supabase e configurar variáveis no Dokploy: ações manuais do usuário, listadas na seção 14.

## 4. Arquitetura do pipeline

```
collect  → dedupe   → rank      → write          → persist/publish → send
RSS      normaliza   score       LLM (DeepSeek)   daily_digest_posts   Resend em lotes
Perplex. URL/título  frescor     JSON validado    slug daily-<data>    + List-Unsubscribe
X        vs 14 dias  memória     ou fallback      publicado na hora    + log por email
```

Tudo continua dentro de `runDailyBriefingAgent()` (LangGraph com três nós: `collect`, `rank`, `write`). O nó `write` substitui `synthesize`. A rota `daily-digest` passa a ser idempotente por slug do dia.

## 5. Modelo de dados

Migration `supabase/migrations/009_daily_edition_items.sql`:

```sql
alter table public.daily_digest_posts
  add column if not exists items jsonb not null default '[]'::jsonb,
  add column if not exists subject text,
  add column if not exists share_text text;
```

`lib/dev/local-db.ts`: `defaults('daily_digest_posts')` passa a incluir `items: []`, `subject: null`, `share_text: null`, `updated_at`.

Tipos (`lib/briefing/types.ts`):

```ts
export type EditionItemKind = 'lead' | 'story' | 'tool';
export type EditionItem = {
  kind: EditionItemKind;
  title: string;        // pt-BR, ≤ 110 chars
  summary: string;      // 2–3 frases
  whyItMatters: string; // 1 frase
  category: BriefingTag;
  source: BriefingSource; // { title, url, publisher, publishedAt? }
};
// BriefingPost ganha: items: EditionItem[]; subject: string | null; shareText: string | null
// BriefingDraftInput herda os três campos.
```

Posts antigos (sem `items`) continuam válidos: `items = []` e os renderizadores caem para `brief`.

## 6. Unidades e interfaces

### 6.1 `lib/briefing/sources.ts` (novo)

Lista de feeds com `{ name, url, category, reliability }`. Remove os mortos (Anthropic, Meta AI, Microsoft AI em blogs.microsoft.com, Mistral em /news/rss.xml, LangChain, VentureBeat). Corrige Mistral para `https://mistral.ai/rss.xml` e Microsoft para `https://news.microsoft.com/source/topics/ai/feed/`. Adiciona, todos verificados em 2026-10-05 com itens recentes: The Verge AI, Ars Technica AI, Simon Willison, The Decoder, Import AI, Interconnects, Latent Space, Product Hunt AI, Wired AI, AWS Machine Learning, Apple ML Research, Tecnoblog, Canaltech. arXiv cs.AI entra com confiabilidade baixa (sinal de pesquisa, nunca manchete). Hacker News continua com teto de 1 item.

Exporta também `topicRules` (openai, anthropic, google, meta, microsoft, nvidia, chinese-models, agents, apple, amazon) e `lowSignalPatterns` (outage, "is down", vagas/hiring, webinar, sponsored, giveaway, "[fixed]", "status page").

### 6.2 `lib/briefing/dedupe.ts` (novo, puro)

```ts
normalizeUrl(url: string): string            // https, host sem www, sem utm_*/fbclid/ref, sem hash, sem barra final
titleTokens(title: string): Set<string>       // minúsculas, sem acentos, sem stopwords pt/en, tokens ≥ 3 chars
titleSimilarity(a: string, b: string): number // Jaccard dos tokens
type RecentMemory = { urls: Set<string>; titles: string[]; topicCounts: Map<string, number> };
isRepeat(candidate: { url: string; title: string }, memory: RecentMemory, threshold = 0.5): boolean
dedupeCandidates<T extends { url; title; reliability }>(items: T[]): T[]  // mantém o de maior reliability por URL/título
```

### 6.3 `lib/briefing/ranking.ts` (novo, puro)

```ts
type Candidate = BriefingSource & { category; summary; provider: 'rss'|'perplexity'|'x'; reliability: number; score: number };
scoreCandidate(c, memory: RecentMemory, now: Date): number
// reliability (0–99) + sinal por palavra inteira (\b) + frescor (48h: +20, decai até 7d) − repetição de tópico
// (count 1: −20, 2: −45, ≥3: excluído) − baixo sinal (−40) − desconto HN/arXiv/X (−15)
selectPool(candidates, memory, now, { minPool = 8, maxPool = 24 }): { pool: Candidate[]; window: '48h'|'7d'; notes: string[] }
// 1) filtra ≤48h (ou 7d se < minPool), 2) dedupeCandidates, 3) remove isRepeat, 4) ordena por score,
// 5) tetos: 2 por publisher (1 para HN e X), 3 para tópico openai, 24 no total
```

### 6.4 `lib/briefing/writer.ts` (novo)

```ts
type WriterInput = { dateLabel: string; pool: Candidate[]; recentTitles: string[]; recentTopics: string[] };
buildWriterMessages(input): { role; content }[]              // system + user (puro, testável)
const EditionDraftSchema = z.object({ headline, subject, intro, items: z.array({ candidate: int, kind, title, summary, whyItMatters }).min(4).max(7), takeaway, shareText })
validateEditionDraft(draft, pool): { ok: true; items: EditionItem[] } | { ok: false; errors: string[] }
// índices únicos e no intervalo; 1º item kind 'lead'; ≤1 'tool'; 1 por publisher; ≤2 por categoria; ≤2 tópico openai; tamanhos
writeEdition(input, { fetchImpl? }): Promise<{ mode: 'llm'; draft: EditionDraft; items: EditionItem[]; notes } | { mode: 'fallback'; ...; notes }>
// chama POST {NEWSLETTER_WRITER_BASE_URL||https://api.deepseek.com}/chat/completions com response_format json_object,
// temperature 0.6, max_tokens 2500, timeout 90s; 1 retry em erro de validação (anexa os erros); senão fallbackEdition(pool)
fallbackEdition(pool, dateLabel): EditionDraft + items  // top 5 respeitando os mesmos tetos; summary = snippet; intro/takeaway genéricos
composeDraftInput(edition, items, dateKey, pool): BriefingDraftInput  // slug daily-<dateKey>, brief em texto puro, tags, readingMinutes
```

Chave: `NEWSLETTER_WRITER_API_KEY || DEEPSEEK_API_KEY`; modelo: `NEWSLETTER_WRITER_MODEL || 'deepseek-chat'`. Sem chave → fallback direto, com nota.

### 6.5 `lib/briefing/agent.ts` (reescrito, fino)

Mantém `fetchFeed`, `fetchPerplexity` (query diária "o que aconteceu em IA nas últimas 24h", `search_recency_filter: 'day'`, sem filtro de domínio por tema) e `fetchXSignals` (48h, query ampla). Nós: `collect` (Promise.allSettled dos feeds + Perplexity + X), `rank` (memória de 14 dias via `posts.getRecentEditionMemory` + `selectPool`), `write` (`writeEdition` + `composeDraftInput`). Retorna `{ draft, run }` com `run.notes` incluindo janela usada, tamanho do pool, modo do redator e falhas de feed.

### 6.6 `lib/briefing/posts.ts` (estendido)

- `toPost`/`toRow` mapeiam `items`, `subject`, `share_text`.
- `getPublishedBriefingBySlug(slug)`; `getAdjacentEditions(publishedAt)` → `{ previous, next }` (slug + title).
- `getRecentEditionMemory({ days = 14 })` → `RecentMemory` a partir de `items[].source.url`, `sources[].url`, `items[].title`, títulos de posts e `topicRules`.
- `findEditionBySlug(slug)` (qualquer status) para idempotência.
- `unsubscribeSubscriber(email)` → status `unsubscribed`.
- `getActiveSubscribers()` sem limite implícito.

### 6.7 `lib/briefing/unsubscribe.ts` (novo)

HMAC-SHA256 (`node:crypto`) do email normalizado com `NEWSLETTER_UNSUBSCRIBE_SECRET || AGENT_CRON_SECRET`. `buildUnsubscribeUrl(email)` → `${site}/newsletter/sair?email=…&token=…`; `verifyUnsubscribeToken(email, token)` com comparação constante. Sem segredo configurado → `buildUnsubscribeUrl` devolve `null` e o email mostra "responda com SAIR".

### 6.8 `lib/briefing/email.ts` e `email-template.ts`

- `renderEditionEmail(post, { unsubscribeUrl })` e `renderEditionText(post, { unsubscribeUrl })`: cabeçalho "Thiagao Ai Daily" + data por extenso, manchete, intro, itens numerados (pill de categoria, título, resumo, "Por que importa", link "Ler na fonte"), bloco "Para testar hoje" quando houver item `tool`, "Take do dia", linha de compartilhar (WhatsApp, X, LinkedIn apontando para a página da edição com `utm_source=newsletter&utm_medium=email&utm_campaign=<slug>`), "Encaminhe para alguém que acompanha IA", rodapé com motivo do recebimento e link de descadastro. Posts sem `items` renderizam `brief` como hoje.
- `sendBriefingEmail`: assunto = `post.subject ?? post.title`; envia em lotes de 100 (`resend.batch.send`) até cobrir todos os ativos; cada mensagem com `headers: { 'List-Unsubscribe': '<url>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }` quando houver URL; log por destinatário como hoje; retorna `{ sent, attempted, delivered, failed }` agregados.

### 6.9 `lib/briefing/whatsapp.ts`

`renderBriefingWhatsApp` com itens: manchete, intro curta, lista numerada "título — por que importa", link da edição, grupo. Mantém o formato antigo para posts sem itens.

## 7. Regras editoriais do redator (prompt)

Sistema (pt-BR): editor do Thiagao Ai Daily para curiosos, criadores, devs e empreendedores. Tom direto, humano, opinião leve, sem hype, sem clickbait, sem emoji, sem "revolucionário/game changer". Escolher 5 a 7 candidatos (4 só se o pool for pequeno); o primeiro é a manchete (`lead`); um `tool` quando houver ferramenta que o leitor pode testar hoje; fontes diferentes; ≤2 por categoria; ≤2 sobre OpenAI/ChatGPT; evitar os assuntos da lista "já cobertos"; pular outage, vagas, webinar, patrocinado, listicle, opinião sem fato novo; preferir lançamento, pesquisa com uso prático, open source, mercado, regulação, ferramenta testável. Citar candidatos só pelo número; não inventar fatos além do trecho fornecido; se o trecho for curto, escrever menos em vez de supor. Tamanhos: headline ≤ 80, subject ≤ 70 (específico, sem "Edição de hoje"), intro 2–3 frases com o fio do dia, summary 2–3 frases, whyItMatters 1 frase para o leitor, takeaway 1–2 frases acionáveis, shareText ≤ 180 chars. Responder só JSON no esquema dado.

Usuário: data por extenso, lista numerada de candidatos (publisher, título, trecho ≤ 400 chars, data, categoria, provider), lista "já cobertos nos últimos 14 dias" (títulos) e "tópicos saturados".

## 8. Rotas e páginas

- `POST /api/agent/daily-digest`: autoriza por `AGENT_CRON_SECRET` (como hoje) ou sessão admin (`isAdminRequestAuthorized`). Fluxo: calcula `dateKey`; se já existe edição `daily-<dateKey>` e não é `force`, responde `skipped`; roda o agente; salva um único draft; publica; envia; responde `{ ok, campaign, writer: 'llm'|'fallback', post, email, notes }`. `dryRun` devolve o draft sem gravar. `force` grava com slug `daily-<dateKey>-<hhmm>` para não colidir.
- `POST /api/newsletter/unsubscribe`: aceita JSON ou `application/x-www-form-urlencoded` (`email`, `token`); verifica o token; marca `unsubscribed`; registra evento `unsubscribe` em `newsletter_events` (enum ampliado na migration 009); responde JSON ou, para form, redireciona 303 para `/newsletter/sair?done=1`. Um clique do provedor de email (`List-Unsubscribe-Post`) cai aqui.
- `GET /newsletter/sair`: página com confirmação (formulário HTML que faz POST na rota acima) e estado `done`.
- `GET /newsletter/[slug]`: página da edição (server component, `revalidate = 1800`): nav com marca, data, manchete, intro, itens, "Para testar hoje", take do dia, botões compartilhar (WhatsApp, X, LinkedIn, copiar link — client component pequeno), anterior/próxima, formulário de assinatura (`source: 'edition-page'`). `generateMetadata` com título, descrição (intro), OG `article`, canonical. 404 para slug sem post publicado.
- `GET /newsletter`: o destaque mostra data, manchete, intro e a lista de títulos dos itens com link para a edição; cards do arquivo e "Dias anteriores" viram links para `/newsletter/[slug]`; a caixa "Recorrência semanal" vira "O que vem em cada edição" (Manchete, Notícias do dia, Para testar hoje, Take do dia, Compartilhar). Texto do hero continua "Edição diária às 5 PM New York".
- Home: os cards "Novidades" linkam para `/newsletter/[slug]`.
- `app/sitemap.ts`: inclui as edições publicadas (até 60) com `lastModified = publishedAt`.
- Admin (`AdminNewsletterClient`): botões "Pré-visualizar edição de hoje" (`dryRun`) e "Gerar e enviar agora" (`force`), ambos chamando `/api/agent/daily-digest` com a sessão; o card de draft mostra assunto e quantidade de itens.

## 9. Agendamento e resiliência

- `daily-briefing.yml`: mantém cron 17h NY; adiciona `permissions: actions: write` e o passo `gautamkrishnar/keepalive-workflow@v2` com `use_api: true` para o GitHub não desativar o cron por inatividade. Timeout do curl: `--max-time 300`.
- Idempotência por slug do dia, não só por log de email. Rodadas duplicadas do cron (21h e 22h UTC) continuam seguras.
- Falhas parciais de feed nunca derrubam a execução (`allSettled`). Perplexity e X ausentes só geram nota.
- Writer: timeout, retry único, fallback estruturado. Sem assinantes ou sem `RESEND_API_KEY`: publica no site e responde `email.sent=false` com motivo (HTTP 200, não 500, porque a edição foi publicada).

## 10. Configuração (variáveis)

Já existentes: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEWSLETTER_FROM`, `NEWSLETTER_REPLY_TO`, `AGENT_CRON_SECRET`, `ADMIN_API_TOKEN`, `ADMIN_DASHBOARD_TOKEN`, `DEEPSEEK_API_KEY`, `PERPLEXITY_API_KEY` (opcional), `X_BEARER_TOKEN` (opcional), `NEXT_PUBLIC_SITE_URL`.

Novas (todas opcionais): `NEWSLETTER_WRITER_API_KEY`, `NEWSLETTER_WRITER_BASE_URL`, `NEWSLETTER_WRITER_MODEL`, `NEWSLETTER_UNSUBSCRIBE_SECRET`.

`getBriefingConfigStatus()` passa a reportar `writer` (chave presente) e `unsubscribe` (segredo presente).

## 11. Erros

- JSON inválido do LLM → retry com erros → fallback. Nunca lança.
- Feed com XML inválido → item ignorado.
- Supabase indisponível → `saveAgentDrafts` lança; a rota responde 500 com a mensagem (comportamento atual), sem enviar email.
- Token de descadastro inválido → 400 JSON ou página com mensagem; nunca altera status.

## 12. Testes (`node:test`, fetch simulado)

- `tests/dedupe.test.mts`: normalizeUrl (utm, www, hash, barra), titleSimilarity, isRepeat contra memória, dedupeCandidates mantém maior reliability.
- `tests/ranking.test.mts`: janela 48h→7d, tetos por publisher/categoria/tópico, penalidade de tópico repetido, exclusão de baixo sinal, palavra inteira ("ai" não casa "mais").
- `tests/writer.test.mts`: mensagens contêm candidatos numerados e lista de evitados; validação rejeita índice repetido, fora do intervalo, >2 por categoria, >2 OpenAI, mesmo publisher; `writeEdition` com fetch simulado válido → `llm`; inválido duas vezes → `fallback`; sem chave → `fallback`; `composeDraftInput` gera slug/brief/tags/minutos.
- `tests/unsubscribe.test.mts`: token ida e volta, token errado, segredo ausente.
- `tests/email-template.test.mts`: HTML e texto contêm itens, link da edição com UTM, descadastro; post sem itens renderiza `brief`.
- `tests/whatsapp.test.mts`: formato com itens.

## 13. Documentação

`docs/newsletter-briefing.md` reescrito para o fluxo novo (pipeline, variáveis, migration 009, como testar com `LOCAL_DEMO_DB=1`, como reativar o cron, como rodar pelo painel). README: seção Newsletter aponta para ele.

## 14. Passos manuais do usuário (não automatizáveis daqui)

1. Restaurar o projeto Supabase da newsletter (hoje aparece pausado) e conferir no Dokploy `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
2. Rodar `supabase/migrations/009_daily_edition_items.sql` no SQL editor.
3. Mesclar o PR (o deploy sai pelo workflow "Build & Deploy").
4. Reativar o cron: `gh workflow enable daily-briefing.yml` (ou pela aba Actions). O keepalive evita nova desativação.
5. Opcional: definir `NEWSLETTER_UNSUBSCRIBE_SECRET` no Dokploy (sem ele, usa `AGENT_CRON_SECRET`).
