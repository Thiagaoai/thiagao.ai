import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BrandMark } from '../../components/BrandMark';
import SubscribeForm from '../../briefing/SubscribeForm';
import EditionItems from '../EditionItems';
import ShareButtons from './ShareButtons';
import { formatEditionDate, shareLinks } from '@/lib/briefing/edition';
import { getAdjacentEditions, getPublishedBriefingBySlug } from '@/lib/briefing/posts';

export const revalidate = 1800;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBriefingBySlug(slug);
  if (!post) return { title: 'Edição não encontrada - Thiagao Ai Daily' };
  return {
    title: `${post.title} - Thiagao Ai Daily`,
    description: post.dek,
    alternates: { canonical: `/newsletter/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.dek,
      url: `/newsletter/${post.slug}`,
      publishedTime: post.publishedAt ?? undefined,
      images: ['/og/home.jpg'],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.dek, images: ['/og/home.jpg'] },
  };
}

const pill = 'inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200';
const navButton =
  'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition-colors hover:border-cyan-300/40';
const editionCard = 'rounded-[26px] border border-white/10 p-5 transition-colors hover:border-cyan-300/40';

export default async function EditionPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedBriefingBySlug(slug);
  if (!post) notFound();
  const { previous, next } = await getAdjacentEditions(post);
  const links = shareLinks(post, 'page');

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white selection:bg-cyan-400/25">
      <div className="relative px-6 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_84%_30%,rgba(245,158,11,0.11),transparent_34%)]" />
        <div className="relative mx-auto max-w-4xl">
          <nav className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <BrandMark className="h-10 w-10 rounded-2xl" />
              <span className="text-xl font-bold tracking-tight">Thiagao Ai</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/newsletter#briefings" className={navButton}>
                Todas as edições
              </Link>
              <a href="#assinar" className={navButton}>
                Assinar
              </a>
            </div>
          </nav>

          <header className="mt-16">
            <p className={pill}>Thiagao Ai Daily · {formatEditionDate(post.publishedAt)}</p>
            <h1
              className="mt-6 text-[40px] font-normal leading-[1.02] tracking-tight sm:text-[64px]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {post.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-300">{post.dek}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              {post.readingMinutes} min{post.items.length > 0 ? ` · ${post.items.length} notícias` : ''}
            </p>
            <div className="mt-6">
              <ShareButtons links={links} />
            </div>
          </header>

          <section className="mt-12">
            <EditionItems post={post} />
          </section>

          <section className="mt-12 rounded-[30px] border border-cyan-300/20 bg-cyan-300/[0.06] p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Take do dia</p>
            <p className="mt-3 text-lg leading-relaxed text-zinc-100">{post.takeaway}</p>
          </section>

          <section className="mt-10 rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
            <p className="text-sm text-zinc-400">Gostou? Encaminhe para alguém que acompanha IA.</p>
            <div className="mt-4">
              <ShareButtons links={links} />
            </div>
          </section>

          <nav className="mt-10 grid gap-3 sm:grid-cols-2" aria-label="Outras edições">
            {previous ? (
              <Link href={`/newsletter/${previous.slug}`} className={editionCard} aria-label={`Edição anterior: ${previous.title}`}>
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  <ArrowLeft className="h-4 w-4" /> Edição anterior
                </span>
                <span className="mt-2 block text-lg font-semibold text-white">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/newsletter/${next.slug}`} className={`${editionCard} text-right`} aria-label={`Próxima edição: ${next.title}`}>
                <span className="flex items-center justify-end gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Próxima edição <ArrowRight className="h-4 w-4" />
                </span>
                <span className="mt-2 block text-lg font-semibold text-white">{next.title}</span>
              </Link>
            ) : null}
          </nav>

          <section id="assinar" className="mt-16 scroll-mt-28">
            <p className={pill}>Receba todo dia</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Uma edição por dia, às 17h de Nova York.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
              Cinco a sete notícias de IA explicadas sem hype, com fontes e um take prático.
            </p>
            <div className="mt-6">
              <SubscribeForm source="edition-page" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
