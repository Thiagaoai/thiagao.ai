# Setup — colocar em produção

Rotas novas: `/farmz3d`, `/reviews-machine`, `/r/<slug>` (demo: `/r/demo`) e o painel **`/admin/farmz3d`**.

## 1. Banco (Supabase)
SQL Editor → rode, nesta ordem:
1. `supabase/migrations/005_farmz3d_dockplus.sql` → `farmz3d_orders`, `dockplus_review_events`, `dockplus_missed_calls`
2. `supabase/migrations/006_business_decisions.sql` → `business_decisions`, `business_decision_log`, coluna `shipping_cents`
3. `supabase/migrations/007_jev_typesafe.sql` → `business_decision_positions`, `business_decision_mediations`, `farmz3d_order_triage`

RLS ligado em todas; acesso só pelo servidor.

## 1b. Painel `/admin/farmz3d`
Mesmo login do painel da newsletter (`/admin/login`, variáveis `ADMIN_DASHBOARD_TOKEN`/`ADMIN_API_TOKEN` já existentes).
- **Decisões:** cada preço/prazo com dados de mercado e fonte. Escolha "Decidindo como Thiago/Bruna", selecione a opção e clique **Aprovar** → o site muda na hora (`/farmz3d` e `/reviews-machine`). Pendente = site usa a opção recomendada. Tudo fica no histórico.
- **Pedidos:** lista com status editável (`Novo → Confirmado → Imprimindo → Enviado/Retirado`).
- **Reviews** e **Ligações perdidas:** o que os clientes da DockPlus estão recebendo.

## 1c. Jev (TypeSafe) — denominador comum e checagem de pedidos
```
TYPESAFE_API_KEY=...          # console.typesafe.ai — sem ela o painel funciona, só sem os botões do Jev
TYPESAFE_MODEL=jev-latest     # opcional (padrão jev-latest)
```
- **Denominador comum:** em cada decisão, cada um escolhe a opção e escreve o motivo → **Registrar minha posição**. Se discordarem, **Jev: encontrar o denominador comum**. O Jev julga se cada opção atende o motivo do Thiago e o da Bruna (probabilidades) e o código sugere a opção mais justa (a que melhor atende quem fica menos satisfeito). A aprovação continua sendo humana.
- **Checagem de pedidos:** todo pedido novo é analisado depois de responder ao cliente (não atrasa o checkout): faltam detalhes? personagem/marca de terceiros (risco de direitos)? texto ofensivo? pediu urgência? → "Pronto para produzir / Conferir / Pedir detalhes / Revisar". Botão "Reanalisar" em cada pedido.
- **Antes de confiar nos números:** os limites (0.5 / 0.8) são pontos de partida. Rode nos primeiros ~30 pedidos reais e ajuste em `lib/typesafe/order-triage.ts` (`TRIAGE_THRESHOLDS`).

## 2. Variáveis de ambiente (Dokploy)
Obrigatórias para a Farmz3D (algumas já existem para o newsletter):
```
NEXT_PUBLIC_SUPABASE_URL=...          # já existe
SUPABASE_SERVICE_ROLE_KEY=...         # já existe
RESEND_API_KEY=...                    # já existe
FARMZ3D_ORDERS_EMAIL=<email da Bruna>
```
Opcionais:
```
FARMZ3D_FROM_EMAIL="Farmz3D <dockplus@dockplusai.com>"   # padrão: "Farmz3D" + endereço do NEWSLETTER_FROM
NEXT_PUBLIC_FARMZ3D_INSTAGRAM=@seu_instagram              # mostra o link no rodapé
DOCKPLUS_ALERT_EMAIL=<email que recebe feedback negativo quando o cliente não tem notifyEmail>
```
Variáveis `NEXT_PUBLIC_*` são embutidas no **build**, então precisam estar disponíveis no build do Dokploy, não só em runtime.

## 3. Adicionar um cliente da Reviews Machine
Edite `lib/dockplus/review-clients.ts`:
```ts
{
  slug: 'roberts-landscape',
  businessName: 'Roberts Landscape',
  googleReviewUrl: 'https://g.page/r/<ID>/review',   // do Google Business Profile → "Ask for reviews"
  notifyEmail: 'owner@cliente.com',
  accentColor: '#15803d',
},
```
Faça o deploy. A URL do QR/NFC fica `https://www.thiagao.io/r/roberts-landscape`.
**Tag NFC:** grave um registro "URL" com esse endereço (NTAG213/215, app NFC Tools no celular).

## 4. Missed-Call Text-Back (Twilio)
1. Compre um número local no Twilio.
2. **Registro A2P 10DLC** (Console → Messaging → Regulatory Compliance). Sem isso as operadoras dos EUA bloqueiam os SMS.
3. No número: *Voice → A call comes in → Webhook* `POST https://www.thiagao.io/api/dockplus/missed-call/voice`
4. Variáveis:
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WEBHOOK_BASE_URL=https://www.thiagao.io        # exatamente o domínio configurado no webhook, sem barra final
MISSED_CALL_ROUTES=[{"twilioNumber":"+1508XXXXXXX","forwardTo":"+1508YYYYYYY","businessName":"Roberts Landscape","smsText":"Hi! Sorry we missed your call at Roberts Landscape. How can we help? Reply here.","dialTimeoutSeconds":18}]
```
5. **Teste real:** ligue para o número Twilio de outro celular, não atenda no celular de destino e confira o SMS e a linha em `dockplus_missed_calls`.
6. Se o correio de voz do dono atender antes de 18s, a ligação conta como "atendida" e nenhum SMS é enviado. Diminua `dialTimeoutSeconds` ou aumente o tempo de toque antes do voicemail.

## 5. Verificar
```bash
npm ci && npm run check      # lint + testes + build
```
