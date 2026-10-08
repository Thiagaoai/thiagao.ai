'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Boxes,
  Braces,
  BrainCircuit,
  Cable,
  Code2,
  Database,
  Gift,
  Globe,
  LineChart,
  MessageCircle,
  PhoneMissed,
  PlugZap,
  Rocket,
  ServerCog,
  ShieldCheck,
  Star,
  Terminal,
  WandSparkles,
  Workflow,
} from 'lucide-react';
import { motion } from 'motion/react';
import { BRAND_NAME, BrandMark } from '../BrandMark';
import SubscribeForm from '../../briefing/SubscribeForm';
import LazyVideo from './LazyVideo';
import Lighthouse from './Lighthouse';
import NightSky from './NightSky';
import HandsJourney from './HandsJourney';
import StackGlossary, { type StackGroup } from './StackGlossary';

// Home built on a cinematic brief: one fullscreen looping video gives the hero
// all of its depth, navigation and buttons are liquid glass, headings are
// Instrument Serif, and the palette is navy with white and muted gray only.

export type HomePost = {
  slug: string;
  title: string;
  dek: string;
  category: string;
  readingMinutes: number;
  publishedAt: string | null;
};

const postDateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

function formatPostDate(iso: string | null) {
  if (!iso) return 'Em edição';
  return postDateFormatter.format(new Date(iso)).replace('.', '');
}

const CONTACT_URL = 'https://wa.me/17742077924';
const TELEGRAM_URL = 'https://t.me/thiagaoai';
const EMAIL_URL = 'mailto:dockplus@dockplusai.com';
const BRAND_DOMAIN = 'thiagao.io';
const BRAND_URL = 'https://thiagao.io';
const INSTAGRAM_URL = 'https://instagram.com/thiagaoAi';
const SOLO_CODANDO_URL = 'https://instagram.com/solocodando';
const DOCKPLUS_URL = 'https://dockplusai.io';

// 8-second cinematic loop (local file, H.264, faststart) with a poster for first paint.
const HERO_VIDEO = '/media/hero.mp4';
const HERO_POSTER = '/media/hero-poster.webp';
const BUILD_STAMP = process.env.NEXT_PUBLIC_BUILD_STAMP;

const media = {
  // Second 8-second scene from the same family as the hero: the network sphere.
  agents: { src: '/media/agents.mp4', poster: '/media/agents-poster.webp' },
  // Stills cut from the hero video so the sections stay in the same night.
  laptop: '/media/hero-still-laptop.webp',
  house: '/media/hero-still-house.webp',
  wide: '/media/hero-still-wide.webp',
};

const navItems = [
  { label: 'Início', href: '#top', active: true },
  { label: 'Skills', href: '#skills' },
  { label: 'Casos', href: '#cases' },
  { label: 'Newsletter', href: '#newsletter' },
  { label: 'Contato', href: '#social' },
];

const tickerItems = [
  'AI agents customizados',
  'n8n + APIs',
  'Next.js',
  'TypeScript',
  'Vercel AI SDK',
  'OpenAI Agents SDK',
  'LangGraph',
  'LangSmith',
  'Make',
  'GoHighLevel',
  'Claude Code',
  'Claude Cowork',
  'Gemini',
  'ComfyUI',
  'Pinokio',
  'Railway',
  'VPS',
  'Bun',
  'Python',
  'MCP servers',
  'CRM + WhatsApp',
  'RAG + embeddings',
  'Landing pages premium',
  '@thiagaoAi',
  '@solocodando',
];

const stats = [
  { value: '21+', label: 'anos nos EUA' },
  { value: '6', label: 'negócios operados' },
  { value: '3', label: 'produtos próprios no ar' },
  { value: '1', label: 'briefing de IA por dia' },
];

