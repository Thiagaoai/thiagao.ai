# SDD — Design do sistema (Farmz3D + Reviews Machine + Missed-Call Text-Back)

Stack existente do repositório, sem dependências novas: Next.js 16 (App Router) + TypeScript strict + zod 4 + Supabase (`@supabase/supabase-js`) + Resend. Deploy atual: Docker/Dokploy (`output: 'standalone'`).

## 1. Mapa de arquivos

```
app/
  farmz3d/page.tsx                     Landing Farmz3D (server, revalida a cada 1h)
  farmz3d/OrderForm.tsx                Formulário de pedido (client)
  farmz3d/Motion.tsx                   Motion/3D: ornamento sendo impresso camada a camada (CSS 3D + motion),
                                       cards com tilt 3D, reveal no scroll; respeita prefers-reduced-motion
  reviews-machine/page.tsx             Página de venda DockPlus
  r/[slug]/page.tsx                    Página de avaliação por cliente (server)
  r/[slug]/ReviewFunnel.tsx            Estrelas + feedback (client)
  api/farmz3d/orders/route.ts          POST pedido
  api/dockplus/reviews/route.ts        POST avaliação/feedback
  api/dockplus/missed-call/voice/route.ts   Webhook Twilio (chamada recebida)
  api/dockplus/missed-call/status/route.ts  Webhook Twilio (resultado do Dial)
lib/
  shared/rate-limit.ts                 Rate limit em memória + IP
  farmz3d/catalog.ts                   Produtos e coleções (tipado)
  farmz3d/season.ts                    Datas dos feriados, campanha ativa, prazos
  farmz3d/orders.ts                    Schema do pedido, persistência, email
  dockplus/review-clients.ts           Clientes da Reviews Machine
  dockplus/reviews.ts                  Schema, persistência, email
  dockplus/twilio.ts                   Assinatura, TwiML, envio de SMS (REST)
  dockplus/missed-call.ts              Rotas (env JSON) e log
supabase/migrations/005_farmz3d_dockplus.sql
tests/*.test.mts                       node:test (sem dependência nova)
```

## 2. Modelo de dados (Supabase / Postgres)

`farmz3d_orders`
| coluna | tipo | nota |
|---|---|---|
| id | uuid pk | |
| order_number | text unique | `FZ-YYMMDD-XXXX` (gerado no servidor) |
| status | text | `new, confirmed, printing, shipped, picked_up, cancelled` |
| product_id / product_name | text | snapshot do catálogo |
| unit_price_cents / quantity / estimated_total_cents | int | preço de referência, não cobrança |
| personalization, notes | text | |
| needed_by | date null | |
| fulfillment | text | `pickup` ou `shipping` |
| shipping_zip | text null | obrigatório se `shipping` |
| customer_name / customer_email / customer_phone | text | |
| campaign | text | campanha ativa no momento do pedido |
| created_at / updated_at | timestamptz | |

`dockplus_review_events`: `id, client_slug, rating (1–5), outcome ('google_redirect' | 'private_feedback'), name, contact, message, created_at`.

`dockplus_missed_calls`: `id, twilio_number, caller, dial_status, sms_sent, sms_sid, error, created_at`.

RLS ligado em todas, sem policies: só a `service_role` (servidor) lê/escreve. O navegador nunca fala direto com o Supabase.

## 3. Contratos de API

### `POST /api/farmz3d/orders`
Body (JSON):
```json
{ "productId": "christmas-name-ornament", "quantity": 2, "personalization": "Emma & Noah",
  "neededBy": "2026-12-15", "fulfillment": "shipping", "shippingZip": "02601",
  "name": "Jane Doe", "email": "jane@example.com", "phone": "+15085550100",
  "notes": "", "company": "", "startedAt": 1790000000000 }
```
Respostas:
- `200 { ok: true, orderNumber, stored, emailed }`
- `400 { ok: false, message }` (validação)
- `429` (rate limit), `503` (nenhum destino configurado ou ambos falharam)
- Honeypot/rápido demais → `200 { ok: true, orderNumber: null }` (não revela ao bot)

### `POST /api/dockplus/reviews`
Body: `{ clientSlug, rating, name?, contact?, message? }`
- `rating >= 4` → grava `google_redirect`; resposta `{ ok, redirectUrl }` (null na demo).
- `rating <= 3` → exige `message`; grava `private_feedback`; manda email para `notifyEmail` do cliente ou `DOCKPLUS_ALERT_EMAIL`.
- `404` se o slug não existe.

### Twilio
1. Número Twilio → *A call comes in* → Webhook `POST https://<site>/api/dockplus/missed-call/voice`
2. `voice` valida `X-Twilio-Signature`, acha a rota pelo campo `To` e responde:
   `<Response><Dial timeout="20" action="<site>/api/dockplus/missed-call/status" method="POST">+1DONO</Dial></Response>`
