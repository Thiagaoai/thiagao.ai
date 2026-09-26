# Plano de execução — 26/set a 31/dez/2026

Datas reais do calendário 2026 (as mesmas que o sistema calcula e testa):

| Campanha | Feriado | Último dia de pedido (padrão) | Dias a partir de 26/set |
|---|---|---|---|
| Halloween | sáb, 31/out | **qui, 22/out** | 26 |
| Thanksgiving | qui, 26/nov | **seg, 16/nov** | 51 |
| Natal | sex, 25/dez | **sáb, 12/dez** | 77 |

O Halloween é a campanha mais curta: são 26 dias para vender. A prioridade é colocar o site no ar esta semana.

---

## Semana 0 (26/set – 30/set): colocar no ar
**Thiago**
1. Rodar `supabase/migrations/005_farmz3d_dockplus.sql` no Supabase (SQL Editor).
2. Configurar no Dokploy as variáveis do `docs/farmz3d/SETUP.md` e fazer o deploy.
3. Fazer um pedido de teste real em `/farmz3d` e confirmar que ele aparece na tabela `farmz3d_orders` e que o email chega.

**Bruna**
1. Revisar os **preços** e os textos em `lib/farmz3d/catalog.ts` (ou passar a lista para o Thiago).
2. Confirmar a capacidade de produção: quantas peças por dia? Isso define se os prazos de pedido (9/10/13 dias) estão certos.
3. Imprimir **uma amostra de cada produto de Halloween** e fotografar com luz natural. As fotos substituem os emojis dos cards.
4. Definir onde vai mandar o link de pagamento (Stripe Payment Link, Square ou PayPal).

## Semanas 1–3 (1/out – 22/out): vender Halloween
- **Conteúdo diário:** 1 vídeo curto (timelapse da impressão + peça pronta) no Instagram/TikTok com o link `/farmz3d`.
- **Pedidos:** responder cada pedido em até 24h, com confirmação e link de pagamento. Status no Supabase: `new → confirmed → printing → shipped/picked_up`.
- **Grupos locais:** postar em grupos de Facebook da cidade, escolas e igrejas. A tag de balde de doces com nome é o produto de entrada, porque é barata e rápida.
- **Dia 22/out:** a landing troca sozinha para Thanksgiving no dia seguinte.

## Semanas 4–7 (23/out – 16/nov): Thanksgiving + B2B
- Produtos: porta-cartão de lugar e porta-guardanapo com nomes (vendidos em conjuntos, com ticket maior).
- **Thiago:** começar a vender a **Reviews Machine** para os clientes atuais da DockPlus.
  1. Pegar o link "Get more reviews" do Google Business Profile do cliente.
  2. Adicionar o cliente em `lib/dockplus/review-clients.ts` (slug, nome, link, email de alerta) e fazer o deploy.
  3. A Bruna imprime 3 displays com a logo, com QR para `https://www.thiagao.io/r/<slug>` e a tag NFC gravada com a mesma URL.
- Meta: 3 clientes da Reviews Machine até 16/nov.

## Semanas 8–11 (17/nov – 12/dez): Natal, o pico
- Enfeite com nome é o produto de volume. A litofania com foto é o de ticket alto.
- Fazer lotes: agrupar os pedidos do mesmo produto e cor por dia de impressão.
- Se a fila passar da capacidade, antecipe o fechamento mudando `ORDER_LEAD_DAYS.christmas` em `lib/farmz3d/season.ts`. Não aceite pedido que não dá para entregar.
- **Thiago:** oferecer o **Missed-Call Text-Back** para os clientes da Reviews Machine (upsell para o kit de US$ 347/mês).

## 13/dez – 31/dez: fechamento
- A landing passa a mostrar o Halloween 2027. Troque o destaque para a coleção Year-round (pet memorial, cake topper) e a Business.
- Revisão: quanto vendeu cada produto, qual canal trouxe mais pedidos e quantos clientes recorrentes a DockPlus fechou.

---

## Números para acompanhar (toda segunda-feira)
| Métrica | Onde ver |
|---|---|
| Pedidos por semana e valor estimado | Supabase → `farmz3d_orders` |
| Scans e notas por cliente | Supabase → `dockplus_review_events` |
| Ligações perdidas e SMS enviados | Supabase → `dockplus_missed_calls` |
| Receita recorrente DockPlus | contratos fechados |

Consulta útil (SQL Editor):
```sql
select date_trunc('week', created_at) as semana, count(*) as pedidos,
       sum(estimated_total_cents)/100.0 as valor_estimado_usd
from farmz3d_orders where status <> 'cancelled'
group by 1 order by 1 desc;
```

## Caminho para US$ 1.000/semana
Com os preços atuais do catálogo, isso equivale a cerca de 30 pedidos de US$ 35 por semana, **ou** 20 pedidos + 2 setups da DockPlus. Acompanhe o número real na consulta acima e ajuste o esforço (conteúdo e prospecção) toda segunda.