// Each tool carries a one-line explanation (what it is, what Thiago uses it for)
// that StackGlossary reveals on hover or tap.
const stackGroups: StackGroup[] = [
  {
    title: 'Dev',
    items: [
      { name: 'Next.js', about: 'Framework React para sites e apps web com renderização no servidor e rotas de API. É a base deste site e das landing pages que entrego.' },
      { name: 'TypeScript', about: 'JavaScript com tipos. Pega erro antes de rodar e deixa o código de sites, agentes e integrações mais seguro de manter.' },
      { name: 'Java', about: 'Linguagem robusta e tipada, muito usada em sistemas corporativos e Android. Uso em backends e integrações que pedem estabilidade e escala.' },
      { name: 'Bun', about: 'Runtime JavaScript rápido, com gerenciador de pacotes e bundler embutidos. Uso para scripts, servidores leves e builds mais ágeis.' },
      { name: 'Python', about: 'Linguagem versátil e fácil de ler. Minha escolha para automações, scripts, raspagem de dados, APIs e tudo que envolve IA e dados.' },
      { name: 'Node.js', about: 'JavaScript rodando no servidor. Sustenta APIs, bots, webhooks e as automações que precisam ficar no ar 24/7.' },
      { name: 'Nodes', about: 'Nós customizados para n8n: quando um passo não existe pronto, eu escrevo o nó em código e ele vira peça reutilizável nos fluxos.' },
      { name: 'VS Code', about: 'Editor de código onde eu trabalho, com agentes de IA integrados ao projeto para revisar, refatorar e testar.' },
      { name: 'Cursor', about: 'Editor baseado no VS Code com IA nativa. Uso para prototipar rápido e para edições guiadas em bases grandes.' },
      { name: 'Terminal', about: 'Linha de comando: deploy, logs, servidores, git e agentes de código. É onde a maior parte do trabalho real acontece.' },
    ],
  },
  {
    title: 'Automação',
    items: [
      { name: 'n8n', about: 'Plataforma de automação visual e open source que conecta APIs, bancos e IA em fluxos. Meu orquestrador principal: captura de lead, CRM, follow-up e agentes.' },
      { name: 'Make', about: 'Automação visual na nuvem (ex-Integromat). Uso em cenários mais simples ou quando o cliente já opera nele.' },
      { name: 'GHL', about: 'GoHighLevel: CRM com funis, agendamento, SMS e e-mail para negócios locais. Conecto automações e IA por cima dele.' },
      { name: 'APIs', about: 'Interfaces que deixam sistemas conversarem entre si. Integro as existentes e crio APIs próprias para expor dados e ações.' },
      { name: 'Webhooks', about: 'Avisos automáticos que um sistema envia quando algo acontece: novo lead, pagamento, mensagem. São o gatilho de quase toda automação.' },
      { name: 'CRM', about: 'Sistema de relacionamento com clientes. Monto e integro CRMs para que lead, conversa e venda fiquem registrados e acionáveis.' },
      { name: 'Telegram Bots', about: 'Bots que recebem comandos e mensagens no Telegram. Uso para alertas, aprovações, atendimento e controle de automações pelo celular.' },
      { name: 'Sites', about: 'Sites e landing pages conectados à operação: o formulário entra no CRM, dispara automação e alimenta o funil.' },
    ],
  },
  {
    title: 'IA / Agents',
    items: [
      { name: 'OpenAI', about: 'Modelos GPT e o Agents SDK. Uso em chatbots, classificação, extração de dados e agentes com ferramentas.' },
      { name: 'Claude Code', about: 'Agente de programação da Anthropic que trabalha direto no repositório. É com ele que eu construo e mantenho boa parte dos projetos.' },
      { name: 'Claude Cowork', about: 'Versão do Claude para trabalhar em pastas e documentos, fora do código. Uso para pesquisa, planejamento e material de cliente.' },
      { name: 'Gemini', about: 'Modelos do Google, fortes em contexto longo, imagem e vídeo. Uso em análise de documentos e geração multimodal.' },
      { name: 'LangGraph', about: 'Biblioteca para montar agentes como grafos com estado, ramificações e retomada. Serve para fluxos de IA que precisam ir para produção.' },
      { name: 'LangSmith', about: 'Observabilidade para apps de IA: rastreia cada passo do agente, avalia respostas e ajuda a depurar comportamento.' },
      { name: 'LLM', about: 'Modelo de linguagem grande, o motor por trás de ChatGPT, Claude e Gemini. Escolho o modelo certo para cada tarefa e custo.' },
      { name: 'Fine-tune', about: 'Treinar um modelo com exemplos do próprio negócio para ele responder no tom e no formato certos.' },
      { name: 'Agents', about: 'Sistemas de IA que planejam, usam ferramentas e executam tarefas em vez de só responder. É o centro do que eu entrego hoje.' },
    ],
  },
  {
    title: 'Labs / Infra',
    items: [
      { name: 'OpenClaw', about: 'Agente de IA open source que roda na sua própria máquina ou VPS e conversa por WhatsApp, Telegram e outros canais. Testo como assistente pessoal e operacional.' },
      { name: 'Hermes Nous', about: 'Agente open source da Nous Research, com memória e habilidades que evoluem com o uso. Estou explorando para tarefas autônomas longas.' },
      { name: 'Manus', about: 'Agente autônomo que executa tarefas de ponta a ponta na web: pesquisa, navega e entrega o resultado. Uso em pesquisa e prototipagem.' },
      { name: 'ComfyUI', about: 'Editor em nós para geração de imagem e vídeo com IA. Uso para criar material visual e automatizar pipelines criativos.' },
      { name: 'Pinokio', about: 'Instalador de apps de IA locais com um clique. Deixa testar modelos e ferramentas no próprio computador sem configurar nada na mão.' },
      { name: 'VPS', about: 'Servidor virtual próprio onde rodam n8n, bots e agentes 24/7, com controle total de custo e dados.' },
      { name: 'Railway', about: 'Plataforma de deploy que sobe apps, bancos e workers a partir do GitHub. Uso para publicar APIs e serviços rápido.' },
      { name: 'MCP', about: 'Model Context Protocol: padrão aberto para conectar agentes de IA a ferramentas e dados. Construo servidores MCP para os agentes acessarem sistemas reais.' },
    ],
  },
];

