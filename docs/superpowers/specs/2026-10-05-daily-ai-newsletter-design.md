# Thiagao Ai Daily: edição diária de notícias de IA

Data: 2026-10-05. Status: aprovado pelo usuário (padrões: DeepSeek como redator, envio às 17h New York, publicação automática). Revisado após primeira revisão de spec.

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

- Uma edição por dia (chave `daily-YYYY-MM-DD` no fuso America/New_York), com 5 a 7 notícias, cada uma de um site diferente (hostname da fonte), no máximo 2 por categoria, no máximo 2 sobre OpenAI/ChatGPT. Com pool pequeno (menos de 8 candidatos) aceita 4; com menos de 3 notícias não publica.
- Nenhum item cuja URL normalizada ou cujo título (similaridade ≥ 0,6) já apareceu em edição publicada nos últimos 14 dias.
- Só entram itens com até 48 horas; se, depois de dedup e remoção de repetidos, sobrarem menos de 8 candidatos, a janela abre para 7 dias.
- Se o redator (LLM) falhar, a edição sai mesmo assim em modo fallback estruturado, e a execução registra `writer: "fallback"`.
- Email com descadastro em um clique (RFC 8058), cabeçalhos `List-Unsubscribe`, botões de compartilhar e link para a página da edição.
- `npm run check` (lint, testes, build) passa.

## 3. Fora de escopo

- Programa de indicação/referral, tracking de abertura por pixel próprio, A/B de assunto.
- Trocar LangGraph, Resend ou Supabase.
- Mudar o horário de envio (continua 17h New York; é uma linha no cron).
- Restaurar o projeto Supabase e configurar variáveis no Dokploy: ações manuais do usuário, listadas na seção 14.

## 4. Arquitetura do pipeline

```
collect  → dedupe   → rank      → write          → persist/publish → send
RSS      normaliza   score       LLM (DeepSeek)   daily_digest_posts   Resend em lotes de 100
Perplex. URL/título  frescor     JSON validado    slug daily-<data>    + List-Unsubscribe
X        vs 14 dias  memória     ou fallback      publicado na hora    + log por email
```

Tudo continua dentro de `runDailyBriefingAgent()` (LangGraph com três nós: `collect`, `rank`, `write`). O nó `write` substitui `synthesize`. A rota `daily-digest` passa a ser idempotente por edição do dia e reenvia uma edição publicada que ainda não foi enviada.

Convenção de código que esta spec exige: os módulos testados por `node --experimental-strip-types --test` (`sources`, `dedupe`, `ranking`, `writer`, `memory`, `unsubscribe`, `edition`, `email-template`, `whatsapp`, `config`) usam imports relativos **com extensão `.ts`** (`./config.ts`) e nunca importam `./posts`, `./supabase` nem o alias `@/` em import de valor (só em `import type`). É o padrão já usado por `lib/typesafe/decision-mediation.ts`.

## 5. Modelo de dados

Migration `supabase/migrations/009_daily_edition_items.sql`:

```sql
alter table public.daily_digest_posts
  add column if not exists items jsonb not null default '[]'::jsonb,
  add column if not exists subject text,
  add column if not exists share_text text;

alter table public.newsletter_events drop constraint if exists newsletter_events_event_type_check;
alter table public.newsletter_events
  add constraint newsletter_events_event_type_check check (
    event_type in ('page_view', 'cta_click', 'subscribe_success', 'subscribe_blocked', 'chat_question', 'admin_login', 'unsubscribe')
  );
```

