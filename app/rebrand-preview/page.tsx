'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  Bot,
  Boxes,
  Braces,
  BrainCircuit,
  Cable,
  Code2,
  Database,
  Globe,
  LineChart,
  Mail,
  MessageCircle,
  Menu,
  Newspaper,
  PlugZap,
  Rocket,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Terminal,
  WandSparkles,
  Workflow,
} from 'lucide-react';
import { motion } from 'motion/react';
import { BRAND_NAME, BrandMark, BrandWordmark } from '../components/BrandMark';

const CONTACT_URL = 'https://wa.me/17742077924';
const TELEGRAM_URL = 'https://t.me/thiagaoai';
const EMAIL_ADDRESS = 'dockplus@dockplusai.com';
const EMAIL_URL = `mailto:${EMAIL_ADDRESS}`;
const NEWSLETTER_URL = '#newsletter';
const BRAND_DOMAIN = 'thiagao.io';
const BRAND_URL = 'https://thiagao.io';
const INSTAGRAM_URL = 'https://instagram.com/thiagaoAi';
const SOLO_CODANDO_URL = 'https://instagram.com/solocodando';
const DOCKPLUS_URL = 'https://dockplusai.io';

const media = {
  hero: 'https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4',
  operator: '/thiago-dev/operator-motion.mp4',
  systems: '/thiago-dev/systems-motion.mp4',
  cta: '/thiago-dev/cta-motion.mp4',
  portrait: '/thiago-dev/thiago-hero.webp',
  about: '/thiago-dev/thiago-about.webp',
  ai: '/thiago-dev/thiago-ai.webp',
};

const navItems = [
  { label: 'Skills', target: '#skills' },
  { label: 'Projetos', target: '#projects' },
  { label: 'Newsletter', target: '#newsletter' },
  { label: 'Novidades', target: '#updates' },
  { label: 'Social', target: '#social' },
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
  { value: 'AI', label: 'automação sob medida' },
  { value: 'PT/EN', label: 'conteúdo e execução' },
];

const stackGroups = [
  {
    title: 'Dev',
    items: ['Next.js', 'TypeScript', 'Bun', 'Python', 'Node.js', 'Nodes', 'VS Code', 'Cursor', 'Terminal'],
  },
  {
    title: 'Automação',
    items: ['n8n', 'Make', 'Maker', 'GHL', 'APIs', 'Webhooks', 'CRM', 'Telegram Bots', 'Sites', 'Automation'],
  },
  {
    title: 'IA / Agents',
    items: ['OpenAI', 'Claude Code', 'Claude Cowork', 'Gemini', 'LangGraph', 'LangSmith', 'LLM', 'Fine-tune', 'Agents'],
  },
  {
    title: 'Labs / Infra',
    items: ['OpenClaw', 'Hermes Nous', 'Manus', 'ComfyUI', 'Pinokio', 'VPS', 'Railway', 'MCP'],
  },
];

const featuredStack = ['LangGraph', 'LangSmith', 'n8n', 'OpenAI', 'Claude Code', 'GHL', 'Telegram Bots', 'Next.js'];

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

