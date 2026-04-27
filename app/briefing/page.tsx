import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Database,
  ExternalLink,
  Gauge,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { BrandMark, BrandWordmark } from '../components/BrandMark';
import AiRadioPlayer from './AiRadioPlayer';
import SubscribeForm from './SubscribeForm';
import ToolBriefingCards from './ToolBriefingCards';
import { BRIEFING_TAGS } from '@/lib/briefing/types';
import { getPublishedBriefings } from '@/lib/briefing/posts';

type PageProps = {
  searchParams?: Promise<{
    tag?: string;
  }>;
};

const heroVideoUrl =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4';

const footerVideoUrl =
  'https://res.cloudinary.com/dhrxy4yo0/video/upload/v1776474186/hf_20260412_040848_9cd63a42-f012-4f3d-ac76-e6eb4b0b6646_gqmmrk.mp4';

const soloCodandoYoutubeUrl = 'https://www.youtube.com/@solocodando';

type IconProps = {
  className?: string;
};

function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.81-5.96 6.81H1.69l7.73-8.83L1.27 2.25h6.82l4.7 6.22 5.45-6.22Zm-1.16 17.52h1.83L7.09 4.13H5.12l11.96 15.64Z" />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect width="16" height="16" x="4" y="4" rx="4.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.7" cy="7.3" r="1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M14.2 8.1V6.7c0-.7.48-.9.82-.9h2.1V2.15L14.23 2.13c-3.2 0-3.93 2.4-3.93 3.93v2.04H7.78v3.76h2.52V22h3.9V11.86h2.64l.36-3.76h-3Z" />
    </svg>
  );
}

function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M6.94 8.98H3.55V20h3.39V8.98ZM5.24 4A1.96 1.96 0 1 0 5.2 7.92 1.96 1.96 0 0 0 5.24 4Zm15.2 9.68c0-3.34-1.79-4.9-4.18-4.9-1.92 0-2.78 1.05-3.26 1.8v-1.6H9.75c.04 1.03 0 11.02 0 11.02h3.39v-6.16c0-.33.02-.66.12-.9.27-.66.88-1.35 1.9-1.35 1.35 0 1.89 1.03 1.89 2.53V20h3.39v-6.32Z" />
    </svg>
  );
}

const channelLinks = [
  { label: '@thiagaoAi', href: 'https://instagram.com/thiagaoAi' },
  { label: '@dockplusai', href: 'https://instagram.com/dockplusai' },
  { label: '@solocodando', href: soloCodandoYoutubeUrl },
];

