# Setup

## 0. Rodar tudo no seu computador (localhost) — sem configurar nada
```bash
git clone https://github.com/Thiagaoai/thiagao.ai.git
cd thiagao.ai
git checkout claude/stoic-carson-aku6as   # ou main, depois do merge
npm ci
npm run farmz3d:local
```
Abra:
- Loja: http://localhost:3002/farmz3d
- Reviews Machine: http://localhost:3002/reviews-machine · demo: http://localhost:3002/r/demo
- Painel: http://localhost:3002/admin/login → usuário `admin`, senha `farmz3d-local` → botão **Farmz3D + DockPlus**

No modo local, pedidos, decisões e avaliações ficam em `.data/local-db.json` (apague o arquivo para zerar). Emails não são enviados. Para ligar o Jev, crie `.env.local` com `TYPESAFE_API_KEY=...`. Se o `.env.local` tiver Supabase real, ele é usado no lugar do arquivo local. O modo local nunca liga em produção (`NODE_ENV=production`).

# Colocar em produção

Rotas novas: `/farmz3d`, `/reviews-machine`, `/r/<slug>` (demo: `/r/demo`) e o painel **`/admin/farmz3d`**.

## 1. Banco (Supabase)
SQL Editor → rode, nesta ordem:
1. `supabase/migrations/005_farmz3d_dockplus.sql` → `farmz3d_orders`, `dockplus_review_events`, `dockplus_missed_calls`
2. `supabase/migrations/006_business_decisions.sql` → `business_decisions`, `business_decision_log`, coluna `shipping_cents`
3. `supabase/migrations/007_jev_typesafe.sql` → `business_decision_positions`, `business_decision_mediations`, `farmz3d_order_triage`
4. `supabase/migrations/008_farmz3d_order_images.sql` → coluna `image_path` + bucket **privado** `farmz3d-order-images` (8 MB, JPG/PNG/WebP/HEIC)

> Já aplicadas no projeto `thiagao-newsletter` (qropstlezhnxtwkxirwb).

RLS ligado em todas; acesso só pelo servidor.

## 1a. Pedido com imagem, emails e WhatsApp da Bruna
- **Imagem no pedido:** o cliente anexa foto/logo/rascunho (JPG, PNG, WebP; HEIC do iPhone também é aceito; até 8 MB). O servidor confere o tipo pelos bytes do arquivo (não pelo nome), grava num bucket **privado** com nome aleatório e:
  - anexa a imagem no **email do pedido** que chega para `FARMZ3D_ORDERS_EMAIL`;
  - mostra a miniatura no painel (`/admin/farmz3d` → Pedidos), aberta só para quem está logado.
- **Emails:** a cada pedido chegam 2 emails (Resend): um para vocês (com a imagem anexada e o botão **Reply on WhatsApp** que já abre a conversa com o cliente) e a confirmação para o cliente (com o WhatsApp da loja).
- **WhatsApp da Bruna — (774) 722-5366:** botão flutuante verde em toda a loja, link no topo e no rodapé, e depois do pedido o cliente vê **Chat with us on WhatsApp** com o número do pedido já escrito. No painel, cada pedido tem **WhatsApp do cliente** com a mensagem pronta. O número de WhatsApp agora é obrigatório no pedido.
- Para trocar o número sem mexer no código: `NEXT_PUBLIC_FARMZ3D_WHATSAPP=1XXXXXXXXXX` (com o 1 dos EUA; precisa estar disponível no build).
- **Teste do email em produção:** faça um pedido real com uma foto e confira se chegou no email da Bruna com o anexo. Se não chegar, veja os logs do Dokploy (`[farmz3d]`). O remetente precisa ser de um domínio verificado no Resend.

## 1d. Domínio próprio da loja (Hostinger → Dokploy)
Exemplo com `farmz3d.com` — troque pelo domínio que vocês registrarem.
1. **Hostinger:** registre o domínio. Em *Domínios → DNS / Nameservers*, apague os registros A/CNAME padrão de `@` e `www` e crie:
   - `A` · nome `@` · aponta para **o IP do servidor do Dokploy** (o mesmo IP para onde `thiagao.io` aponta) · TTL 300
   - `CNAME` · nome `www` · aponta para `farmz3d.com`
