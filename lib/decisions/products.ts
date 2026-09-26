import type { Decision, DecisionOption } from './schema';

// Farmz3D product pricing. Market prices: US Etsy/Amazon listings observed Sept 2026
// (Etsy read via search snippets; many are "sale" prices). Material cost = estimated grams
// of PLA x $0.016/g (Bambu Lab PLA Basic $15.99/kg); grams are estimates — weigh the first print.

const PLA_SOURCE = 'https://us.store.bambulab.com/products/pla-basic-filament';
const ETSY = 'https://www.etsy.com';

function plaCost(grams: number, extraCents = 0) {
  return Math.round(grams * 1.6) + extraCents;
}

function price(
  productId: string,
  title: string,
  unitLabel: string,
  grams: number,
  options: DecisionOption[],
  recommendedOptionId: string,
  evidence: Decision['evidence'],
  extraCostCents = 0,
  extraCostLabel?: string,
): Decision {
  return {
    id: `price:${productId}`,
    group: 'farmz3d-pricing',
    title,
    question: `Preço de venda (${unitLabel}).`,
    owner: 'bruna',
    unit: 'usd_cents',
    unitCostCents: plaCost(grams, extraCostCents),
    options,
    recommendedOptionId,
    evidence: [
      ...evidence,
      {
        label: `Material: ~${grams} g PLA${extraCostLabel ? ` + ${extraCostLabel}` : ''} (estimativa — pesar)`,
        value: `$${(plaCost(grams, extraCostCents) / 100).toFixed(2)}`,
        sourceUrl: PLA_SOURCE,
      },
    ],
  };
}