3. `status` valida assinatura; se `DialCallStatus ∈ {no-answer, busy, failed, canceled}` envia SMS
   (`POST https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json`, Basic Auth) de `To` para `From`,
   grava em `dockplus_missed_calls` e responde `<Say>` + `<Hangup/>`.

Assinatura: HMAC-SHA1 (chave = Auth Token) sobre `URL completa + parâmetros POST ordenados por nome (nome+valor concatenados)`, em base64, comparada em tempo constante. A URL usada é `TWILIO_WEBHOOK_BASE_URL` + caminho, porque atrás do proxy do Dokploy o `request.url` interno não é a URL pública que o Twilio assinou.

## 4. Variáveis de ambiente

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | já existem no projeto |
| `RESEND_API_KEY` | já existe |
| `FARMZ3D_ORDERS_EMAIL` | quem recebe os pedidos (email da Bruna) |
| `FARMZ3D_FROM_EMAIL` | remetente; padrão = `NEWSLETTER_FROM` do projeto |
| `NEXT_PUBLIC_FARMZ3D_INSTAGRAM` | opcional, @ da Farmz3D (mostra link) |
| `DOCKPLUS_ALERT_EMAIL` | fallback de alertas de feedback negativo |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Missed-Call |
| `TWILIO_WEBHOOK_BASE_URL` | ex.: `https://www.thiagao.io` (sem barra no fim) |
| `MISSED_CALL_ROUTES` | JSON: `[{"twilioNumber":"+1...","forwardTo":"+1...","businessName":"...","smsText":"..."}]` |

## 5. Segurança
- zod em todo input; tamanhos máximos em todos os campos de texto.
- Honeypot + tempo mínimo de preenchimento + rate limit por IP (em memória; reinicia no deploy — aceitável para v1, igual ao newsletter).
- Webhooks Twilio rejeitam (403) sem assinatura válida; sem `TWILIO_AUTH_TOKEN` respondem 503 (nunca aceitam sem validar).
- Service role só no servidor. CSP existente mantida (formulários usam `fetch` para `'self'`).
- Escape de HTML em todo conteúdo de usuário nos emails.

## 6. Limites conhecidos (verdade, não bug)
- **SMS nos EUA:** número local (10DLC) exige registro A2P 10DLC no Twilio antes de enviar para clientes; sem isso as mensagens são bloqueadas pela operadora. Número toll-free exige "toll-free verification".
- Rate limit em memória não é compartilhado entre várias instâncias.
- Página de review do Google: o link de cada cliente vem do Google Business Profile ("Ask for reviews" / "Get more reviews"). O sistema não gera esse link.

## 7. Testes
- `npm test` → `node --test` em `tests/`: datas de feriado (Thanksgiving = 4ª quinta), campanha ativa por data, prazo de pedido, assinatura Twilio (vetor conhecido + parâmetros alterados), TwiML escapado, schema de pedido.
- Verificação manual/automática: build de produção, servidor local, `curl` nas APIs e Playwright nas páginas (mobile e desktop).

## 8. Decisões tipadas + Jev (v2)

**Registro de decisões** (`lib/decisions/`): cada preço, frete, prazo e canal é um `Decision` validado por zod na carga (opção recomendada precisa existir, valor precisa bater com a unidade, ids únicos). Cada decisão tem evidência de mercado com URL de fonte (pesquisa de set/2026) e custo estimado.
- O site lê a opção **aprovada** (tabela `business_decisions`) ou, se pendente, a **recomendada**: `/farmz3d` (preços, frete, prazos) e `/reviews-machine` (planos). Aprovar chama `revalidatePath` → muda na hora.
- O preço cobrado é sempre calculado no servidor (`getLiveCatalog`); valores enviados pelo navegador são ignorados.

**Jev / TypeSafe** (`lib/typesafe/`), seguindo a documentação oficial (docs.typesafe.ai):
- Cliente HTTP próprio para `POST /v1/systemone`, resposta validada por zod, confere que cada resposta tem o tipo da pergunta e que a Choice é uma das opções, retry com backoff em 429/529, timeout.
- **O Jev não faz conta** (limitação documentada do jev-1.13): preços e margens ficam no código; para o Jev vão só texto e um balde nomeado ("high/medium/low margin").
- **Mediação:** 1 Choice (qual opção atende os dois motivos) + 1 Noul (os motivos conflitam?) + 1 Noul por opção por sócio (a opção atende o motivo dele?), numa única requisição paralela. Código: justiça = mínimo entre os dois; sugestão = maior justiça; "forte" só se a Choice concordar com confiança ≥ 0.6.
- **Checagem de pedido:** 4 Nouls atômicos sobre personalização/notas (detalhes completos, marca de terceiros, conteúdo ofensivo, urgência). Estado mínimo, sem nome/email do cliente. Roda com `after()` depois da resposta ao cliente; falha do Jev nunca bloqueia pedido.
- Tabelas: `business_decision_positions`, `business_decision_mediations`, `farmz3d_order_triage` (FK com cascade).