2. **Dokploy:** no app do site → *Domains* → adicione `farmz3d.com` e `www.farmz3d.com`, porta **3000**, HTTPS ligado com **Let's Encrypt**.
3. **Dokploy → Environment:**
   ```
   FARMZ3D_HOSTS=farmz3d.com,www.farmz3d.com
   FARMZ3D_SITE_URL=https://farmz3d.com
   ```
   e faça **Redeploy**.
4. Pronto: `https://farmz3d.com` abre a loja na raiz; `/farmz3d` redireciona para `/`; qualquer outra página vai para `https://www.thiagao.io` (troque com `FARMZ3D_MAIN_SITE_URL`). O painel continua em `https://www.thiagao.io/admin/farmz3d`.
5. DNS leva de minutos a algumas horas. Teste com `dig +short farmz3d.com` (deve mostrar o IP do servidor).
6. **Emails com o domínio da loja (opcional):** no Resend, *Domains → Add* `farmz3d.com`, copie os registros TXT/MX que ele mostrar para o DNS da Hostinger e depois use `FARMZ3D_FROM_EMAIL="Farmz3D <orders@farmz3d.com>"`.

Para testar o domínio no seu computador antes: `FARMZ3D_HOSTS=farmz3d.localhost npm run farmz3d:local` e abra http://farmz3d.localhost:3002.

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
NEXT_PUBLIC_FARMZ3D_WHATSAPP=17747225366                 # padrão: WhatsApp da Bruna
FARMZ3D_HOSTS=farmz3d.com,www.farmz3d.com                # domínio próprio da loja (ver 1d)
FARMZ3D_SITE_URL=https://farmz3d.com                     # URL canônica da loja
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

## 5. Segurança (revisado)
- Next.js 16.3.6 (corrige falhas críticas da 16.2, incluindo RCE no otimizador de imagens).
- Login do painel: limite de 10 tentativas/hora por IP e por usuário; comparação de senha/token em tempo constante; senha verificada sem travar o servidor.
- Rotas do painel recusam requisições vindas de outros sites (proteção CSRF por `Origin`); o `?token=` na URL não é mais aceito.
- Rotas de admin exigem credencial em qualquer ambiente (sem "liberado em desenvolvimento").
- Limite de pedidos por IP usa o IP adicionado pelo proxy (não dá para burlar com cabeçalho falso).
- Upload: tipo conferido pelos bytes, 8 MB, bucket privado, nome aleatório, imagem só aparece para admin logado.
- `.data/` fora da imagem Docker.
- **Pendente (recomendado):** sessão do painel individual por login (hoje todos usam o mesmo token de sessão; trocar `ADMIN_DASHBOARD_TOKEN` derruba todas as sessões).

## 6. Verificar
```bash
npm ci && npm run check      # lint + testes + build
```

## 7. Imagens e design da loja
- Fotos de produto e lifestyle: geradas com IA (Higgsfield, GPT Image 2.5) e servidas pelo CDN da Higgsfield via `next/image` (converte para AVIF/WebP no tamanho certo). Mapa em `lib/farmz3d/media.ts`.
- O rodapé avisa que são prévias geradas por IA. Assim que houver fotos reais das peças impressas, coloque os arquivos em `public/farmz3d/` e troque o `src` do produto em `lib/farmz3d/media.ts` (ex.: `/farmz3d/christmas-name-ornament.jpg`).
- Hero 3D: `app/farmz3d/Hero3D.tsx` (React Three Fiber, 100% procedural, sem arquivos externos). Respeita "reduzir movimento" do sistema.
- Paleta: papel `#F5F5F3`, grafite `#0B0C0E`, acento cobalto `#2B5BFF`. Fontes: Unbounded (títulos), Geist (texto), Geist Mono (detalhes).
