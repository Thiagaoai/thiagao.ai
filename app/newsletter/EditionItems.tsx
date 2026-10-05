import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { BriefingPost } from '@/lib/briefing/types';

type EditionItemsProps = {
  post: BriefingPost;
  // Compact: numbered headline list for the featured card on /newsletter.
  compact?: boolean;
};

const categoryPill =
  'inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200';

export default function EditionItems({ post, compact = false }: EditionItemsProps) {
  // Legacy editions have no items: show the old prose brief, one paragraph per block.
  if (post.items.length === 0) {
    const paragraphs = post.brief
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    return (
      <div className={compact ? 'grid gap-3 text-sm leading-relaxed text-zinc-400' : 'grid gap-5 text-lg leading-relaxed text-zinc-300'}>
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <ol className="grid gap-3">
        {post.items.map((item, index) => {
          const n = index + 1;
          return (
            <li key={n} className="grid grid-cols-[auto_1fr] gap-4 rounded-[26px] border border-zinc-800 bg-zinc-950/70 p-4">
              <span className="text-2xl leading-none text-cyan-200" style={{ fontFamily: 'var(--font-display)' }}>
                {String(n).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <span className={categoryPill}>{item.category}</span>
                <Link
                  href={`/newsletter/${post.slug}#item-${n}`}
                  className="mt-2 block font-semibold leading-snug text-white transition-colors hover:text-cyan-200"
                >
                  {item.title}
                </Link>
                <p className="mt-1 truncate text-sm text-zinc-400">{item.whyItMatters}</p>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="grid gap-5">
      {post.items.map((item, index) => {
        const n = index + 1;
        return (
          <li key={n} id={`item-${n}`} className="scroll-mt-28 rounded-[26px] border border-zinc-800 bg-zinc-950/70 p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl leading-none text-cyan-200" style={{ fontFamily: 'var(--font-display)' }}>
                {String(n).padStart(2, '0')}
              </span>
              <span className={categoryPill}>{item.category}</span>
              {item.kind === 'tool' ? (
                <span className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-100">
                  Para testar hoje
                </span>
              ) : null}
            </div>
            <h2
              className="mt-5 text-[26px] font-normal leading-[1.1] tracking-tight text-white sm:text-[32px]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {item.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">{item.summary}</p>
            <div className="mt-5 border-l-2 border-cyan-300/60 pl-4">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Por que importa</p>
              <p className="mt-2 text-base leading-relaxed text-zinc-200">{item.whyItMatters}</p>
            </div>
            <a
              href={item.source.url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 transition-colors hover:text-white"
            >
              Ler na fonte · {item.source.publisher}
              <ExternalLink className="h-4 w-4" />
            </a>
          </li>
        );
      })}
    </ol>
  );
}