const skills = [
  {
    icon: Workflow,
    title: 'Automação de processos',
    text: 'Crio fluxos que tiram trabalho repetitivo da operação: entrada de lead, qualificação, follow-up, CRM, planilhas e notificações.',
    points: ['n8n avançado', 'Make / Maker', 'GoHighLevel / GHL', 'Telegram Bots e WhatsApp'],
  },
  {
    icon: BrainCircuit,
    title: 'Agentes de IA',
    text: 'Desenho agentes com ferramentas, memória, guardrails e handoffs. A IA não fica só no chat: ela executa tarefas em sistemas reais.',
    points: ['OpenAI Agents SDK', 'Claude Code / Cowork', 'Gemini / Manus / OpenClaw', 'RAG, LLM e fine-tune'],
  },
  {
    icon: Boxes,
    title: 'LangGraph + LangSmith',
    text: 'Monto fluxos agentic com estado, ramificações, observabilidade, tracing, avaliação e debugging para sair do protótipo e ir para produção.',
    points: ['LangGraph workflows', 'LangSmith tracing', 'Evals e datasets', 'Monitoramento de agentes'],
  },
  {
    icon: Braces,
    title: 'Sites e landing pages',
    text: 'Faço sites modernos com copy, design, performance e integração com automação. Cada página vira uma peça do funil.',
    points: ['Next.js / React', 'Bun / Node.js', 'VPS / Railway', 'Formulários conectados'],
  },
  {
    icon: Bot,
    title: 'Chatbots customizados',
    text: 'Construo assistentes para atendimento, vendas, FAQ, captação e suporte, treinados no contexto de cada negócio.',
    points: ['WhatsApp e Telegram', 'Webchat no site', 'Qualificação de leads', 'Escalação humana'],
  },
  {
    icon: ServerCog,
    title: 'Integrações e backend',
    text: 'Conecto ferramentas que normalmente ficam soltas: banco de dados, dashboards, CRM, pagamentos, arquivos e APIs.',
    points: ['Python / TypeScript', 'Terminal / VS Code / Cursor', 'Nodes customizados', 'Jobs e filas leves'],
  },
  {
    icon: LineChart,
    title: 'Soluções customizadas',
    text: 'Além de automação e site, desenho soluções sob medida para operação, vendas, dados, conteúdo e atendimento.',
    points: ['Dashboards e BI', 'Scraping e enrichment', 'SEO + conteúdo', 'Treinamentos e SOPs'],
  },
];

const projects = [
  {
    icon: Rocket,
    title: 'DockPlus AI',
    label: 'dockplusai.io',
    href: DOCKPLUS_URL,
    text: 'Empresa de automação e IA aplicada para negócios. O foco é construir sistemas customizados: chatbots, captura de leads, CRM, atendimento 24/7 e integrações.',
  },
  {
    icon: Terminal,
    title: 'Solo Codando',
    label: '@solocodando',
    href: SOLO_CODANDO_URL,
    text: 'Canal/dev log para mostrar construção real: Claude Code, Next.js, automações, agentes, erros, refactors e bastidores de produto.',
  },
  {
    icon: Globe,
    title: BRAND_NAME,
    label: BRAND_DOMAIN,
    href: BRAND_URL,
    text: 'Minha base pessoal: skills, ideias, newsletter, novidades e builds públicos sobre IA, automação, sites e operação.',
  },
  {
    icon: Database,
    title: 'Labs de automação',
    label: 'n8n + IA + CRM',
    href: '#newsletter',
    text: 'Biblioteca de fluxos reutilizáveis para lead capture, análise de mensagem, criação de oportunidade, follow-up e relatórios.',
  },
];

