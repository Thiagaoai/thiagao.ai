import type { Decision } from './schema';

// DockPlus service pricing. Market data researched Sept 2026; every figure links to its source.
// Our cost floor per missed-call client (Twilio): ~$11.15/mo fixed + ~$0.012 per SMS, $61 one-time A2P 10DLC.

const TWILIO_SMS = 'https://www.twilio.com/en-us/sms/pricing/us';
const TWILIO_10DLC = 'https://help.twilio.com/articles/1260803965530';

export const SERVICE_DECISIONS: Decision[] = [
  {
    id: 'service:reviews-monthly',
    group: 'dockplus-pricing',
    title: 'Reviews Machine — mensalidade',
    question: 'Quanto cobrar por mês pela Reviews Machine (página de avaliação + alertas + relatório)?',
    owner: 'thiago',
    unit: 'usd_cents',
    options: [
      { id: 'entry', label: 'Entrada', value: 9700, rationale: 'Igual ao pacote de agência mais barato encontrado (Local Lead Pros $97/mês). Fácil de fechar, margem menor.' },
      { id: 'mid', label: 'Meio de mercado', value: 14700, rationale: 'Entre NiceJob Pro ($125) e pacotes de agência ($179–$297). Inclui displays 3D com a marca, que concorrentes vendem à parte.' },
      { id: 'premium', label: 'Premium', value: 19700, rationale: 'Próximo do típico de agência ($179–$297). Faz sentido quando junto com gestão de Google Business Profile.' },
    ],
    recommendedOptionId: 'mid',
    evidence: [
      { label: 'NiceJob Reviews / Pro', value: '$75 / $125 por mês', sourceUrl: 'https://reviewrover.co/compare/nicejob' },
      { label: 'GatherUp (1 local)', value: '$99/mês', sourceUrl: 'https://gatherup.com/pricing/' },
      { label: 'Agência: Local Lead Pros', value: '$197 setup + $97/mês', sourceUrl: 'https://localleadpros.com' },
      { label: 'Agência: Netblaze / Skylift (pacote completo)', value: '$297/mês', sourceUrl: 'https://skyliftweb.com/pricing' },
      { label: 'Birdeye / Podium (enterprise)', value: '~$299–$399/mês', sourceUrl: 'https://www.truereview.co/post/birdeye-pricing-explained-and-cheaper-alternatives' },
    ],
  },
  {
    id: 'service:reviews-setup',
    group: 'dockplus-pricing',
    title: 'Reviews Machine — setup',
    question: 'Quanto cobrar de setup (inclui 3 displays NFC + QR impressos pela Farmz3D)?',
    owner: 'thiago',
    unit: 'usd_cents',
    unitCostCents: 1500,
    options: [
      { id: 'low', label: 'Só cobre os displays', value: 19700, rationale: 'Mesmo setup da Local Lead Pros ($197). Os 3 displays sozinhos valem $75–$120 no varejo.' },
      { id: 'mid', label: 'Displays + configuração', value: 29700, rationale: '3 displays (varejo $25–$40 cada) + página personalizada + treinamento da equipe.' },
      { id: 'high', label: 'Premium', value: 49700, rationale: 'Acima do mercado de agência ($0–$350). Só se incluir visita presencial e fotos dos displays na loja.' },
    ],
    recommendedOptionId: 'mid',
    evidence: [
      { label: 'Display NFC Google (varejo)', value: '$40 un · $25 em 5+', sourceUrl: 'https://zappycards.com/products/nfc-google-review-stand' },
      { label: 'Display NFC premium', value: '$29.99–$105', sourceUrl: 'https://thestarcompany.co/collections/google-review-stand' },
      { label: 'Broadly onboarding', value: '$350', sourceUrl: 'https://broadly.com/pricing-ai-workforce' },
      { label: 'Setup agência típico', value: '$0–$197', sourceUrl: 'https://netblazedigital.com/pricing' },
    ],
  },
  {
    id: 'service:missed-call-monthly',
    group: 'dockplus-pricing',
    title: 'Missed-Call Text-Back — mensalidade',
    question: 'Quanto cobrar por mês pelo SMS automático de ligação perdida?',
    owner: 'thiago',
    unit: 'usd_cents',
    unitCostCents: 1200,
    options: [
      { id: 'entry', label: 'Entrada', value: 9700, rationale: 'Mesmo preço de Korva (200 SMS) e de revendedores GoHighLevel. Custo Twilio ~$12/mês.' },
      { id: 'mid', label: 'Meio de mercado', value: 14700, rationale: 'Entre $97 e $297 (faixa típica). Boa margem sobre o custo de ~$12/mês.' },
      { id: 'high', label: 'Alto', value: 19700, rationale: 'Igual ao Korva ilimitado; justificável com relatório mensal de leads recuperados.' },
    ],
    recommendedOptionId: 'mid',
    evidence: [
      { label: 'Korva', value: '$97 / $197 / $297 por mês', sourceUrl: 'https://recoverlyhq.com/blog/best-missed-call-text-back-software-2026' },
      { label: 'Agência Big Bang Digital', value: '$297 setup + $297/mês', sourceUrl: 'https://www.alignable.com/atlanta-ga/big-bang-digital/missed-call-text-back' },
      { label: 'CallRail Lead Tracking', value: '$50–$55/mês', sourceUrl: 'https://www.nimbata.com/blog/callrail-pricing-guide' },
      { label: 'Twilio: número local + campanha 10DLC', value: '$1.15 + $10 por mês', sourceUrl: TWILIO_10DLC },
      { label: 'Twilio: SMS', value: '$0.0083 + taxa operadora ~$0.004', sourceUrl: TWILIO_SMS },
    ],
  },
  {
    id: 'service:missed-call-setup',
    group: 'dockplus-pricing',
    title: 'Missed-Call Text-Back — setup',
    question: 'Quanto cobrar de setup (número, registro A2P 10DLC de $61, configuração)?',
    owner: 'thiago',
    unit: 'usd_cents',
    unitCostCents: 6100,
    options: [
      { id: 'cost', label: 'Repasse de custo', value: 9700, rationale: 'Cobre os $61 do 10DLC com pouca margem. Usado por quem quer fechar rápido (Enzak $99).' },
      { id: 'mid', label: 'Padrão de mercado', value: 19700, rationale: 'Igual a Netblaze ($197 para A2P e telefone). Cobre custo e seu tempo.' },
      { id: 'high', label: 'Alto', value: 29700, rationale: 'Igual a Big Bang Digital ($297). Mais difícil de vender sozinho.' },
    ],
    recommendedOptionId: 'mid',
    evidence: [
      { label: 'Twilio 10DLC marca + vetting', value: '$46 + $15 (uma vez)', sourceUrl: TWILIO_10DLC },
      { label: 'Netblaze (A2P + telefone)', value: '$197', sourceUrl: 'https://netblazedigital.com/pricing' },
      { label: 'Enzak / BookEveryJob', value: '$99', sourceUrl: 'https://recoverlyhq.com/blog/best-missed-call-text-back-software-2026' },
    ],
  },
  {
    id: 'service:bundle-monthly',
    group: 'dockplus-pricing',
    title: 'Kit completo (Reviews + Missed-Call) — mensalidade',
    question: 'Quanto cobrar por mês pelos dois serviços juntos?',
    owner: 'thiago',
    unit: 'usd_cents',
    options: [
      { id: 'discount', label: 'Com desconto', value: 24700, rationale: '~16% abaixo da soma recomendada ($294). Abaixo dos pacotes all-in-one de agência ($297).' },
      { id: 'market', label: 'Preço de pacote de agência', value: 29700, rationale: 'Igual a Skylift / Netblaze / J1 Systems ($297), que incluem site. Sem site, fica caro.' },
      { id: 'sum', label: 'Soma sem desconto', value: 29400, rationale: 'Sem incentivo para comprar o kit.' },
    ],
    recommendedOptionId: 'discount',
    evidence: [
      { label: 'Skylift Growth (site + text-back + reviews)', value: '$297/mês sem setup', sourceUrl: 'https://skyliftweb.com/pricing' },
      { label: 'J1 Systems', value: '$297/mês', sourceUrl: 'https://j1systems.pro/how-much-does-a-website-cost' },
      { label: 'Podium Core', value: '~$399/mês', sourceUrl: 'https://www.truereview.co/post/podium-pricing-explained-is-it-worth-it-in-2026' },
    ],
  },
  {
    id: 'service:bundle-setup',
    group: 'dockplus-pricing',
    title: 'Kit completo — setup',
    question: 'Quanto cobrar de setup no kit?',
    owner: 'thiago',
    unit: 'usd_cents',
    unitCostCents: 7600,
    options: [
      { id: 'discount', label: 'Com desconto', value: 39700, rationale: 'Abaixo da soma dos setups recomendados ($494). Cobre displays + 10DLC ($76 de custo).' },
      { id: 'sum', label: 'Soma', value: 49400, rationale: 'Soma sem desconto.' },
      { id: 'waived', label: 'Sem setup (contrato de 6 meses)', value: 0, rationale: 'Como a Skylift. Só com contrato mínimo para não perder o custo inicial.' },
    ],
    recommendedOptionId: 'discount',
    evidence: [
      { label: 'Skylift / Netblaze', value: 'setup $0 (isento)', sourceUrl: 'https://netblazedigital.com/pricing' },
      { label: 'Broadly', value: '$350 onboarding', sourceUrl: 'https://broadly.com/pricing-ai-workforce' },
    ],
  },
];
