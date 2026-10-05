'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { BRAND_NAME, BrandMark, BrandWordmark } from '../BrandMark';
import HandsOverlay from './HandsOverlay';
import { handsDisplay } from './fonts';
import './hands-hero.css';

// Hero ported from github.com/vikod3/handstouch (NeuralKinetics): a human hand
// and a robot hand reach for each other across the first two screens. The
// composition is kept; colors follow this site's dark palette and the copy is
// Thiago's.

const ease = [0.16, 1, 0.3, 1] as const;
const BACKGROUND_VIDEO = '/media/hands/background.mp4';

const CONTACT_URL = 'https://wa.me/17742077924';
const INSTAGRAM_URL = 'https://instagram.com/thiagaoAi';
const SOLO_CODANDO_URL = 'https://instagram.com/solocodando';
const DOCKPLUS_URL = 'https://dockplusai.io';

const menuItems = [
  { label: 'Skills', href: '#skills' },
  { label: 'Casos', href: '#cases' },
  { label: 'Projetos', href: '#projects' },
  { label: 'Newsletter', href: '#newsletter' },
  { label: 'Novidades', href: '#updates' },
  { label: 'Social', href: '#social' },
];

const menuLinks = [
  { label: 'Instagram @thiagaoAi', href: INSTAGRAM_URL },
  { label: 'Canal @solocodando', href: SOLO_CODANDO_URL },
  { label: 'WhatsApp', href: CONTACT_URL },
];

const heroTags = [
  { label: 'Agentes de IA', href: '#skills' },
  { label: 'Automação', href: '#skills' },
  { label: 'Sites', href: '#skills' },
];

const disciplines = ['Agentes', 'Automação', 'Sites', 'Chatbots', 'LangGraph', 'Integrações'];