const currentContext = [
  {
    icon: WandSparkles,
    title: 'AI apps multi-modelo',
    text: 'O AI SDK continua forte para apps TypeScript/Next, abstraindo providers e reduzindo boilerplate para chat, JSON estruturado e tools.',
  },
  {
    icon: ShieldCheck,
    title: 'Agentes com sandbox',
    text: 'Agents modernos precisam rodar tarefas em ambientes isolados, com snapshots, guardrails e retomada de estado para trabalhos longos.',
  },
  {
    icon: PlugZap,
    title: 'n8n como orquestrador',
    text: 'O AI Agent do n8n trabalha como Tools Agent: conecta ferramentas e APIs para decidir e agir dentro de workflows reais.',
  },
  {
    icon: Cable,
    title: 'MCP em produção',
    text: 'MCP virou camada importante para conectar agentes a ferramentas, dados e sistemas, com foco 2026 em escala, governança e enterprise readiness.',
  },
  {
    icon: Boxes,
    title: 'LangGraph + LangSmith',
    text: 'Para agentes mais sérios, uso grafos, estado, tracing, datasets e avaliações para depurar comportamento, não só prompt.',
  },
  {
    icon: Code2,
    title: 'Soluções sob medida',
    text: 'O foco é custom: automação, site, agente, dashboard, CRM, chatbot e integração montados para o processo de cada cliente.',
  },
];

const cases = [
  {
    icon: Star,
    label: 'DockPlus AI',
    title: 'Reviews Machine',
    text: 'O cliente encosta o celular num stand NFC ou lê o QR e dá a nota em cinco segundos. Quatro ou cinco estrelas vão direto para o Google; uma a três viram mensagem privada para o dono resolver antes de virar público.',
    stack: ['Next.js', 'Supabase', 'NFC + QR'],
    href: '/reviews-machine',
    demo: '/r/demo',
  },
  {
    icon: PhoneMissed,
    label: 'DockPlus AI',
    title: 'Missed-Call Text-Back',
    text: 'Chamada perdida no número do negócio vira, em segundos, um SMS automático de volta. O lead responde por texto em vez de ligar para o concorrente.',
    stack: ['Twilio Voice + SMS', 'Next.js', 'Webhooks'],
    href: '/reviews-machine',
  },
  {
    icon: Gift,
    label: 'Loja própria',
    title: 'Farmz3D',
    text: 'Loja de presentes impressos em 3D com 34 produtos, pedido personalizado, painel de operação e triagem dos pedidos por um classificador tipado (Jev / TypeSafe AI).',
    stack: ['Next.js', 'three.js', 'Supabase', 'TypeSafe AI'],
    href: '/farmz3d',
  },
];

const newsletterTopics = [
  'prompts úteis para devs e founders',
  'fluxos n8n explicados sem enrolação',
  'Make, GHL, Railway, VPS e deploy real',
  'templates de landing page + automação',
  'LangGraph, LangSmith, MCP, RAG e tool calling',
  'bastidores da DockPlus AI e Solo Codando',
];

const footerColumns: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Site',
    links: [
      { label: 'Skills', href: '#skills' },
      { label: 'Casos', href: '#cases' },
      { label: 'Projetos', href: '#projects' },
      { label: 'Newsletter', href: '#newsletter' },
    ],
  },
  {
    heading: 'Canais',
    links: [
      { label: '@thiagaoAi', href: INSTAGRAM_URL },
      { label: '@solocodando', href: SOLO_CODANDO_URL },
      { label: 'DockPlus AI', href: DOCKPLUS_URL },
    ],
  },
  {
    heading: 'Contato',
    links: [
      { label: 'WhatsApp', href: CONTACT_URL },
      { label: 'Telegram', href: TELEGRAM_URL },
      { label: 'Email', href: EMAIL_URL },
      { label: 'Instagram', href: INSTAGRAM_URL },
    ],
  },
  {
    heading: 'Stack',
    links: [
      { label: 'LangGraph', href: '#full-stack' },
      { label: 'LangSmith', href: '#full-stack' },
      { label: 'Next.js', href: '#full-stack' },
      { label: 'n8n', href: '#full-stack' },
    ],
  },
];

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
} as const;

const cardClass = 'rounded-[28px] border border-white/10 bg-background/60 p-7 transition-colors duration-500 hover:border-glow/30';
const chipClass = 'rounded-full border border-white/10 px-3 py-1.5 text-xs text-foreground/80';

