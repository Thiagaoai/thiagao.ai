'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Link2, MessageCircle } from 'lucide-react';
import { LinkedinIcon, XIcon } from '../../components/SocialIcons';

type ShareButtonsProps = {
  links: { whatsapp: string; x: string; linkedin: string; url: string };
};

const button =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition-colors hover:border-cyan-300/40';

export default function ShareButtons({ links }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copyLink() {
    try {
      // Needs a secure context (https or localhost); elsewhere the API is missing and we stay silent.
      await navigator.clipboard.writeText(links.url);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable or denied: nothing to show.
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
      <a href={links.whatsapp} target="_blank" rel="noreferrer" aria-label="Compartilhar no WhatsApp" className={button}>
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </a>
      <a href={links.x} target="_blank" rel="noreferrer" aria-label="Compartilhar no X" className={button}>
        <XIcon className="h-4 w-4" />X
      </a>
      <a href={links.linkedin} target="_blank" rel="noreferrer" aria-label="Compartilhar no LinkedIn" className={button}>
        <LinkedinIcon className="h-4 w-4" />
        LinkedIn
      </a>
      <button type="button" onClick={copyLink} className={button}>
        {copied ? <Check className="h-4 w-4 text-cyan-200" /> : <Link2 className="h-4 w-4" />}
        <span aria-live="polite">{copied ? 'Copiado' : 'Copiar link'}</span>
      </button>
    </div>
  );
}