const updates = [
  {
    category: 'Automação',
    title: 'Como eu desenho automações que não quebram no primeiro cliente real',
    text: 'Mapeamento de gatilhos, exceções, logs, retries e checkpoints antes de colocar n8n, CRM e WhatsApp para rodar.',
    meta: 'Abr 2026 · 8 min',
  },
  {
    category: 'AI Agents',
    title: 'O que muda quando o agente usa ferramentas em vez de só responder texto',
    text: 'Notas sobre tool calling, MCP, sandboxes, memória, handoffs e por que a IA precisa estar conectada ao sistema certo.',
    meta: 'Abr 2026 · 7 min',
  },
  {
    category: 'Web',
    title: 'Landing page boa em 2026 é interface, funil e automação no mesmo lugar',
    text: 'Performance, UX, copy, eventos, formulário, CRM, analytics e follow-up precisam nascer juntos.',
    meta: 'Abr 2026 · 6 min',
  },
  {
    category: 'Build público',
    title: 'Solo Codando: aprendendo em público com projetos reais',
    text: 'Bastidores de código, automações, decisões técnicas, ferramentas e o processo de transformar ideia em sistema.',
    meta: 'Abr 2026 · 5 min',
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

function scrollToId(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200/80 backdrop-blur-xl">
      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
      {children}
    </div>
  );
}

function CtaLink({
  children,
  href,
  variant = 'primary',
}: {
  children: ReactNode;
  href: string;
  variant?: 'primary' | 'outline' | 'white';
}) {
  const styles = {
    primary: 'bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_20px_45px_rgba(34,211,238,0.22)]',
    outline: 'gradient-border-btn text-white hover:bg-white/5',
    white: 'bg-white text-black hover:bg-zinc-200 shadow-[0_20px_40px_rgba(255,255,255,0.12)]',
  };

  return (
    <a
      href={href}
      className={`${styles[variant]} inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-bold transition-all hover:scale-[1.03]`}
    >
      {children}
    </a>
  );
}

function NewsletterFormMock() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-black/55 p-3 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-3 rounded-[22px] border border-zinc-800 bg-zinc-950/80 p-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-full bg-white/[0.04] px-5 py-4 text-left text-sm text-zinc-500">
          <Mail className="h-4 w-4 text-cyan-300" />
          seu@email.com
        </div>
        <a
          href={CONTACT_URL}
          className="inline-flex items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-bold text-black transition-all hover:bg-zinc-200"
        >
          Assinar
        </a>
      </div>
      <p className="px-4 pt-4 text-left text-xs text-zinc-600">
        Sem spam. Só dev logs, bastidores e links úteis.
      </p>
    </div>
  );
}

function FloatingWhatsAppButton() {
  return (
    <a
      href={CONTACT_URL}
      aria-label="Falar com Thiago no WhatsApp"
      className="group fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-full border border-emerald-300/30 bg-emerald-400 p-3 font-bold text-black shadow-[0_18px_55px_rgba(52,211,153,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-300 sm:bottom-7 sm:right-7 sm:px-4 sm:py-3 xl:bottom-8"
    >
      <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-black text-emerald-300">
        <span className="absolute inset-0 rounded-full bg-emerald-300/30 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
        <MessageCircle className="relative h-6 w-6" />
      </span>
      <span className="hidden text-left leading-tight sm:block">
        <span className="block text-[11px] uppercase tracking-[0.18em] text-black/60">WhatsApp</span>
        <span className="block text-sm">Criar automação</span>
      </span>
    </a>
  );
}