const socialLinks = [
  { label: 'X', href: 'https://x.com/thiagaoai', icon: XIcon },
  { label: 'Instagram', href: 'https://instagram.com/thiagaoAi', icon: InstagramIcon },
  { label: 'Facebook', href: 'https://facebook.com/thiagaoai', icon: FacebookIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/thiagodocarmo', icon: LinkedinIcon },
];

const videoSlots = [
  {
    title: 'Reels de IA aplicada',
    source: '@thiagaoAi',
    text: 'Cortes curtos sobre ferramentas, prompts, agentes e automacoes que valem testar.',
  },
  {
    title: 'Bastidores DockPlus AI',
    source: '@dockplusai',
    text: 'Como sistemas, sites, agentes e automacoes entram em projetos reais para negocios.',
  },
  {
    title: 'Dev na pratica',
    source: '@solocodando',
    text: 'Conteudo tecnico para transformar ideia em codigo, deploy, produto e workflow.',
  },
];

const principles = [
  {
    icon: BrainCircuit,
    title: 'Ferramenta certa',
    text: 'ChatGPT, Claude, Gemini, Manus, Grok, Kimi, Mistral e open source com leitura pratica, nao ranking vazio.',
  },
  {
    icon: Wrench,
    title: 'Como eu usaria',
    text: 'Cada insight responde: serve para dev, automacao, conteudo, pesquisa, agente, funil ou produto?',
  },
  {
    icon: ShieldCheck,
    title: 'Start rapido',
    text: 'Pouca teoria. Um contexto curto, uma aplicacao real e um proximo passo para testar.',
  },
];

export const metadata = {
  title: 'ThigaoA.i Briefing - AI Operator Newsletter',
  description:
    'Newsletter sobre IA, big tech, ferramentas, novidades e tendencias explicadas para curiosos, novatos, entusiastas e builders.',
};

export default async function BriefingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedTag = params?.tag;
  const { posts, source } = await getPublishedBriefings({ tag: selectedTag, limit: 12 });
  const featured = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white selection:bg-amber-500/30">
      <Link
        href="/admin/login"
        className="fixed bottom-5 right-5 z-[80] inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-black/80 px-5 py-3 text-sm font-black text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-transform hover:scale-[1.04] hover:border-cyan-200 md:bottom-7 md:right-7"
        aria-label="Abrir login do painel admin"
      >
        <LockKeyhole className="h-4 w-4 text-cyan-200" />
        Admin Login
      </Link>

      <header className="relative min-h-screen overflow-hidden bg-[hsl(var(--background))]">
        <video autoPlay loop muted playsInline className="absolute inset-0 z-0 h-full w-full object-cover">
          <source src={heroVideoUrl} type="video/mp4" />
        </video>

        <nav className="liquid-glass relative z-10 mx-auto mt-6 flex w-[calc(100%-2rem)] max-w-7xl flex-row items-center justify-between rounded-full px-5 py-3 md:px-8">
          <Link href="/" className="flex items-center gap-3 text-white">
            <BrandMark className="h-9 w-9 rounded-xl" />
            <span
              className="text-3xl tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ThigaoA.i
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {[
              ['Home', '/'],
              ['Briefings', '#briefings'],
              ['Modalidades', '#modalidades'],
              ['Videos', '#videos'],
              ['Stack', '#stack'],
              ['Social', '#social'],
            ].map(([label, href], index) => (
              <a
                key={label}
                href={href}
                className={`text-sm transition-colors hover:text-white ${
                  index === 0 ? 'text-white' : 'text-zinc-400'
                }`}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/login"
              className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              aria-label="Login do painel admin"
            >
              <LockKeyhole className="h-4 w-4" />
              Admin
            </Link>
            <a
              href="#assinar"
              className="liquid-glass inline-flex rounded-full px-6 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
            >
              Assinar
            </a>
          </div>
        </nav>

        <section className="relative z-10 flex min-h-[calc(100vh-96px)] flex-col items-center justify-center px-6 py-[90px] pb-40 pt-32 text-center">
          <p className="animate-fade-rise mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-zinc-200 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
            ThigaoA.i Briefing · IA · Big Tech · Novidades
          </p>

          <h1
            className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] text-white sm:text-7xl md:text-8xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            A newsletter do <em className="not-italic text-zinc-400">Thiagao</em> para entender{' '}
            <em className="not-italic text-zinc-400">o futuro sem complicar.</em>
          </h1>

          <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Notícias, ferramentas, big tech, agentes e tendências de IA explicadas de um jeito direto:
            bom para quem está começando, para quem é curioso e para quem já está construindo.
          </p>

          <div className="animate-fade-rise-delay-2 mt-12 flex flex-col items-center gap-5">
            <a
              href="#assinar"
              className="liquid-glass inline-flex cursor-pointer items-center gap-3 rounded-full px-14 py-5 text-base font-medium text-white transition-transform hover:scale-[1.03]"
            >
              Assinar briefing
              <ArrowRight className="h-4 w-4" />
            </a>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {channelLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-bold tracking-[0.12em] text-zinc-300 backdrop-blur-sm transition-colors hover:border-cyan-300/40 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div id="social" className="flex items-center justify-center gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-300 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-cyan-300/40 hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>

            <AiRadioPlayer />
          </div>
        </section>
      </header>

      <section id="assinar" className="relative z-10 border-y border-zinc-900 bg-black py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
              Newsletter operacional
            </p>
            <h2
              className="max-w-3xl text-[44px] font-normal leading-[1.02] tracking-[-0.04em] text-white sm:text-[72px]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              IA e big tech sem enrolação, para acompanhar antes da onda passar.
            </h2>
          </div>

          <div className="liquid-glass rounded-[34px] p-4">
            <SubscribeForm />
          </div>
        </div>
      </section>

      <section id="modalidades" className="relative z-10 border-b border-zinc-900 bg-black py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(245,158,11,0.11),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(34,211,238,0.12),transparent_32%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-14 grid grid-cols-1 gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                Modalidades do briefing
              </p>
              <h2
                className="text-render-premium text-[44px] font-normal leading-[1.04] text-white sm:text-[70px]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Um mapa rapido
                <br />
                das ferramentas.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-zinc-400">
              Cada quadrado vira uma pequena explicacao: o que e, onde eu prestaria atencao e como
              isso pode entrar em dev, automacao, conteudo, agentes ou produto. Sem textao.
            </p>
          </div>

          <ToolBriefingCards />
        </div>
      </section>

      <section id="briefings" className="relative z-10 border-y border-zinc-900 bg-black py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                Novidades publicadas
              </p>
              <h2
                className="text-render-premium text-[44px] font-normal leading-[1.04] text-white sm:text-[70px]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Briefings para
                <br />
                usar no mundo real.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
              Fonte atual: <span className="font-bold text-zinc-300">{source}</span>. Enquanto o Supabase nao estiver configurado,
              esta pagina mostra dados fallback para validar design, copy e conversao.
            </p>
          </div>

          <div className="mb-10 flex flex-wrap gap-3">
            <Link
              href="/newslatter"
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${!selectedTag ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}
            >
              Todos
            </Link>
            {BRIEFING_TAGS.map((tag) => (
              <Link
                key={tag}
                href={`/newslatter?tag=${encodeURIComponent(tag)}`}
                className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${selectedTag === tag ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}
              >
                {tag}
              </Link>
            ))}
          </div>

          {featured ? (
            <article className="group relative mb-7 overflow-hidden rounded-[42px] border border-white/10 bg-zinc-950/80 p-8 shadow-2xl transition-all duration-500 hover:border-cyan-300/35 md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(34,211,238,0.18),transparent_34%)] opacity-80" />
              <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-[0.72fr_0.28fr]">
                <div>
                  <div className="mb-8 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-100">
                      {featured.category}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
                      Score {featured.relevanceScore} · {featured.readingMinutes} min
                    </span>
                  </div>
                  <h3 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
                    {featured.title}
                  </h3>
                  <p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-300">{featured.dek}</p>
                  <p className="mt-6 max-w-3xl text-base leading-relaxed text-zinc-500">{featured.brief}</p>
                </div>
                <div className="rounded-[30px] border border-zinc-800 bg-black/45 p-6">
                  <Gauge className="h-7 w-7 text-cyan-200" />
                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Take principal</p>
                  <p className="mt-4 text-base leading-relaxed text-zinc-200">{featured.takeaway}</p>
                  <div className="mt-8 flex flex-wrap gap-2">
                    {featured.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ) : (
            <div className="rounded-[34px] border border-zinc-800 bg-zinc-950/70 p-10 text-zinc-400">
              Nenhum briefing publicado ainda para esse filtro.
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {remainingPosts.map((post) => (
              <article key={post.id} className="group rounded-[34px] border border-zinc-800 bg-zinc-950/70 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-300/35">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
                    {post.category}
                  </span>
                  <span className="text-xs text-zinc-600">Score {post.relevanceScore}</span>
                </div>
                <h3 className="mt-8 text-3xl font-semibold leading-tight tracking-tight text-white">{post.title}</h3>
                <p className="mt-5 text-base leading-relaxed text-zinc-400">{post.dek}</p>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-200">
                  Ler briefing <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="videos" className="relative z-10 border-b border-zinc-900 bg-black py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.1),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(245,158,11,0.1),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                Videos informativos
              </p>
              <h2
                className="text-render-premium text-[44px] font-normal leading-[1.04] text-white sm:text-[70px]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Reels e shorts
                <br />
                sem poluir o hero.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-zinc-400">
              Esta area fica pronta para receber videos do Instagram, cortes e aulas curtas. O hero
              continua limpo; quem quiser aprofundar clica e vai para o canal do @solocodando.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {videoSlots.map((video, index) => (
              <a
                key={video.title}
                href={soloCodandoYoutubeUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative min-h-[330px] overflow-hidden rounded-[36px] border border-zinc-800 bg-zinc-950/80 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-300/35"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(34,211,238,0.16),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.05),transparent_45%)] opacity-80 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-cyan-300/10 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-10 flex items-center justify-between gap-4">
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                        Slot 0{index + 1}
                      </span>
                      <PlayCircle className="h-9 w-9 text-cyan-200 transition-transform group-hover:scale-110" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
                      {video.source}
                    </p>
                    <h3 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white">
                      {video.title}
                    </h3>
                    <p className="mt-5 text-base leading-relaxed text-zinc-400">{video.text}</p>
                  </div>

                  <div className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-white">
                    Abrir canal no YouTube
                    <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="relative z-10 bg-black py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
            <div>
              <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                Stack por tras
              </p>
              <h2
                className="text-render-premium text-[44px] font-normal leading-[1.04] text-white sm:text-[70px]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Agente diario,
                <br />
                aprovacao humana.
              </h2>
            </div>
            <div className="grid gap-4">
              {principles.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-[26px] border border-zinc-800 bg-zinc-950/70 p-5">
                    <Icon className="h-6 w-6 text-cyan-200" />
                    <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {[
              ['Supabase CMS', 'Assinantes, posts, fontes e execucoes do agente ficam em tabelas editaveis.', Database],
              ['LangGraph Agent', 'Coleta feeds, ranqueia sinais e cria drafts com fontes antes de qualquer publicacao.', Bot],
              ['Resend Email', 'Depois da aprovacao, o briefing pode ser enviado para a lista ativa.', Sparkles],
            ].map(([title, text, Icon]) => (
              <article key={title as string} className="rounded-[34px] border border-zinc-800 bg-zinc-950/70 p-8">
                <Icon className="h-7 w-7 text-cyan-200" />
                <h3 className="mt-8 text-2xl font-semibold text-white">{title as string}</h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-400">{text as string}</p>
              </article>
            ))}
          </div>

          <div className="relative mt-16 overflow-hidden rounded-[34px] border border-white/10 bg-zinc-950/70 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.45)] md:p-10">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 z-0 h-full w-full object-cover opacity-35"
            >
              <source src={footerVideoUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-black via-black/85 to-black/65" />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-transparent to-black/55" />
            <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_82%_20%,rgba(34,211,238,0.12),transparent_32%)]" />

            <div className="relative z-20 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <BrandMark className="h-12 w-12 rounded-2xl" />
                <div>
                  <BrandWordmark className="text-xl font-bold text-white" />
                  <p className="mt-1 text-sm text-zinc-300">Instagram @thiagaoAi · @dockplusai · Canal @solocodando</p>
                </div>
              </div>
              <a
                href="#assinar"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white px-8 py-3 text-sm font-extrabold text-black shadow-[0_18px_45px_rgba(0,0,0,0.45)] transition-transform hover:scale-[1.03] hover:bg-cyan-100"
              >
                Entrar no briefing
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