`lib/dev/local-db.ts`: `defaults('daily_digest_posts')` passa a incluir `status: 'draft'`, `items: []`, `subject: null`, `share_text: null`, `published_at: null`, `updated_at`.

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
// BriefingDraftInput herda os três campos. NewsletterEventInput.eventType ganha 'unsubscribe'.
```

Os campos são obrigatórios no tipo, então os literais em `lib/briefing/fallback.ts` (3 posts) e em `app/api/admin/test-newsletter/route.ts` (`getGpt55TestPost`) recebem `items: [], subject: null, shareText: null`. Posts antigos no banco continuam válidos: `toPost` devolve `items = []` e os renderizadores caem para `brief`.

## 6. Unidades e interfaces

### 6.1 `lib/briefing/sources.ts` (novo, puro)

Lista de feeds `{ name, url, category, reliability, general? }`. Remove os mortos (Anthropic, Meta AI, Microsoft AI em blogs.microsoft.com, Mistral em /news/rss.xml, LangChain, VentureBeat). Corrige Mistral para `https://mistral.ai/rss.xml` e Microsoft para `https://news.microsoft.com/source/topics/ai/feed/`. Adiciona, todos verificados em 2026-10-05 com itens recentes: The Verge AI, Ars Technica AI, Simon Willison, The Decoder, Import AI, Interconnects, Latent Space, Product Hunt AI, Wired AI, AWS Machine Learning, Apple ML Research, Tecnoblog, Canaltech. arXiv cs.AI entra com confiabilidade baixa (sinal de pesquisa, nunca manchete). Hacker News continua com teto de 1 item. Feeds de tecnologia geral (GitHub, Vercel, Cloudflare, Supabase, n8n, Tecnoblog, Canaltech) levam `general: true`: só entram itens que passam em `looksLikeAi(text)`.

Exporta também: `topicRules` (openai, anthropic, google, meta, microsoft, apple, nvidia, chinese-models, xai, agents; regex com `\b`), `matchTopics(text)`, `looksLikeAi(text)` (regex pt/en com `\b`, de modo que "ai" não case "mais"), `isLowSignal(text)` (outage, "is down", hiring, webinar, sponsored, giveaway, promoção, "[fixed]"), `guessCategory(text)` (para Perplexity e X, que não têm feed de origem).

### 6.2 `lib/briefing/dedupe.ts` (novo, puro)

```ts
normalizeUrl(url: string): string            // https, host sem www, sem utm_*/fbclid/gclid/ref, sem hash, sem barra final, query ordenada
titleTokens(title: string): Set<string>       // minúsculas, sem acentos, sem stopwords pt/en, tokens ≥ 3 chars
titleSimilarity(a: string, b: string): number // coeficiente de sobreposição |A∩B|/min(|A|,|B|); conjuntos com < 3 tokens só contam se idênticos
type RecentMemory = { urls: Set<string>; titles: string[]; topicCounts: Map<string, number> };
emptyMemory(): RecentMemory
isRepeat(candidate: { url; title }, memory, threshold = 0.6): boolean
dedupeCandidates<T extends { url; title; reliability }>(items: T[], threshold = 0.6): T[]  // mantém o de maior reliability por URL/título
```

### 6.3 `lib/briefing/ranking.ts` (novo, puro)

```ts
type Candidate = BriefingSource & { category; summary; provider: 'rss'|'perplexity'|'x'; reliability: number; score: number; general?: boolean };
ageHours(candidate, now): number   // sem data: Perplexity 36h (passa na janela de 48h, sem bônus máximo), demais 72h; data inválida: 168h
sourceKey(candidate): string       // hostname da URL (sem www); é a chave dos tetos "por fonte"
scoreCandidate(c, memory, now): number
// reliability (0–99) + até 21 pontos de sinal (7 por palavra inteira de SIGNAL_PATTERN: launch, release, open source, model, agent, benchmark, funding, regulation, api, lança, anuncia...)
// + frescor (≤24h: +20, ≤48h: +14, ≤7d: decai até 0) − tópico repetido nas últimas 5 edições (1: −12, 2: −30, 3: −50, ≥4: −70)
// − baixo sinal (−40) − desconto X/HN/arXiv (−15). Resultado 0–99; 0 exclui.
selectPool(candidates, memory, now, { minPool = 8, maxPool = 24 }): { pool: Candidate[]; window: '48h'|'7d'; notes: string[] }
// para a janela de 48h: filtra general sem IA → filtra idade → dedupeCandidates → remove isRepeat → conta;
// se sobrar menos que minPool, repete com 7 dias. Depois: score, ordena, tetos: 2 por sourceKey (1 para Hacker News e X), 3 para o tópico openai, 24 no total.
```

Confiabilidade e categoria de itens sem feed: Perplexity `reliability 74`, `publisher = hostname`, `category = guessCategory`; X `reliability 55`, só posts com engajamento ≥ 50, `category = guessCategory`.

### 6.4 `lib/briefing/writer.ts` (novo)