export const PRODUCT_DECISIONS: Decision[] = [
  price(
    'halloween-bucket-tag',
    'Trick-or-Treat Name Tag',
    'cada',
    10,
    [
      { id: 'low', label: 'Abaixo do mercado', value: 900, rationale: 'Menor preço observado (~$9). Produto de entrada para atrair pedidos.' },
      { id: 'market', label: 'Preço de mercado', value: 1200, rationale: 'Típico observado ($12–$12.50). Peça barata de imprimir.' },
      { id: 'premium', label: 'Premium', value: 1400, rationale: 'Acima do observado. Só com multicor/glitter.' },
    ],
    'market',
    [
      { label: 'Pumpkin boo basket tag', value: '$12.50', sourceUrl: `${ETSY}/listing/4360746971/pumpkin-boo-basket-name-tag-personalized` },
      { label: 'Trick or treat bucket tags', value: '$12.00', sourceUrl: `${ETSY}/listing/4352061848/custom-halloween-ghost-treat-bag-tags` },
      { label: '3D printed boo basket tag (snippet incerto)', value: '~$9.50', sourceUrl: `${ETSY}/listing/1782968131/personalized-kids-halloween-name-tag-3d` },
    ],
  ),
  price(
    'halloween-cookie-cutters',
    'Halloween Cookie Cutter Set (3 + cortador com nome)',
    'conjunto de 3 + 1 com nome',
    60,
    [
      { id: 'low', label: 'Soma dos mínimos', value: 1700, rationale: 'Conjunto de 3 ($11) + cortador com nome (~$6.50).' },
      { id: 'market', label: 'Preço de mercado', value: 2100, rationale: 'Conjunto típico ($13–$15) + cortador com nome típico ($6.50–$10).' },
      { id: 'high', label: 'Alto', value: 2500, rationale: 'Topo do mercado; difícil competir com conjuntos de $11.' },
    ],
    'market',
    [
      { label: 'Conjunto de 3 (vários vendedores)', value: '$11.00–$11.35', sourceUrl: `${ETSY}/listing/1054109011/halloween-cookie-cutter-set-3d-printed` },
      { label: 'Ghost trio / Boo 3 peças', value: '$14.70–$14.78', sourceUrl: `${ETSY}/listing/1757513592/ghost-trio-cookie-cutter-set-halloween` },
      { label: 'Conjunto vampiro (topo)', value: '$16.68', sourceUrl: `${ETSY}/listing/4347974679/vampire-halloween-cutter-set-platter` },
      { label: 'Cortador com nome da família', value: '$3.99–$15 (típico $6.50–$10)', sourceUrl: `${ETSY}/market/custom_cookie_stencils` },
    ],
  ),
  price(
    'halloween-lithophane',
    'Spooky Photo Lithophane Light',
    'cada',
    60,
    [
      { id: 'nightlight', label: 'Versão luz de tomada', value: 1900, rationale: 'Plug-in night lights ficam em $8–$15. Só vale sem base.' },
      { id: 'market', label: 'Luminária com base (mercado)', value: 2900, rationale: 'Luminárias com base LED: típico $26–$40.' },
      { id: 'high', label: 'Alto', value: 3900, rationale: 'Topo das luminárias ($39.99). Só com base/moldura premium.' },
    ],
    'market',
    [
      { label: 'Lithophane lamp', value: '$27.99', sourceUrl: `${ETSY}/market/3d_printed_lithophane_lamp` },
      { label: 'Lamp (outro vendedor)', value: '$39.99+', sourceUrl: `${ETSY}/listing/4489869742` },
      { label: 'Night lights de tomada', value: '$7.87–$15', sourceUrl: `${ETSY}/listing/1249787598` },
      { label: 'Base LED: custo NÃO pesquisado', value: 'somar ao custo', sourceUrl: `${ETSY}/market/color_lithophane_3d_print` },
    ],
  ),
  price(
    'thanksgiving-place-cards',
    'Personalized Place Card Holders',
    'conjunto de 6',
    48,
    [
      { id: 'low', label: 'Abaixo', value: 1500, rationale: '$2.50 por peça — perto dos personalizados avulsos ($1.05–$2.25).' },
      { id: 'market', label: 'Preço de mercado', value: 1800, rationale: 'Conjunto de 6 observado a $17.95; nosso é personalizado com nome.' },
      { id: 'high', label: 'Alto', value: 2400, rationale: '$4 por peça. Acima do observado.' },
    ],
    'market',
    [
      { label: 'Turkey place card holders (6)', value: '$17.95', sourceUrl: `${ETSY}/market/placecard_holders_bulk` },
      { label: 'Place card 3D personalizada (cada)', value: '$1.69–$2.25', sourceUrl: `${ETSY}/listing/4399124583` },
      { label: 'TinkerMake 3D (sem nome)', value: '$10 (2) a $38 (20)', sourceUrl: 'https://tinkermake.com/product/thanksgiving-pilgrim-hat-owl-place-card-holder-set' },
    ],
  ),
  price(
    'thanksgiving-napkin-rings',
    'Name Napkin Rings',
    'conjunto de 6',
    36,
    [
      { id: 'low', label: 'Preço por anel do mercado', value: 1500, rationale: '6 × ~$2.54 (anel 3D personalizado observado).' },
      { id: 'market', label: 'Recomendado', value: 1900, rationale: 'Um pouco acima do preço por anel, por ser conjunto personalizado pronto.' },
      { id: 'high', label: 'Alto', value: 2900, rationale: 'Entre 3D ($15) e conjuntos de outros materiais ($48).' },
    ],
    'market',
    [
      { label: 'Anel 3D personalizado (cada)', value: '$2.54', sourceUrl: `${ETSY}/listing/4537753035/personalized-3d-printed-napkin-rings` },
      { label: 'Set of 6 family napkin rings (material n/d)', value: '$48.00', sourceUrl: `${ETSY}/market/personalized_napkin_rings` },
      { label: 'Poucos dados de conjuntos 3D', value: 'amostra pequena', sourceUrl: `${ETSY}/market/3d_printed_napkin_ring_with_name` },
    ],
  ),
  price(
    'christmas-name-ornament',
    'Personalized Name Ornament',
    'cada',
    12,
    [
      { id: 'low', label: 'Abaixo', value: 900, rationale: 'Base do típico ($9). Bom para volume.' },
      { id: 'market', label: 'Preço de mercado', value: 1200, rationale: 'Típico observado $9–$13.' },
      { id: 'high', label: 'Multicor em camadas', value: 1600, rationale: 'Perto do topo ($17.84–$19.19).' },
    ],
    'market',
    [
      { label: 'Name ornament 3D', value: '$9.00', sourceUrl: `${ETSY}/market/3d_printer_name_christmas_ornament` },
      { label: 'Name ornament 3D', value: '$12.99', sourceUrl: `${ETSY}/market/christmas_ornament_3d_printed_name` },
      { label: 'Topo: name snowflake', value: '$19.19', sourceUrl: `${ETSY}/market/3d_printed_ornaments_personalized` },
      { label: 'Mínimo (promoção)', value: '$3.75', sourceUrl: `${ETSY}/market/3d_printed_snowflake_name_ornament` },
    ],
  ),
  price(
    'christmas-stocking-tags',
    'Stocking Name Tags',
    'conjunto de 4',
    32,
    [
      { id: 'low', label: '$4 por tag', value: 1600, rationale: 'Entre mini ($2.25) e padrão ($4.50).' },
      { id: 'market', label: '~$5.50 por tag', value: 2200, rationale: 'Mercado cobra ~$6 por tag; conjunto com leve desconto.' },
      { id: 'high', label: '$7 por tag', value: 2800, rationale: 'Preço anterior. Acima do típico.' },
    ],
    'market',
    [
      { label: 'Stocking tag mini / padrão', value: '$2.25 / $4.50', sourceUrl: `${ETSY}/listing/1615532123` },
      { label: 'Stocking tag', value: '$5.99', sourceUrl: `${ETSY}/listing/1821490900` },
      { label: 'Stocking tag', value: '$8.49', sourceUrl: `${ETSY}/listing/1839238869` },
      { label: 'Topo', value: '$11.99', sourceUrl: `${ETSY}/listing/1801739689` },
    ],
  ),
  price(
    'christmas-photo-lithophane',
    'Photo Lithophane Ornament',
    'cada',
    20,
    [
      { id: 'low', label: 'Abaixo', value: 1500, rationale: 'Base do típico ($15.30).' },
      { id: 'market', label: 'Com LED (mercado)', value: 1800, rationale: 'Típico $15–$18; listagem de $18 inclui 2 LEDs e gancho.' },
      { id: 'high', label: 'Premium', value: 2500, rationale: 'Faixa alta ($24.99–$29.99).' },
    ],
    'market',
    [
      { label: 'Sphere lithophane ornament', value: '$15.30', sourceUrl: `${ETSY}/listing/1607015121` },
      { label: 'Com 2 LEDs + gancho', value: '$18.00', sourceUrl: `${ETSY}/listing/4408778186` },
      { label: 'Faixa alta', value: '$24.99–$29.99', sourceUrl: `${ETSY}/market/lithophane_christmas_ornaments` },
    ],
  ),
  price(
    'pet-memorial',
    'Pet Memorial Keepsake (lithophane)',
    'cada',
    60,
    [
      { id: 'low', label: 'Abaixo', value: 1900, rationale: 'Perto de $19.99 observado.' },
      { id: 'market', label: 'Preço de mercado', value: 2400, rationale: 'Típico $20–$24 (night light $24).' },
      { id: 'high', label: 'Com LED e moldura', value: 3500, rationale: 'Versões coloridas com LED e moldura chegam a $44.99.' },
    ],
    'market',
    [
      { label: 'Lithophane portrait', value: '$19.99', sourceUrl: `${ETSY}/market/lithophane_portrait?page=3` },
      { label: 'Memorial night light', value: '$24.00', sourceUrl: `${ETSY}/listing/4460162520` },
      { label: 'Memorial keepsake', value: '$25.99', sourceUrl: `${ETSY}/market/lithophane_3d_print` },
      { label: 'Colorido com LED e moldura', value: '$44.99', sourceUrl: `${ETSY}/market/color_lithophane_3d_print` },
    ],
  ),
  price(
    'cake-topper',
    'Custom Cake Topper',
    'cada',
    15,
    [
      { id: 'low', label: 'Abaixo', value: 1000, rationale: 'Base do típico PLA ($10).' },
      { id: 'market', label: 'Preço de mercado', value: 1400, rationale: 'Típico PLA $10–$17.' },
      { id: 'high', label: 'Alto', value: 1900, rationale: 'Perto do topo de acrílico ($19.99).' },
    ],
    'market',
    [
      { label: 'Cake topper 3D PLA', value: '$13.50 / $15.98', sourceUrl: `${ETSY}/market/custom_3d_printed_cake_topper` },
      { label: 'Cake topper 3D PLA', value: '$15.09 / $17.16', sourceUrl: `${ETSY}/listing/1877031133` },
      { label: 'Acrílico (comparação)', value: '$6.99–$30', sourceUrl: `${ETSY}/market/acrylic_name_cake_topper` },
    ],
  ),
  price(
    'business-review-stand',
    'Google Review NFC + QR Stand (com logo)',
    'cada',
    60,
    [
      { id: 'low', label: 'Igual Amazon', value: 1900, rationale: 'Amazon/Etsy com logo: ~$15–$20.' },
      { id: 'market', label: 'Recomendado', value: 2500, rationale: 'Logo + NFC programado para a página de review. Abaixo das placas premium ($29.99+).' },
      { id: 'high', label: 'Premium', value: 3500, rationale: 'Faixa premium ($29.99–$79.92). Só com acabamento especial.' },
    ],
    'market',
    [
      { label: 'Custom logo tap stand (frete grátis)', value: '$19.99', sourceUrl: `${ETSY}/market/custom_nfc_tap_stand` },
      { label: 'Amazon (QRLynk, Amazon’s Choice)', value: '$16.99', sourceUrl: 'https://www.amazon.com/Review-Stand-Compatible-Google-Social/dp/B0F626T62X' },
      { label: 'ZappyCards stand', value: '$40 (1) · $25 (5+)', sourceUrl: 'https://zappycards.com/products/nfc-google-review-stand' },
      { label: 'NFC NTAG213 (100 un.)', value: '~$0.16/un.', sourceUrl: 'https://www.walmart.com/c/kp/nfc-stickers' },
    ],
    16,
    'NFC $0.16',
  ),
];
