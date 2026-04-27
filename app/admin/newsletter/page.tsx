import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { getDraftBriefings } from '@/lib/briefing/posts';
import AdminNewsletterClient from './AdminNewsletterClient';

type PageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export const metadata = {
  title: 'Admin Newsletter - ThigaoA.i',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminNewsletterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const dashboardToken = process.env.ADMIN_DASHBOARD_TOKEN;
  const apiToken = process.env.ADMIN_API_TOKEN;
  const token = params?.token;

  if (!dashboardToken || !apiToken || token !== dashboardToken) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl rounded-[34px] border border-zinc-800 bg-zinc-950/80 p-8">
          <ShieldCheck className="h-10 w-10 text-amber-200" />
          <h1 className="mt-8 text-4xl font-semibold">Painel protegido</h1>
          <p className="mt-5 leading-relaxed text-zinc-400">
            Configure <code className="text-zinc-200">ADMIN_DASHBOARD_TOKEN</code> e{' '}
            <code className="text-zinc-200">ADMIN_API_TOKEN</code>. Depois acesse{' '}
            <code className="text-zinc-200">/admin/newsletter?token=SEU_TOKEN</code>.
          </p>
          <Link href="/briefing" className="mt-8 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white">
            Voltar para briefing
          </Link>
        </div>
      </main>
    );
  }

  const { posts } = await getDraftBriefings({ limit: 30 });

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
              Human checkpoint
            </p>
            <h1 className="text-render-premium text-[46px] font-semibold leading-[1.06] sm:text-[72px]">
              Aprovar drafts
              <br />
              do briefing.
            </h1>
          </div>
          <Link href="/briefing" className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 transition-colors hover:text-white">
            Ver site B
          </Link>
        </div>
        <AdminNewsletterClient initialDrafts={posts} token={apiToken} />
      </div>
    </main>
  );
}