```ts
type WriterInput = { dateLabel: string; dateKey: string; pool: Candidate[]; recentTitles: string[]; recentTopics: string[] };
buildWriterMessages(input): { role; content }[]              // system + user (puro, testável)
EditionDraftSchema = z.object({ headline ≤90, subject ≤80, intro, items: z.array({ candidate: int ≥1, kind, title ≤110, summary, whyItMatters }).min(1).max(7), takeaway, shareText ≤200 })
parseEditionDraft(content): { ok, draft } | { ok: false, errors }   // tolera cerca ```json
validateEditionDraft(draft, pool): { ok: true; items: EditionItem[]; chosen: Candidate[] } | { ok: false; errors: string[] }
// mínimo de itens: 5 se pool ≥ 8, senão min(4, pool); índices únicos e no intervalo; 1º item kind 'lead' e só ele; ≤1 'tool';
// sourceKey diferente por item; ≤2 por categoria; ≤2 tópico openai
fallbackEdition(input): Edition                                 // até 5 itens respeitando os mesmos tetos; summary = trecho da fonte; intro/takeaway fixos e honestos
composeDraftInput(edition, input, mode): BriefingDraftInput    // slug daily-<dateKey>, brief em texto puro, tags = categorias + 'Daily' (+ 'Auto' no fallback), readingMinutes
writeEdition(input): Promise<{ mode: 'llm'|'fallback'; edition; notes }>
// POST {NEWSLETTER_WRITER_BASE_URL||https://api.deepseek.com}/chat/completions, response_format json_object, temperature 0.6, max_tokens 2500, timeout 90s;
// até 2 tentativas (a 2ª recebe os erros de validação); 401/403 interrompe; senão fallbackEdition. Sem chave ou pool vazio → fallback direto.
```

Chave: `NEWSLETTER_WRITER_API_KEY || DEEPSEEK_API_KEY`; modelo: `NEWSLETTER_WRITER_MODEL || 'deepseek-chat'`.

### 6.5 `lib/briefing/agent.ts` (reescrito, fino)

Mantém `fetchFeed` (10 itens por feed, `reliability` e `general` do catálogo), `fetchPerplexity` (pergunta "o que aconteceu em IA nas últimas 24 horas", `search_recency_filter: 'day'`, sem filtro de domínio) e `fetchXSignals` (48h, query ampla). Nós: `collect` (Promise.allSettled dos feeds + Perplexity + X), `rank` (memória via `posts.getRecentEditionMemory` + `selectPool`), `write` (`writeEdition` + `composeDraftInput`; com menos de 3 itens devolve `draft: null`). `runDailyBriefingAgent({ now?, slug? })` retorna `{ draft | null, writer: 'llm'|'fallback', run }` com `run.notes` incluindo janela usada, tamanho do pool, modo do redator e falhas de feed. Exporta `getNewYorkDateKey(now)` e `getNewYorkDateLabel(now)`.

### 6.6 `lib/briefing/memory.ts` (novo, puro) e `lib/briefing/posts.ts` (estendido)

`memory.ts`: `buildRecentMemory(posts: BriefingPost[], { topicEditions = 5 }): EditionMemory` onde `EditionMemory = RecentMemory & { recentTitles: string[]; recentTopics: string[] }`. URLs e títulos vêm de todos os posts recebidos (itens e `sources`); `topicCounts` conta, por tópico, em quantas das `topicEditions` edições mais recentes ele apareceu; `recentTopics` lista os tópicos com contagem ≥ 2 como "OpenAI/ChatGPT (3 de 5 edições)".

`posts.ts`:

- `toPost`/`toRow` mapeiam `items`, `subject`, `share_text`.
- `getPublishedBriefingBySlug(slug)`: Supabase nulo **ou com erro** → procura em `fallbackBriefings` (mesmo comportamento de `getPublishedBriefings`, para os links da home e do arquivo nunca quebrarem).
- `getAdjacentEditions(post)` → `{ previous, next }` (slug + title), com fallback ordenando `fallbackBriefings`.
- `findEditionsForDate(dateKey)` → posts (qualquer status) cujo slug é `daily-<dateKey>` ou começa com `daily-<dateKey>-`; `null` sem Supabase.
- `getRecentEditionMemory({ days = 14 })` → `EditionMemory & { note }` a partir dos publicados nos últimos `days` dias (até 60), via `buildRecentMemory`.
- `unsubscribeSubscriber(email)` → status `unsubscribed`; `{ updated }`.
- `getActiveSubscribers()` pagina com `.range()` de 1000 em 1000 (PostgREST limita a 1000 por chamada).

### 6.7 `lib/briefing/unsubscribe.ts` (novo)

HMAC-SHA256 (`node:crypto`) do email normalizado com `NEWSLETTER_UNSUBSCRIBE_SECRET || AGENT_CRON_SECRET`; comparação com `timingSafeEqual`.

```ts
unsubscribeToken(email): string | null                    // null sem segredo
verifyUnsubscribeToken(email, token): boolean
buildUnsubscribeUrls(email): { pageUrl: string; apiUrl: string } | null
// pageUrl = ${site}/newsletter/sair?email=…&token=…         (link humano no rodapé)
// apiUrl  = ${site}/api/newsletter/unsubscribe?email=…&token=…  (cabeçalho List-Unsubscribe; o provedor faz POST aqui com corpo "List-Unsubscribe=One-Click")
```

Sem segredo configurado → `null`; o email mostra "responda com SAIR".

### 6.8 `lib/briefing/edition.ts`, `email-template.ts` e `email.ts`

- `edition.ts` (puro): `editionPath(post)`, `editionUrl(post, utm?)`, `shareLinks(post, medium)` (WhatsApp, X, LinkedIn, url), `formatEditionDate(iso, 'full'|'short')`.
- `email-template.ts`: `renderBriefingEmail/renderBriefingText` são **substituídos** por `renderEditionEmail(post, { unsubscribeUrl })` e `renderEditionText(post, { unsubscribeUrl })` (o único consumidor é `email.ts`). Layout: cabeçalho "Thiagao Ai Daily" + data por extenso, manchete, intro, itens numerados (pill de categoria, título, resumo, "Por que importa", link "Ler na fonte"), rótulo "Para testar hoje" no item `tool`, "Take do dia", linha de compartilhar (WhatsApp, X, LinkedIn apontando para a página da edição com `utm_source=share&utm_medium=email`), botão "Ler no site" (`utm_source=newsletter&utm_medium=email&utm_campaign=<slug>`), "Encaminhe para alguém que acompanha IA", rodapé com motivo do recebimento e link de descadastro (`pageUrl`) ou "responda com SAIR". Posts sem `items` renderizam `brief` como hoje. `escapeHtml` é exportado.
- `email.ts` `sendBriefingEmail(post, { campaign })`: assunto = `post.subject ?? post.title`; renderiza HTML e texto **uma vez** com o placeholder `%%UNSUBSCRIBE_URL%%` e substitui por destinatário; envia em lotes de 100 até cobrir todos os ativos; cada mensagem leva `headers: { 'List-Unsubscribe': '<apiUrl>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }` quando houver segredo; log por destinatário como hoje. Retorno: `{ sent, skipped, attempted, delivered, failed, reason? }` com `skipped: true` quando não há chave Resend ou assinantes (motivo benigno) e `skipped: false` quando o Resend falhou.

### 6.9 `lib/briefing/whatsapp.ts`

`renderBriefingWhatsApp` com itens: cabeçalho "*Thiagao Ai Daily*" + data curta, manchete, intro, lista numerada "título — por que importa", take, link da edição (`utm_source=whatsapp`), grupo. Mantém o formato antigo para posts sem itens (trocando `/newslatter` pelo link da edição).

## 7. Regras editoriais do redator (prompt)

Sistema (pt-BR): editor do Thiagao Ai Daily para curiosos, criadores, devs e empreendedores. Tom direto, humano, opinião leve, sem hype, sem clickbait, sem emoji, sem "revolucionário/game changer". Escolher 5 a 7 candidatos (4 só se o pool for pequeno); o primeiro é a manchete (`lead`); um `tool` quando houver ferramenta que o leitor pode testar hoje; fontes diferentes; ≤2 por categoria; ≤2 sobre OpenAI/ChatGPT; variar temas; evitar os assuntos da lista "já cobertos" e os "tópicos saturados"; pular outage, vagas, webinar, patrocinado, listicle, opinião sem fato novo; preferir lançamento, pesquisa com uso prático, open source, mercado, regulação, ferramenta testável, Brasil. Citar candidatos só pelo número; não inventar fatos além do trecho fornecido; se o trecho for curto, escrever menos. Tamanhos: headline ≤ 80, subject ≤ 70 (específico, sem "Edição de hoje"), intro 2–3 frases com o fio do dia, summary 2–3 frases, whyItMatters 1 frase para o leitor, takeaway 1–2 frases acionáveis, shareText ≤ 180 chars. Responder só JSON no esquema dado.

Usuário: data por extenso, lista numerada de candidatos (publisher, categoria, data, provider, título, trecho ≤ 400 chars), lista "já cobertos nos últimos 14 dias" (títulos) e "tópicos saturados".

## 8. Rotas e páginas

- `POST /api/agent/daily-digest` (`maxDuration = 300`): autoriza por `AGENT_CRON_SECRET` (como hoje, com `safeEqual`) ou sessão admin (`isAdminRequestAuthorized`, que exige mesma origem para cookie). Corpo `{ force?, dryRun? }`. Fluxo:
  1. `dateKey` de New York; `campaign = daily-<dateKey>`.
  2. `dryRun`: roda o agente (inclusive o redator, que custa uma chamada ao DeepSeek) e devolve `{ draft, writer, run }` sem gravar.
  3. Sem `force`: `findEditionsForDate(dateKey)`. Se existe edição publicada e `hasSentCampaign(seu slug)` é falso → reenvia essa edição (`sendBriefingEmail`) e responde `{ ok, resent: true }`. Se existe e já foi enviada → `{ skipped: true }`. Se não existe → segue.
  4. `force`: slug `daily-<dateKey>-<hhmm>`; cria e envia uma edição nova para todos os assinantes (entrega dupla é intencional e documentada; o painel pede confirmação).
  5. Roda o agente; sem draft → 500 com `notes`. Salva um único draft, publica, envia. Status 200 quando publicou (mesmo com `email.skipped`), 502 quando o Resend falhou (`sent: false, skipped: false`), para o cron ficar vermelho.
- `POST /api/newsletter/unsubscribe`: lê `email` e `token` do corpo (JSON ou form) **ou da query string** (one-click RFC 8058 manda só `List-Unsubscribe=One-Click` no corpo). Não usa `isSameOriginRequest` (a chamada vem do provedor de email). Verifica o token; marca `unsubscribed`; registra evento `unsubscribe`; responde JSON, ou redireciona 303 para `/newsletter/sair?state=done|invalid` quando o `Accept` pede HTML (formulário).
- `GET /newsletter/sair`: página com confirmação (formulário HTML que faz POST na rota acima) e estados `done`/`invalid`. `robots: noindex`.
- `GET /newsletter/[slug]`: página da edição (server component, `revalidate = 1800`): nav com marca, data, manchete, intro, itens, "Para testar hoje", take do dia, botões compartilhar (WhatsApp, X, LinkedIn, copiar link — client component pequeno), anterior/próxima, formulário de assinatura (`source: 'edition-page'`). `generateMetadata` com título, descrição (dek), OG `article`, canonical. 404 só quando nem Supabase nem `fallbackBriefings` têm o slug.
- `GET /newsletter`: o arquivo é `app/briefing/page.tsx` (`app/newsletter/page.tsx` só reexporta; `/briefing` é alias com canonical `/newsletter`). O destaque mostra data, manchete, intro e a lista de títulos dos itens com link para a edição; cards do arquivo e "Dias anteriores" viram links para `/newsletter/[slug]`; a caixa "Recorrência semanal" vira "O que vem em cada edição" (Manchete, Notícias do dia, Para testar hoje, Take do dia, Compartilhar). O hero continua "Edição diária às 5 PM New York".
- Home (`app/components/home/HomePage.tsx`): os cards "Novidades" linkam para `/newsletter/[slug]` (única alteração nesse arquivo).
- `app/sitemap.ts`: inclui as edições publicadas (até 60) com `lastModified = publishedAt`.
- Admin (`AdminNewsletterClient`): botões "Pré-visualizar edição de hoje" (`dryRun`, avisa que usa o redator) e "Gerar, publicar e enviar agora" (`force`, com `confirm()` avisando que envia para todos); o card de draft mostra assunto e quantidade de itens.

## 9. Agendamento e resiliência

- `daily-briefing.yml`: mantém cron 17h NY; `permissions: { contents: read, actions: write }`; input `force` explícito (default `false`) em vez de implicar `force` em todo `workflow_dispatch`; curl com `--max-time 300`; último passo `gautamkrishnar/keepalive-workflow@v2` com `use_api: true` e `if: always()` para o GitHub não desativar o cron por inatividade.
- Idempotência por edição do dia (slug `daily-<data>` ou `daily-<data>-*`) e reenvio quando a edição existe mas o email não saiu. Rodadas duplicadas do cron (21h e 22h UTC) continuam seguras.
- Falhas parciais de feed nunca derrubam a execução (`allSettled`). Perplexity e X ausentes só geram nota.
- Writer: timeout, retry único, fallback estruturado. Sem assinantes ou sem `RESEND_API_KEY`: publica no site e responde `email.skipped=true` (HTTP 200).

## 10. Configuração (variáveis)

Já existentes: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEWSLETTER_FROM`, `NEWSLETTER_REPLY_TO`, `AGENT_CRON_SECRET`, `ADMIN_API_TOKEN`, `ADMIN_DASHBOARD_TOKEN`, `DEEPSEEK_API_KEY`, `PERPLEXITY_API_KEY` (opcional), `X_BEARER_TOKEN` (opcional), `NEXT_PUBLIC_SITE_URL`.

Novas (todas opcionais): `NEWSLETTER_WRITER_API_KEY`, `NEWSLETTER_WRITER_BASE_URL`, `NEWSLETTER_WRITER_MODEL`, `NEWSLETTER_UNSUBSCRIBE_SECRET`.

`getBriefingConfigStatus()` passa a reportar `writerApiKey` e `unsubscribeSecret` nos checks e `ready.writer`, `ready.unsubscribe`.

## 11. Erros

- JSON inválido do LLM → retry com erros → fallback. Nunca lança.
- Feed com XML inválido → item ignorado; feed fora → nota.
- Supabase indisponível → `saveAgentDrafts` lança; a rota responde 500 com a mensagem (comportamento atual), sem enviar email.
- Token de descadastro inválido → 400 JSON ou redirect para `state=invalid`; nunca altera status.
- Evento `unsubscribe` só grava depois da migration 009 (antes, `logNewsletterEvent` engole o erro do check, como hoje).

## 12. Testes (`node:test`, fetch simulado)

- `tests/sources.test.mts`: catálogo sem URL duplicada; `matchTopics` por palavra inteira; `looksLikeAi` ("ai" não casa "mais"); `isLowSignal`; `guessCategory`.
- `tests/dedupe.test.mts`: `normalizeUrl` (utm, www, hash, barra, ordem da query), `titleTokens`, `titleSimilarity`, `isRepeat`, `dedupeCandidates` mantém maior reliability.
- `tests/ranking.test.mts`: `ageHours` sem data/inválida; janela 48h→7d medida após dedup; tetos por fonte/openai; penalidade de tópico repetido; baixo sinal; `general` sem IA excluído.
- `tests/writer.test.mts`: mensagens contêm candidatos numerados e lista de evitados; `parseEditionDraft` com cerca e lixo; validação rejeita índice repetido, fora do intervalo, >2 OpenAI, mesma fonte, lead fora do 1º, menos itens que o mínimo; `writeEdition` com fetch simulado válido → `llm`; inválido duas vezes → `fallback`; sem chave → `fallback` sem chamar fetch; `composeDraftInput` gera slug/brief/tags/minutos.
- `tests/edition-memory.test.mts`: `buildRecentMemory` coleta URLs normalizadas, títulos e contagem por edição.
- `tests/unsubscribe.test.mts`: token ida e volta, token errado, segredo ausente, URLs de página e API.
- `tests/email-template.test.mts`: HTML e texto contêm itens, link da edição com UTM, descadastro escapado; post sem itens renderiza `brief`; `shareText` escapado.
- `tests/whatsapp.test.mts`: formato com itens e link da edição.

## 13. Documentação

`docs/newsletter-briefing.md` reescrito para o fluxo novo (pipeline, variáveis, migration 009, como testar com `LOCAL_DEMO_DB=1`, como reativar o cron, como rodar pelo painel, descadastro). README: seção Newsletter aponta para ele.

## 14. Passos manuais do usuário (não automatizáveis daqui)

1. Restaurar o projeto Supabase da newsletter (hoje aparece pausado) e conferir no Dokploy `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
2. Rodar `supabase/migrations/009_daily_edition_items.sql` no SQL editor.
3. Mesclar o PR (o deploy sai pelo workflow "Build & Deploy").
4. Reativar o cron: `gh workflow enable daily-briefing.yml` (ou pela aba Actions). O keepalive evita nova desativação.
5. Opcional: definir `NEWSLETTER_UNSUBSCRIBE_SECRET` no Dokploy (sem ele, usa `AGENT_CRON_SECRET`).