function GlassLink({ href, children, className = '', glow = false }: { href: string; children: ReactNode; className?: string; glow?: boolean }) {
  return (
    <a
      href={href}
      className={`liquid-glass inline-flex items-center justify-center gap-2 rounded-full text-foreground transition-[transform,box-shadow] duration-300 hover:scale-[1.03] ${glow ? 'hover:shadow-[0_0_0_1px_hsl(var(--glow)/0.55),0_0_32px_hsl(var(--glow)/0.3)]' : ''} ${className}`}
    >
      {children}
    </a>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="liquid-glass mb-6 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
      <span className="beacon" aria-hidden="true" />
      {children}
    </span>
  );
}

function Heading({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`font-display text-4xl font-normal leading-[0.98] tracking-[-0.02em] text-foreground sm:text-5xl md:text-6xl ${className}`}>
      {children}
    </h2>
  );
}

function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display whitespace-nowrap tracking-tight text-foreground ${className}`}>
      Thiagao{' '}
      <span className="bg-gradient-to-r from-amber-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">Ai</span>
    </span>
  );
}

function FloatingWhatsAppButton() {
  return (
    <a
      href={CONTACT_URL}
      aria-label="Falar com Thiago no WhatsApp"
      className="fixed bottom-5 right-5 z-50 block transition-transform hover:scale-[1.03] sm:bottom-7 sm:right-7"
    >
      <span className="liquid-glass flex items-center gap-3 rounded-full px-4 py-3 text-sm text-foreground">
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:block">Falar no WhatsApp</span>
      </span>
    </a>
  );
}

export default function HomePage({ posts }: { posts: HomePost[] }) {
  // The page background lives on <body>: the starfield and the hands sit at a
  // negative z-index, under every section's text, and a background here would
  // paint over them.
  return (
    <div className="min-h-screen text-foreground">
      <NightSky />
      <HandsJourney />
      <FloatingWhatsAppButton />

      <div id="top" className="relative flex min-h-screen flex-col overflow-hidden">
        <video
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />

        <nav aria-label="Navegação principal" className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6">
          <a href="#top" aria-label={BRAND_NAME} className="flex items-center gap-3">
            <BrandMark className="h-8 w-8" />
            <Wordmark className="text-3xl" />
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors hover:text-foreground ${item.active ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <GlassLink href={CONTACT_URL} className="whitespace-nowrap px-5 py-2.5 text-sm sm:px-6">
            Começar um projeto
          </GlassLink>
        </nav>

        <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-40 pt-32 text-center">
          <h1 className="animate-fade-rise font-display max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl">
            IA e automação <em className="not-italic text-muted-foreground">feitas à mão</em>
            <br className="hidden md:block" /> para negócios <em className="not-italic text-muted-foreground">reais.</em>
          </h1>
          <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Construo agentes de IA, automações e sites sob medida para operações que precisam funcionar todo
            dia. Sem pacote genérico: cada sistema nasce do processo real do negócio.
          </p>
          <GlassLink href={CONTACT_URL} className="animate-fade-rise-delay-2 mt-12 cursor-pointer px-14 py-5 text-base">
            Começar um projeto
          </GlassLink>
        </section>
      </div>

      <section id="full-stack" className="relative border-y border-white/10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <SectionLabel>Stack completo</SectionLabel>
              <Heading className="max-w-3xl">Ferramentas que uso para criar soluções.</Heading>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              Por área: o que entra no dia a dia de dev, automação, IA, agentes, labs e infra. Sem lista de
              vitrine, só o que uso em projeto. Toque em qualquer ferramenta para ver o que é e para que eu uso.
            </p>
          </div>

          <StackGlossary groups={stackGroups} cardClass={cardClass} chipClass={chipClass} />
        </div>
      </section>

      <section className="relative border-b border-white/10">
        <div className="overflow-hidden border-b border-white/10 py-5">
          <div className="animate-ticker flex w-max gap-10 text-sm uppercase tracking-[0.28em] text-muted-foreground">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={`${item}-${index}`} className="whitespace-nowrap">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className={`border-white/10 p-10 md:p-12 ${index < 3 ? 'border-b md:border-b-0 md:border-r' : ''}`}>
              <div className="font-display text-6xl tracking-tight text-glow [text-shadow:0_0_24px_hsl(var(--glow)/0.35)]">{stat.value}</div>
              <div className="mt-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="agentes" className="relative overflow-hidden border-t border-white/10">
        {/* Wide screens: the clip is the backdrop of the whole section, kept clear on the left and darkened toward
            the copy. Below lg the section is several times taller than it is wide, and object-cover would crop the
            2.4:1 scene to a ~12% sliver of sky, so phones get their own framed copy of the clip inside the grid. */}
        <div className="absolute inset-0 z-0 hidden lg:block">
          <LazyVideo
            src={media.agents.src}
            poster={media.agents.poster}
            className="h-full w-full object-cover object-[0%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/75 to-background/95" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 py-32 lg:min-h-[820px] lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          {/* Phones and tablets: the clip sits above the copy, framed on Thiago and the sphere (left 40% of the frame). */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-white/10 sm:aspect-[16/10] lg:hidden">
            <LazyVideo
              src={media.agents.src}
              poster={media.agents.poster}
              className="h-full w-full object-cover object-[20%_center] sm:object-[10%_center]"
            />
          </div>
          <div className="hidden lg:block" />
          <div>
            <SectionLabel>O que está movendo dev + IA</SectionLabel>
            <Heading>
              Agentes que
              <br />
              <em className="not-italic text-glow">trabalham com você.</em>
            </Heading>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Trabalho em cima do que está relevante agora: agentes com ferramentas, sandboxes, MCP, AI SDK,
              n8n e automações conectadas ao negócio.
            </p>
            <div className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {currentContext.map((item, index) => (
                <motion.div key={item.title} {...reveal} transition={{ delay: index * 0.06, duration: 0.5 }} className="flex gap-3">
                  <span className="beacon mt-2 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-display text-xl leading-tight text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="relative border-t border-white/10 py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <SectionLabel>Skills principais</SectionLabel>
              <Heading>
                Skills de dev para
                <br />
                <em className="not-italic text-glow">automatizar tudo.</em>
              </Heading>
            </div>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Eu faço automação, site, agentes de IA, chatbot, integração, LangGraph, LangSmith e demais
              soluções customizadas. A proposta é simples: transformar operação manual em software útil.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <motion.article
                  key={skill.title}
                  {...reveal}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  className={`${cardClass} flex min-h-[440px] flex-col p-8`}
                >
                  <span className="liquid-glass flex h-12 w-12 items-center justify-center rounded-2xl text-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-10 text-3xl leading-tight text-foreground">{skill.title}</h3>
                  <p className="mt-5 text-base leading-relaxed text-muted-foreground">{skill.text}</p>
                  <ul className="mt-auto grid gap-3 pt-10 text-sm text-foreground/80">
                    {skill.points.map((point) => (
                      <li key={point} className="flex items-center gap-3">
                        <span className="beacon scale-75" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="cases" className="relative border-t border-white/10 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <SectionLabel>Casos reais</SectionLabel>
              <Heading className="max-w-3xl">Produtos no ar, não slides.</Heading>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              Três sistemas construídos e publicados a partir deste mesmo código, cada um com site, automação
              e IA no mesmo lugar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {cases.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  {...reveal}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`${cardClass} group flex flex-col`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                  <h3 className="font-display mt-8 text-3xl leading-tight text-foreground">{item.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {item.stack.map((tag) => (
                      <span key={tag} className={chipClass}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-wrap gap-5 pt-8 text-sm text-foreground">
                    <a href={item.href} className="inline-flex items-center gap-2 transition-colors hover:text-muted-foreground">
                      Ver produto <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                    {item.demo ? (
                      <a href={item.demo} className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                        Testar demo
                      </a>
                    ) : null}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="newsletter" className="relative border-t border-white/10 py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative order-2 h-[560px] overflow-hidden rounded-[32px] border border-white/10 lg:order-1">
            <Image
              src={media.laptop}
              alt="Thiago trabalhando no notebook à noite, na costa de Cape Cod"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="kenburns object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="liquid-glass rounded-[22px] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Diário de bordo</p>
                <p className="font-display mt-3 text-2xl leading-tight text-foreground">
                  Bastidores do que estou montando, quebrando e melhorando.
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <SectionLabel>Diário de bordo</SectionLabel>
            <Heading>
              Newsletter de
              <br />
              automação e IA.
            </Heading>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Um dev log direto sobre o que estou criando com IA, automações, sites, agentes, DockPlus AI e
              Solo Codando. Conteúdo para quem quer construir, não só consumir hype.
            </p>
            <div className="mt-10 max-w-xl">
              <SubscribeForm source="home" />
            </div>
            <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              {newsletterTopics.map((topic) => (
                <div key={topic} className="rounded-2xl border border-white/10 px-4 py-3">
                  {topic}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="projects"
        className="relative flex min-h-[960px] flex-col justify-end overflow-hidden border-t border-white/10 px-6 py-32"
      >
        {/* Wide screens: the still is the backdrop. Below lg it would be a blurry 9% sliver of sky (same crop
            problem as the agents clip), so it gets a framed block above the heading instead. */}
        <div className="absolute inset-0 z-0 hidden overflow-hidden lg:block">
          <Image src={media.wide} alt="" fill sizes="100vw" className="kenburns object-cover object-top" />
          <div className="absolute inset-0 bg-background/70" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="relative mb-14 aspect-[4/5] overflow-hidden rounded-[32px] border border-white/10 sm:aspect-[16/10] lg:hidden">
            {/* Framed on the lighthouse, the house and Thiago at the laptop (right 60% of the frame). The box is
                taller than the 2.4:1 still, so the image renders ~2.4x the box height wide: ask for a wide candidate. */}
            <Image
              src={media.wide}
              alt="Praia de Cape Cod à noite, com o farol, a casa e Thiago trabalhando no notebook"
              fill
              sizes="(min-width: 640px) 160vw, 250vw"
              className="kenburns object-cover object-[64%_center] sm:object-[70%_center]"
            />
          </div>
          <SectionLabel>Projetos e canais</SectionLabel>
          <Heading className="max-w-4xl">
            Onde estou
            <br />
            construindo agora.
          </Heading>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Três frentes, um processo: DockPlus AI atende clientes, {BRAND_NAME} compartilha o que eu aprendo e
            @solocodando mostra o código.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
            {projects.map((project, index) => {
              const Icon = project.icon;
              return (
                <motion.article
                  key={project.title}
                  {...reveal}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="liquid-glass group rounded-[28px] p-7"
                >
                  <div className="flex items-start justify-between gap-5">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                    <a
                      href={project.href}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:text-foreground"
                    >
                      {project.label}
                    </a>
                  </div>
                  <h3 className="font-display mt-8 text-3xl leading-tight text-foreground">{project.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{project.text}</p>
                  <a href={project.href} className="mt-8 inline-flex items-center gap-2 text-sm text-foreground">
                    Abrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="updates" className="relative border-t border-white/10 py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <SectionLabel>Novidades</SectionLabel>
              <Heading>
                Últimas edições
                <br />
                do briefing.
              </Heading>
            </div>
            <Link href="/newsletter" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
              Ver todas as edições <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className={`${cardClass} text-base text-muted-foreground`}>
              A próxima edição está sendo preparada. Assine para receber por email.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {posts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  {...reveal}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  className="group rounded-[28px] border border-white/10 bg-white/[0.04] transition-colors hover:bg-white/[0.07]"
                >
                  <a href={`/newsletter/${post.slug}`} className="block p-8">
                    <div className="flex items-center justify-between gap-4">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatPostDate(post.publishedAt)} · {post.readingMinutes} min
                      </span>
                    </div>
                    <h3 className="font-display mt-10 max-w-xl text-3xl leading-tight text-foreground">{post.title}</h3>
                    <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">{post.dek}</p>
                    <div className="mt-10 inline-flex items-center gap-2 text-sm text-foreground">
                      Ler briefing <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </a>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative border-t border-white/10 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <div className="relative min-h-[520px] overflow-hidden rounded-[32px] border border-white/10">
              <Image
                src={media.house}
                alt="Casa e farol à beira-mar em Cape Cod, à noite"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="kenburns object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="liquid-glass rounded-[22px] p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Modo de operação</p>
                  <p className="font-display mt-3 text-2xl leading-tight text-foreground">
                    Aprendendo em público, construindo para clientes e transformando operação em software.
                  </p>
                </div>
              </div>
            </div>
            <div className={`${cardClass} md:p-12`}>
              <SectionLabel>Sobre</SectionLabel>
              <Heading>
                Dev, operador
                <br />
                e builder de IA.
              </Heading>
              <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
                Sou Thiago do Carmo, brasileiro em Cape Cod, MA. Construo sites, automações e sistemas com IA
                sob medida. A DockPlus AI é a operação comercial; @solocodando é o canal de dev; {BRAND_NAME} é
                minha marca pessoal para compartilhar o processo.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {[
                  ['DockPlus AI', 'Soluções de IA, chatbots, automação, Telegram bots, leads e CRM para negócios.'],
                  ['Solo Codando', 'Canal para mostrar código, ferramentas, bugs, decisões e builds reais.'],
                  [BRAND_NAME, 'Instagram e marca pessoal para IA aplicada, automação e dev lifestyle.'],
                  ['Custom first', 'Nada de pacote genérico: cada sistema nasce do processo real do cliente.'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-white/10 p-5">
                    <h3 className="font-display text-xl text-foreground">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="social" className="relative overflow-hidden border-t border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(60%_70%_at_85%_100%,hsl(var(--glow)/0.16),transparent)]"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-40 text-center">
          <span className="liquid-glass mx-auto mb-14 flex h-20 w-20 items-center justify-center rounded-[24px]">
            <BrandMark className="h-10 w-10" />
          </span>
          <h2 className="font-display text-5xl font-normal leading-[0.95] tracking-[-0.03em] text-foreground sm:text-7xl">
            Bora dar um
            <br />
            <em className="not-italic text-glow">upgrade nesse build.</em>
          </h2>
          <p className="mx-auto mt-9 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Me acompanha no {BRAND_NAME}, entra no fluxo do @solocodando ou fala comigo para criar automação,
            site, chatbot ou agente de IA customizado.
          </p>
          <div className="mt-14 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <GlassLink href={CONTACT_URL} glow className="px-10 py-5 text-base">
              Começar um projeto <ArrowRight className="h-4 w-4" />
            </GlassLink>
            <GlassLink href={INSTAGRAM_URL} glow className="px-10 py-5 text-base">
              Seguir @thiagaoAi
            </GlassLink>
          </div>
        </div>

      </section>

      {/* Where the hands meet: the closing line fades in over the last stretch of the scroll (.hands-reveal). */}
      <section id="encontro" aria-label="Humano e IA" className="relative border-t border-white/10">
        <div className="hands-reveal mx-auto max-w-5xl px-6 py-36 text-center sm:py-44">
          <SectionLabel>Humano + IA</SectionLabel>
          <p className="font-display mt-8 text-4xl leading-[1.05] tracking-[-0.03em] text-foreground [text-shadow:0_2px_24px_hsl(var(--background))] sm:text-6xl">
            Quando a mão humana e a IA se encontram,
            <br className="hidden sm:block" /> nasce algo <em className="not-italic text-glow">superior</em>:
            <br className="hidden sm:block" /> software que trabalha com você.
          </p>
        </div>
      </section>

      <footer className="relative overflow-hidden border-t border-white/10">
        {/* Shoreline: the sea catches a little light at the bottom; the lighthouse keeps watch on the right. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/[0.06] to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/15" />
        <Lighthouse className="absolute right-4 top-14 w-[64px] sm:bottom-0 sm:top-auto sm:right-10 sm:w-[110px] lg:right-24 lg:w-[132px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 pr-24 sm:pr-6 lg:pr-56">
          <div className="flex flex-col justify-between gap-12 lg:flex-row">
            <div className="max-w-sm">
              <div className="flex items-center gap-3">
                <BrandMark className="h-9 w-9" />
                <Wordmark className="text-2xl" />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Dev log, newsletter e base pública das minhas skills em IA, automação, web e operação.
              </p>
              <p className="mt-4 inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <span className="beacon" aria-hidden="true" />
                Feito à noite, em Cape Cod, MA
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 text-left sm:grid-cols-4">
              {footerColumns.map((column) => (
                <div key={column.heading}>
                  <h3 className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{column.heading}</h3>
                  <div className="mt-5 flex flex-col gap-4 text-sm text-muted-foreground">
                    {column.links.map((link) => (
                      <a key={link.label} href={link.href} className="transition-colors hover:text-glow">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 flex flex-col justify-between gap-6 text-sm text-muted-foreground md:flex-row md:items-center">
            <p>
              © {new Date().getFullYear()} {BRAND_NAME} by Thiago do Carmo. Todos os direitos reservados.
              {BUILD_STAMP && (
                // Which deploy this page came from; lets a visitor (and Thiago) tell a cached copy from the live one.
                <span className="ml-3 whitespace-nowrap text-xs text-muted-foreground/70">build {BUILD_STAMP}</span>
              )}
            </p>
            <div className="flex gap-7 text-xs uppercase tracking-[0.22em]">
              <a href={INSTAGRAM_URL} className="transition-colors hover:text-glow">Instagram</a>
              <a href={SOLO_CODANDO_URL} className="transition-colors hover:text-glow">Solo Codando</a>
              <a href={DOCKPLUS_URL} className="transition-colors hover:text-glow">DockPlus AI</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