export default function RebrandPreviewPage() {
  const systemsVideoRef = useRef<HTMLVideoElement | null>(null);
  const systemsSectionRef = useRef<HTMLElement | null>(null);
  const ctaVideoRef = useRef<HTMLVideoElement | null>(null);
  const ctaSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sync = (video: HTMLVideoElement | null, section: HTMLElement | null) => {
      if (!video || !section) return;

      const rect = section.getBoundingClientRect();
      const rawProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const progress = Math.max(0, Math.min(1, rawProgress));

      if (video.duration > 0 && !video.seeking) {
        video.currentTime = video.duration * progress;
      }
    };

    let frame = 0;

    const tick = () => {
      sync(systemsVideoRef.current, systemsSectionRef.current);
      sync(ctaVideoRef.current, ctaSectionRef.current);
      frame = window.requestAnimationFrame(tick);
    };

    systemsVideoRef.current?.pause();
    ctaVideoRef.current?.pause();
    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <FloatingWhatsAppButton />
      <nav className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-5 md:px-6 md:pt-6">
        <div className="flex w-full max-w-6xl items-center gap-4 rounded-full border border-white/10 bg-black/35 px-4 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl md:gap-8 md:px-6">
          <button onClick={() => scrollToId('#top')} aria-label={BRAND_NAME} className="flex items-center gap-3">
            <BrandMark className="h-8 w-8" />
            <BrandWordmark className="hidden text-lg font-bold text-zinc-100 sm:inline-flex" />
          </button>

          <div className="hidden flex-1 items-center justify-center gap-7 md:flex">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToId(item.target)}
                className="text-sm font-medium text-zinc-400 transition-colors duration-150 hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-zinc-400 transition-colors hover:text-white">
              PT · EN
            </button>
            <a
              href={INSTAGRAM_URL}
              className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-zinc-400 transition-colors hover:text-white sm:block"
            >
              @thiagaoAi
            </a>
            <a
              href={NEWSLETTER_URL}
              className="gradient-border-btn rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Assinar
            </a>
            <button className="p-1 text-zinc-400 hover:text-white md:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <main id="top" className="relative min-h-screen overflow-hidden bg-black">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
          <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_74%_30%,rgba(34,211,238,0.22),transparent_32%),linear-gradient(90deg,rgba(0,0,0,0.94),rgba(0,0,0,0.64)_48%,rgba(0,0,0,0.20))]" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-1/3 bg-gradient-to-t from-black to-transparent" />

        <section className="thiago-hero relative z-20 mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 items-center gap-14 px-6 pb-24 sm:px-10 lg:grid-cols-[0.95fr_0.9fr] lg:px-20 xl:px-28">
          <div className="max-w-3xl">
            <div className="animate-float-up mb-8 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-100 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
              {BRAND_NAME} · {BRAND_DOMAIN} · @solocodando
            </div>

            <h1 className="text-render-premium animate-float-up-delay text-[52px] font-semibold leading-[1.05] text-white sm:text-[74px] lg:text-[92px]">
              Thiago
              <br />
              do Carmo
            </h1>

            <p className="animate-float-up-delay-2 mt-8 max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
              Dev de automação, sites e IA customizada. Construo agentes com LangGraph, LangSmith,
              OpenAI, Claude, n8n, MCP, chatbots, landing pages e demais soluções sob medida.
            </p>

            <div className="animate-float-up-delay-3 mt-10 flex flex-col gap-4 sm:flex-row">
              <CtaLink href={NEWSLETTER_URL} variant="primary">
                Assinar newsletter <ArrowRight className="h-4 w-4" />
              </CtaLink>
              <CtaLink href="#skills" variant="outline">
                Ver skills
              </CtaLink>
            </div>

            <div className="animate-float-up-delay-3 mt-8 flex flex-wrap gap-3 text-sm font-semibold text-zinc-300">
              <a href={DOCKPLUS_URL} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 transition-colors hover:border-cyan-300/40 hover:text-white">
                DockPlus AI
              </a>
              <a href={INSTAGRAM_URL} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 transition-colors hover:border-cyan-300/40 hover:text-white">
                Instagram @thiagaoAi
              </a>
              <a href={SOLO_CODANDO_URL} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 transition-colors hover:border-cyan-300/40 hover:text-white">
                Canal @solocodando
              </a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="relative mx-auto w-full max-w-[560px] lg:ml-auto"
          >
            <div className="absolute -inset-5 rounded-[42px] bg-gradient-to-br from-amber-400/20 via-cyan-400/20 to-blue-500/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-zinc-950/78 p-5 shadow-2xl backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(34,211,238,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%)]" />
              <div className="relative z-10 flex items-center justify-between gap-5 border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-cyan-300/30 bg-cyan-300/10">
                    <Image
                      src={media.portrait}
                      alt="Avatar de Thiago do Carmo"
                      fill
                      priority
                      sizes="64px"
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-200">Current stack</p>
                    <p className="mt-1 text-lg font-semibold text-white">AI + Automação + Web</p>
                  </div>
                </div>
                <div className="hidden rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200 sm:block">
                  ativo
                </div>
              </div>

              <div className="relative z-10 mt-5 overflow-hidden rounded-[24px] border border-zinc-800 bg-black/70 p-4 font-mono shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-300/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-300/80" />
                  <span className="ml-3 text-xs text-zinc-500">thiago-stack.ts</span>
                </div>
                <pre className="whitespace-pre-wrap text-[11px] leading-5 text-zinc-300 sm:text-[12px]">
{`const thigaoai = {
  brand: '${BRAND_NAME}',
  domain: '${BRAND_DOMAIN}',
  core: ['LangGraph', 'LangSmith', 'n8n', 'OpenAI'],
  builds: ['AI agents', 'sites', 'automations', 'bots'],
}`}
                </pre>
              </div>

              <div className="relative z-10 mt-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
                  Stack em destaque
                </p>
                <div className="flex flex-wrap gap-2">
                  {featuredStack.map((item) => (
                    <span key={item} className="rounded-full border border-zinc-700/80 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-zinc-100">
                      {item}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => scrollToId('#full-stack')}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200 transition-colors hover:text-white"
                >
                  Ver stack completo <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <section id="full-stack" className="relative z-20 overflow-hidden border-y border-zinc-900 bg-black py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.11),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <SectionLabel>Stack completo</SectionLabel>
              <h2 className="text-render-premium max-w-3xl text-[42px] font-semibold leading-[1.08] text-white sm:text-[62px]">
                Ferramentas que uso para criar soluções.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-zinc-400">
              Mantive o hero limpo e trouxe a lista completa para cá: dev, automação, IA, agents,
              labs e infra.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stackGroups.map((group) => (
              <div key={group.title} className="rounded-[28px] border border-white/10 bg-zinc-950/70 p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/80">
                  {group.title}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span key={item} className="rounded-full border border-zinc-700/80 bg-black/35 px-3 py-1.5 text-xs font-semibold text-zinc-200">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-20 border-y border-zinc-900 bg-black">
        <div className="overflow-hidden border-b border-zinc-900 py-5">
          <div className="animate-ticker flex w-max gap-10 text-sm font-bold uppercase tracking-[0.28em] text-zinc-500">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={`${item}-${index}`} className="whitespace-nowrap">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`border-zinc-900 p-10 md:p-12 ${index < 3 ? 'border-b md:border-b-0 md:border-r' : ''}`}
            >
              <div className="text-5xl font-semibold tracking-tight text-white">{stat.value}</div>
              <div className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-20 overflow-hidden bg-black py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.12),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-14 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <SectionLabel>Contexto atualizado · 24 abr 2026</SectionLabel>
              <h2 className="text-render-premium max-w-3xl text-[42px] font-semibold leading-[1.08] text-white sm:text-[62px]">
                O site agora fala da stack que está movendo dev + IA.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-zinc-400">
              Conteúdo posicionado em cima do que está relevante agora: agentes com ferramentas,
              sandboxes, MCP, AI SDK, n8n e automações conectadas ao negócio.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {currentContext.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  className="group relative overflow-hidden rounded-[30px] border border-zinc-800 bg-zinc-950/70 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-300/35"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/10 via-transparent to-amber-300/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative z-10">
                    <Icon className="h-7 w-7 text-cyan-200" />
                    <h3 className="mt-8 text-xl font-semibold leading-tight text-white">{item.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-zinc-400">{item.text}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="skills" className="relative z-20 overflow-hidden bg-black py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(245,158,11,0.11),transparent_30%),radial-gradient(circle_at_80%_40%,rgba(34,211,238,0.12),transparent_36%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <SectionLabel>Skills principais</SectionLabel>
              <h2 className="text-render-premium text-[46px] font-semibold leading-[1.08] text-white sm:text-[66px]">
                Skills de dev para
                <br />
                <span className="thiago-gradient-text">automatizar tudo.</span>
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-relaxed text-zinc-400">
              Eu faço automação, site, agentes de IA, chatbot, integração, LangGraph, LangSmith e
              demais soluções customizadas. A proposta é simples: transformar operação manual em software útil.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-7 lg:grid-cols-3">
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <motion.article
                  key={skill.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.1, duration: 0.55 }}
                  className="group relative min-h-[480px] overflow-hidden rounded-[36px] border border-zinc-800 bg-zinc-950/75 p-8 shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-300/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-10 text-3xl font-semibold tracking-tight text-white">{skill.title}</h3>
                    <p className="mt-5 text-base leading-relaxed text-zinc-400">{skill.text}</p>
                    <div className="mt-auto pt-10">
                      <div className="grid gap-3">
                        {skill.points.map((point) => (
                          <div key={point} className="flex items-center gap-3 text-sm font-medium text-zinc-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                            {point}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="newsletter" className="relative z-20 overflow-hidden bg-black py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-5 rounded-[42px] bg-gradient-to-r from-cyan-400/20 to-amber-400/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[38px] border border-zinc-800 bg-zinc-950 shadow-2xl">
              <video
                className="h-[560px] w-full object-cover opacity-90"
                src={media.operator}
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <div className="rounded-[24px] border border-white/10 bg-black/60 p-5 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Dev log</p>
                  <p className="mt-3 text-xl font-semibold text-white">
                    Bastidores do que estou montando, quebrando e melhorando.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <SectionLabel>Newsletter</SectionLabel>
            <h2 className="text-render-premium text-[46px] font-semibold leading-[1.08] text-white sm:text-[68px]">
              Newsletter de
              <br />
              automação e IA.
            </h2>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-400">
              Um dev log direto sobre o que estou criando com IA, automações, sites, agentes,
              DockPlus AI e Solo Codando. Conteúdo para quem quer construir, não só consumir hype.
            </p>
            <div className="mt-10 max-w-xl">
              <NewsletterFormMock />
            </div>
            <div className="mt-8 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
              {newsletterTopics.map((topic) => (
                <div key={topic} className="rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3">
                  {topic}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="projects"
        ref={systemsSectionRef}
        className="relative z-20 flex min-h-[1080px] flex-col justify-end overflow-hidden border-t border-zinc-900 bg-black px-6 py-32"
      >
        <div className="absolute inset-0 z-0">
          <video ref={systemsVideoRef} className="h-full w-full object-cover object-center opacity-55" src={media.systems} muted playsInline preload="auto" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
          <div className="absolute inset-x-0 top-0 h-[34%] bg-gradient-to-b from-black to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="relative z-20 mx-auto w-full max-w-7xl">
          <SectionLabel>Projetos e canais</SectionLabel>
          <h2 className="text-render-premium max-w-4xl text-[48px] font-semibold leading-[1.06] text-white sm:text-[78px]">
            Onde estou
            <br />
            construindo agora.
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400">
            A página precisa conectar minha pessoa com os ativos que já existem:
            DockPlus AI, {BRAND_NAME} e o canal de dev @solocodando.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
            {projects.map((project, index) => {
              const Icon = project.icon;
              return (
                <motion.article
                  key={project.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12, duration: 0.5 }}
                  className="group rounded-[30px] border border-white/10 bg-black/50 p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-300/30"
                >
                  <div className="flex items-start justify-between gap-5">
                    <Icon className="h-7 w-7 text-cyan-200" />
                    <a href={project.href} className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400 transition-colors group-hover:text-white">
                      {project.label}
                    </a>
                  </div>
                  <h3 className="mt-8 text-3xl font-semibold leading-tight text-white">{project.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400">{project.text}</p>
                  <a href={project.href} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-200">
                    Abrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="updates" className="relative z-20 bg-black py-36">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <SectionLabel>Novidades</SectionLabel>
              <h2 className="text-render-premium text-[46px] font-semibold leading-[1.08] text-white sm:text-[68px]">
                Próximas notas
                <br />
                do dev log.
              </h2>
            </div>
            <a href={NEWSLETTER_URL} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-cyan-200 hover:text-white">
              Receber por email <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {updates.map((update, index) => (
              <motion.article
                key={update.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="group relative overflow-hidden rounded-[34px] border border-zinc-800 bg-zinc-950/70 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-300/35"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.12),transparent_34%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
                      {update.category}
                    </span>
                    <span className="text-xs text-zinc-600">{update.meta}</span>
                  </div>
                  <h3 className="mt-10 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white">
                    {update.title}
                  </h3>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">{update.text}</p>
                  <div className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-cyan-200">
                    Ler nota <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-20 overflow-hidden bg-black py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <div className="relative min-h-[520px] overflow-hidden rounded-[38px] border border-zinc-800 bg-zinc-950">
              <video
                className="absolute inset-0 h-full w-full object-cover opacity-80"
                src={media.operator}
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-[28px] border border-white/10 bg-black/60 p-6 backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Operating mode</p>
                <p className="mt-3 text-2xl font-semibold leading-tight text-white">
                  Aprendendo em público, construindo para clientes e transformando operação em software.
                </p>
              </div>
            </div>
            <div className="rounded-[38px] border border-zinc-800 bg-zinc-950/70 p-8 shadow-2xl backdrop-blur-xl md:p-12">
              <SectionLabel>Sobre</SectionLabel>
              <h2 className="text-render-premium text-[42px] font-semibold leading-[1.08] text-white sm:text-[60px]">
                Dev, operador
                <br />
                e builder de IA.
              </h2>
              <p className="mt-8 text-lg leading-relaxed text-zinc-400">
                Sou Thiago do Carmo, brasileiro em Cape Cod, MA. Construo sites, automações e sistemas
                com IA sob medida. A DockPlus AI é a operação comercial; @solocodando é o canal de dev;
                {BRAND_NAME} é minha marca pessoal para compartilhar o processo.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {[
                  ['DockPlus AI', 'Soluções de IA, chatbots, automação, Telegram bots, leads e CRM para negócios.'],
                  ['Solo Codando', 'Canal para mostrar código, ferramentas, bugs, decisões e builds reais.'],
                  [BRAND_NAME, 'Instagram e marca pessoal para IA aplicada, automação e dev lifestyle.'],
                  ['Custom first', 'Nada de pacote genérico: cada sistema nasce do processo real do cliente.'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-[24px] border border-zinc-800 bg-black/35 p-5">
                    <h3 className="text-base font-semibold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-500">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="social" ref={ctaSectionRef} className="relative z-20 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <video ref={ctaVideoRef} className="h-full w-full object-cover opacity-35" src={media.cta} muted playsInline preload="auto" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black" />
        </div>

        <div className="relative z-20 mx-auto max-w-6xl px-6 py-44 text-center">
          <div className="animate-float-up mx-auto mb-14 flex h-20 w-20 items-center justify-center rounded-[24px] border border-zinc-800 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
            <BrandMark className="h-11 w-11" />
          </div>
          <h2 className="text-render-premium animate-float-up text-[48px] font-semibold leading-[1.08] text-white sm:text-[74px]">
            Bora dar um
            <br />
            upgrade nesse build.
          </h2>
          <p className="animate-float-up-delay mx-auto mt-9 max-w-2xl text-xl leading-relaxed text-zinc-400">
            Me acompanha no {BRAND_NAME}, entra no fluxo do @solocodando ou fala comigo para criar
            automação, site, chatbot ou agente de IA customizado.
          </p>
          <div className="animate-float-up-delay-3 mt-14 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <CtaLink href={INSTAGRAM_URL} variant="white">
              Seguir @thiagaoAi <Newspaper className="h-4 w-4" />
            </CtaLink>
            <CtaLink href={CONTACT_URL} variant="outline">
              Falar comigo <ArrowRight className="h-4 w-4" />
            </CtaLink>
          </div>
        </div>

        <footer className="relative z-20 mx-auto max-w-7xl px-6 pb-16">
          <div className="flex flex-col justify-between gap-12 lg:flex-row">
            <div className="max-w-sm">
              <div className="flex items-center gap-3">
                <BrandMark className="h-9 w-9" />
                <BrandWordmark className="text-2xl font-semibold text-white" />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-zinc-500">
                Dev log, newsletter e base pública das minhas skills em IA, automação, web e operação.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 text-left sm:grid-cols-4">
              {[
                ['Site', ['Skills', 'Projetos', 'Newsletter']],
                ['Canais', ['@thiagaoAi', '@solocodando', 'DockPlus AI']],
                ['Contato', ['WhatsApp', 'Telegram', 'Email', 'Instagram']],
                ['Stack', ['LangGraph', 'LangSmith', 'Next.js', 'n8n']],
              ].map(([heading, links]) => (
                <div key={heading as string}>
                  <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">{heading}</h3>
                  <div className="mt-5 flex flex-col gap-4 text-sm text-zinc-500">
                    {(links as string[]).map((link) => (
                      <a
                        key={link}
                        href={
                          link === 'WhatsApp'
                            ? CONTACT_URL
                            : link === 'Telegram'
                              ? TELEGRAM_URL
                            : link === 'Email'
                              ? EMAIL_URL
                            : link === '@thiagaoAi' || link === 'Instagram'
                              ? INSTAGRAM_URL
                              : link === '@solocodando'
                                ? SOLO_CODANDO_URL
                                : link === 'DockPlus AI'
                                  ? DOCKPLUS_URL
                                  : '#top'
                        }
                        className="transition-colors hover:text-white"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 flex flex-col justify-between gap-6 text-sm text-zinc-600 md:flex-row md:items-center">
            <p>© 2026 {BRAND_NAME} by Thiago do Carmo. All rights reserved.</p>
            <div className="flex gap-7 text-xs font-bold uppercase tracking-[0.22em]">
              <a href={INSTAGRAM_URL} className="transition-colors hover:text-white">Instagram</a>
              <a href={SOLO_CODANDO_URL} className="transition-colors hover:text-white">Solo Codando</a>
              <a href={DOCKPLUS_URL} className="transition-colors hover:text-white">DockPlus AI</a>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
