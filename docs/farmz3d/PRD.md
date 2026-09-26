# PRD — Farmz3D Holiday Store + DockPlus Reviews Machine + Missed-Call Text-Back

Status: v1 implementado neste repositório (branch `claude/stoic-carson-aku6as`).
Donos: Thiago (DockPlus / tecnologia) e Bruna (Farmz3D / produção 3D).

## 1. Problema

1. **Farmz3D** tem impressora 3D e marca, mas não tem um canal de pedido próprio para a temporada que mais vende presente personalizado: Halloween (31/out), Thanksgiving (26/nov/2026) e Natal (25/dez).
2. **DockPlus** precisa de ofertas simples de IA/automação que um dono de negócio local entenda em 10 segundos e pague todo mês.
3. As duas coisas se conectam: o **display NFC/QR de review** é impresso pela Farmz3D e vendido junto com a automação de reviews da DockPlus.

## 2. Objetivo de negócio

| Meta | Número | Como medir |
|---|---|---|
| Curto prazo | US$ 1.000/semana até 31/out/2026 | Pedidos Farmz3D pagos + setups DockPlus |
| Médio prazo | US$ 10.000/mês até dez/2026–mar/2027 | Recorrente DockPlus + vendas Farmz3D |

Os números são metas, não previsões. O sistema mede pedidos, avaliações e ligações perdidas para mostrar se a meta está sendo atingida.

## 3. Escopo v1 (o que foi construído)

### 3.1 Farmz3D — loja de temporada (`/farmz3d`)
- Landing em inglês (cliente nos EUA) com a **campanha ativa escolhida automaticamente pela data**:
  Halloween → Thanksgiving → Natal, com **prazo de pedido** ("order by") e contador de dias.
- Catálogo tipado (`lib/farmz3d/catalog.ts`) por coleção: Halloween, Thanksgiving, Christmas, Year-round e Business.
- Formulário de pedido personalizado: produto, quantidade, texto de personalização, data desejada, retirada/envio, contato.
- Pedido é validado (zod), protegido contra bot (honeypot + tempo mínimo + rate limit), salvo no Supabase e notificado por email (Resend).
- Cliente recebe número do pedido na tela. **Pagamento não é cobrado no site na v1**: a Bruna confirma o pedido e manda link de pagamento (Stripe/Square/PayPal que ela já usar).

### 3.2 DockPlus — Reviews Machine (`/reviews-machine` e `/r/[slug]`)
- Página de venda do serviço.
- Página de avaliação por cliente (`/r/<slug>`): destino do QR/NFC.
  - Nota 4–5 → registra e **redireciona para a página de review do Google** do cliente.
  - Nota 1–3 → mostra formulário de feedback privado, salva e avisa o dono por email.
- Demo funcional em `/r/demo` (não redireciona para nenhum Google real; mostra o que aconteceria).

### 3.3 DockPlus — Missed-Call Text-Back (Twilio)
- Webhook de voz: a ligação para o número Twilio do cliente é encaminhada para o celular do dono.
- Se não atender (no-answer / busy / failed / canceled) → SMS automático para quem ligou + registro no Supabase.
- Assinatura do Twilio validada em toda requisição.

## 4. Fora do escopo v1 (explícito)
- Checkout/pagamento dentro do site.
- Upload de foto no pedido (a foto de litofania é pedida por email/DM depois do pedido).
- Recepcionista de IA por voz (Bland/ElevenLabs): fica para a v2, porque depende de conta, número e roteiro do cliente.
- Painel admin de pedidos: na v1 os pedidos são vistos no Supabase (Table Editor) e chegam por email.
- Envio automático de pedido de review por SMS após o serviço (v2: depende do CRM do cliente/GHL).

## 5. Usuários e fluxos

**Comprador Farmz3D:** abre `/farmz3d` → vê campanha e prazo → escolhe produto → preenche pedido → recebe número → Bruna responde com confirmação e link de pagamento.

**Bruna:** recebe email "New Farmz3D order" → confere no Supabase → produz → marca status (`new → confirmed → printing → shipped/picked_up`).

**Cliente final de um negócio (ex.: landscaping):** encosta o celular no display NFC ou lê o QR → `/r/<slug>` → dá nota → Google (4–5) ou feedback privado (1–3).

**Quem liga para um negócio:** liga → ninguém atende → recebe SMS em segundos → responde por SMS.

## 6. Requisitos não funcionais
- Nenhuma chave secreta no código; tudo por variável de ambiente.
- Se o Supabase **e** o Resend estiverem desligados, o pedido **não é aceito** (erro 503 claro). Nunca "fingir" que salvou.
- Páginas funcionam no celular (a maioria dos acessos de QR/NFC é mobile).
- `npm run lint`, `npm run build` e `npm test` passando.

## 7. Critérios de aceite (verificados)
1. `/farmz3d` mostra a campanha correta para a data atual e o prazo de pedido.
2. POST de pedido válido → 200 com número do pedido; inválido → 400 com mensagem; sem Supabase/Resend → 503.
3. `/r/demo` com nota 5 → mostra a tela de redirecionamento; com nota 2 → formulário de feedback → 200.
4. Webhook Twilio com assinatura errada → 403; correta + `DialCallStatus=no-answer` → TwiML de resposta e SMS disparado.
5. Testes unitários de datas de campanha e assinatura Twilio passando.

## 8. Dependências externas (o que vocês precisam ter)
| Serviço | Para quê | Obrigatório? |
|---|---|---|
| Supabase | salvar pedidos, avaliações e ligações | Sim (ou Resend) |
| Resend (domínio verificado) | emails de aviso | Sim (ou Supabase) |
| Twilio + registro A2P 10DLC | SMS nos EUA para números locais | Só para Missed-Call |
| Link de review do Google de cada cliente | redirecionamento | Só para Reviews Machine |
| Fotos reais dos produtos | conversão da landing | Fortemente recomendado |

## 9. Decisões que são de vocês (não inventadas pelo sistema)
- **Preços** em `lib/farmz3d/catalog.ts` são *sugestões iniciais*; ajustem antes de divulgar.
- **Prazos de pedido** (`orderLeadDays`) em `lib/farmz3d/season.ts` dependem da capacidade de produção da Bruna e do frete.
- Cores/logo da Farmz3D: a landing usa uma paleta neutra de outono; troquem para a identidade oficial.