function scrollToId(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function NodesIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      <circle cx="12" cy="5" r="2.3" fill="currentColor" />
      <circle cx="19" cy="12" r="2.3" fill="currentColor" />
      <circle cx="12" cy="19" r="2.3" fill="currentColor" />
      <circle cx="5" cy="12" r="2.3" fill="currentColor" />
      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    scrollToId(href);
  };

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease }}
      aria-label="Navegação principal"
      className="pointer-events-none fixed left-0 top-0 z-[70] flex w-full flex-col items-center justify-between gap-4 p-6 sm:flex-row md:p-8"
    >
      <div className="pointer-events-auto relative flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        <button
          type="button"
          onClick={() => go('#top')}
          aria-label={BRAND_NAME}
          className="flex items-center gap-2"
        >
          <BrandMark className="h-9 w-9" />
          <BrandWordmark className="ht-display text-[18px] font-medium text-white" />
        </button>

        <button
          type="button"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls="ht-menu"
          onClick={() => setOpen((value) => !value)}
          className="flex cursor-pointer items-center gap-2.5 rounded-full border border-white/[0.06] bg-white p-1 pr-5 text-[12px] font-medium text-black transition-all duration-200 hover:bg-zinc-200"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
            <Plus
              size={13}
              strokeWidth={3}
              aria-hidden="true"
              className={`transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
            />
          </span>
          <span className="pr-1 text-[11.5px]">Menu</span>
        </button>

        <div className="hidden h-11 select-none items-center gap-5 rounded-full border border-white/10 bg-white/[0.06] px-6 text-[11.5px] font-normal text-white/60 backdrop-blur-xl md:flex">
          <a href={DOCKPLUS_URL} className="transition-colors hover:text-white">DockPlus AI</a>
          <a href={SOLO_CODANDO_URL} className="transition-colors hover:text-white">Solo Codando</a>
        </div>

        <div
          id="ht-menu"
          hidden={!open}
          className="absolute left-0 top-full mt-3 w-64 rounded-[22px] border border-white/10 bg-black/85 p-2 shadow-2xl backdrop-blur-xl"
        >
          <ul className="flex flex-col">
            {menuItems.map((item) => (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => go(item.href)}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  {item.label}
                  <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-1 border-t border-white/10 pt-2">
            {menuLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-2.5 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-auto flex items-center">
        <a
          href="#newsletter"
          onClick={(event) => {
            event.preventDefault();
            go('#newsletter');
          }}
          className="flex items-center gap-3.5 rounded-full border border-white/10 bg-white/[0.06] p-1 pr-6 backdrop-blur-xl transition-colors hover:bg-white/[0.12]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black">
            <NodesIcon />
          </span>
          <span className="select-none text-[11px] font-medium text-white/70">Assinar newsletter</span>
        </a>
      </div>
    </motion.nav>
  );
}

function HeroTitle() {
  return (
    <div className="relative z-30 flex min-h-0 flex-1 flex-col items-center justify-center px-6 md:px-12">
      <div className="mt-24 w-full max-w-7xl translate-y-10 px-4 text-center md:mt-0 md:translate-y-14">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease, delay: 0.2 }}
          className="flex select-none flex-col items-center justify-center"
        >
          <h1
            id="hero-title"
            className="ht-display text-render-premium text-[7.5vw] font-medium leading-[0.9] tracking-tight text-white md:text-[5.8vw] lg:text-[4.6vw]"
          >
            {BRAND_NAME}
          </h1>
          <h2 className="ht-display text-render-premium mt-1 text-[7.5vw] font-medium leading-[0.9] tracking-tight md:mt-1.5 md:text-[5.8vw] lg:text-[4.6vw]">
            <span className="mr-1.5 inline-block font-light tracking-tight text-white/30 md:mr-2">IA e automação</span>{' '}
            <span className="inline-block font-medium tracking-tight text-white">feitas à mão.</span>
          </h2>
        </motion.div>
      </div>
    </div>
  );
}

function HeroFooter() {
  return (
    <footer className="relative z-30 w-full shrink-0 px-8 py-10 md:px-16 md:py-14">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1, ease }}
        className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-end"
      >
        <div className="max-w-[300px] md:max-w-[340px]">
          <p className="mb-2 text-[11.5px] font-medium text-white/50">Thiago do Carmo · Cape Cod, MA</p>
          <p className="text-[19px] font-normal leading-[1.15] tracking-tight text-white md:text-[21px]">
            Construo agentes de IA, automações e sites sob medida para operações reais, não para o hype.
          </p>
        </div>

        <div className="hidden h-16 w-px bg-white/[0.08] lg:block" />

        <div className="flex flex-wrap gap-2.5 md:pr-56">
          {heroTags.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => scrollToId(tag.href)}
              className="cursor-pointer rounded-full border border-white/15 bg-transparent px-6 py-3.5 text-[11.5px] font-normal text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black active:scale-95"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </motion.div>
    </footer>
  );
}

function Manifesto() {
  return (
    <section aria-labelledby="ht-about-title" className="ht-about">
      <div className="ht-about-grid">
        <div className="ht-about-headline">
          <h2 id="ht-about-title">
            <span>Feito para</span>
            <span>operar com você</span>
          </h2>
          <p className="ht-about-intro">
            Instinto de operador. Inteligência que se adapta. Uma conexão mais natural entre o negócio e a máquina.
          </p>
        </div>

        <div className="ht-about-feature ht-about-cognition">
          <p className="ht-about-overline">01 / Agentes de IA</p>
          <h3>
            Sentir.
            <br />
            Entender.
            <br />
            Agir.
          </h3>
          <p className="ht-about-detail">
            Agentes com ferramentas, memória e guardrails: leem o contexto, aprendem com cada interação e executam em sistemas reais.
          </p>
        </div>

        <div className="ht-about-bio">
          <p className="ht-about-overline">O lado humano da tecnologia</p>
          <p>
            Trabalho na interseção entre operação e código. Cada sistema começa pelo jeito que as pessoas do negócio pensam, vendem e atendem.
          </p>
        </div>

        <div className="ht-about-feature ht-about-movement">
          <p className="ht-about-overline">02 / Automação</p>
          <h3>
            Precisão.
            <br />
            Com critério.
          </h3>
          <p className="ht-about-detail">
            Fluxos com logs, retries e checkpoints. Fortes o bastante para escalar, discretos o bastante para parecer parte do time.
          </p>
        </div>
      </div>

      <ul className="ht-about-disciplines" aria-label="O que eu construo">
        {disciplines.map((discipline) => (
          <li key={discipline}>{discipline}</li>
        ))}
      </ul>
    </section>
  );
}

export default function HandsHero() {
  const rootRef = useRef<HTMLDivElement>(null);

  // The background video, the hands and the bottom gradient are fixed so they
  // stay in place across the hero and the manifesto. Past that, they fade out
  // and stop painting so the rest of the page is unaffected. On phones the
  // hands would cover the manifesto copy, so there they leave with the hero.
  useEffect(() => {
    const root = rootRef.current;
    const hero = root?.querySelector<HTMLElement>('#top');
    if (!root || !hero) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const phone = window.innerWidth < 640;
      const { bottom } = (phone ? hero : root).getBoundingClientRect();
      const vh = window.innerHeight;
      const fade = Math.max(0, Math.min(1, (bottom - vh * 0.45) / (vh * 0.55)));
      root.style.setProperty('--ht-fade', fade.toFixed(3));
      const hidden = fade === 0;
      if (root.dataset.handsHidden !== String(hidden)) {
        root.dataset.handsHidden = String(hidden);
        for (const video of root.querySelectorAll('video')) {
          if (hidden) video.pause();
          else if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) void video.play().catch(() => undefined);
        }
      }
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    // The hands renderer honours prefers-reduced-motion itself; the background
    // loop is a plain <video>, so it is paused here under the same preference.
    const background = root.querySelector<HTMLVideoElement>('.ht-bg-video');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncBackground = () => {
      if (!background) return;
      if (reducedMotion.matches) background.pause();
      else void background.play().catch(() => undefined);
    };

    update();
    syncBackground();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', syncBackground);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reducedMotion.removeEventListener('change', syncBackground);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className={`ht-root ${handsDisplay.variable}`}>
      <Navbar />

      <div aria-hidden="true" className="ht-fixed-layer ht-bottom-gradient" />

      <div aria-hidden="true" className="ht-fixed-layer pointer-events-none fixed inset-0 z-0 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease }}
          className="absolute inset-0"
        >
          <video
            src={BACKGROUND_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            className="ht-bg-video absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>
      </div>

      <div className="ht-fixed-layer">
        <HandsOverlay />
      </div>

      <main>
        <section
          id="top"
          aria-labelledby="hero-title"
          className="relative flex h-screen w-full flex-col justify-between overflow-hidden"
        >
          <HeroTitle />
          <HeroFooter />
        </section>

        <Manifesto />
      </main>
    </div>
  );
}
