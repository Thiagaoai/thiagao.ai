import Link from 'next/link';
import { headers } from 'next/headers';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Mail,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { isNewsletterAdminAuthorized } from '@/lib/briefing/admin-auth';
import { getDraftBriefings, getNewsletterAdminOverview } from '@/lib/briefing/posts';
import AdminNewsletterClient from './AdminNewsletterClient';

type PageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) return 'Ainda não publicado';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/New_York',
  }).format(new Date(value));
}

function StatusPill({ status }: { status: string }) {
  const isGood = status === 'active' || status === 'sent' || status === 'success' || status === 'published';
  const isWarning = status === 'draft';

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${
        isGood
          ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
          : isWarning
            ? 'border-amber-300/20 bg-amber-300/10 text-amber-100'
            : 'border-red-300/20 bg-red-300/10 text-red-100'
      }`}
    >
      {status}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <div className="liquid-glass rounded-[26px] border border-white/10 bg-white/[0.035] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{value}</p>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-zinc-500">{detail}</p>
    </div>
  );
}

export const metadata = {
  title: 'Admin Newsletter - ThigaoA.i',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminNewsletterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const apiToken = process.env.ADMIN_API_TOKEN;
  const token = params?.token;

  if (
    !apiToken ||
    !isNewsletterAdminAuthorized({
      authorization: requestHeaders.get('authorization'),
      token,
    })
  ) {
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
  const overview = await getNewsletterAdminOverview();
  const metricCards = [
    {
      label: 'Inscritos',
      value: overview.metrics.activeSubscribers,
      detail: `${overview.metrics.subscribers} contatos totais na base.`,
      icon: Users,
    },
    {
      label: 'Emails enviados',
      value: overview.metrics.sentEmails,
      detail: `${overview.metrics.failedEmails} falhas registradas no log.`,
      icon: Send,
    },
    {
      label: 'Drafts',
      value: overview.metrics.drafts,
      detail: `${overview.metrics.published} briefings publicados.`,
      icon: Mail,
    },
    {
      label: 'Runs do agente',
      value: overview.agentRuns.length,
      detail: 'Execuções mais recentes do robô diário.',
      icon: Activity,
    },
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white sm:py-20">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-[-220px] right-[-180px] h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
              Newsletter cockpit
            </p>
            <h1 className="text-render-premium text-[46px] font-semibold leading-[1.06] sm:text-[72px]">
              Painel de controle
              <br />do briefing.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
              Acompanhe inscritos, envios, falhas, execuções do agente e drafts prontos para aprovação.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/newslatter" className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 transition-colors hover:text-white">
              Ver newsletter
            </Link>
            <Link href="/briefing" className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition-colors hover:bg-cyan-100">
              Ver briefing
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        {!overview.emailLogReady ? (
          <div className="mt-8 rounded-[26px] border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-relaxed text-amber-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                A tabela de logs de email ainda precisa ser aplicada no Supabase. O painel já está pronto; após a migration,
                os próximos envios começam a aparecer aqui.
              </p>
            </div>
          </div>
        ) : null}

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Usuários</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Inscritos recentes</h2>
              </div>
              <Users className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="max-h-[430px] overflow-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="sticky top-0 bg-zinc-950 text-xs uppercase tracking-[0.16em] text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Origem</th>
                      <th className="px-4 py-3">Entrada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {overview.subscribers.map((subscriber) => (
                      <tr key={subscriber.email} className="text-zinc-300">
                        <td className="px-4 py-4 font-medium text-white">{subscriber.email}</td>
                        <td className="px-4 py-4"><StatusPill status={subscriber.status} /></td>
                        <td className="px-4 py-4 text-zinc-500">{subscriber.source}</td>
                        <td className="px-4 py-4 text-zinc-500">{formatDate(subscriber.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Email logs</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Envios e falhas</h2>
              </div>
              <Database className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="space-y-3">
              {overview.emailLogs.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-zinc-500">
                  Nenhum log salvo ainda. Os próximos envios via Resend entram aqui.
                </div>
              ) : null}
              {overview.emailLogs.slice(0, 12).map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{log.email}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{log.subject}</p>
                    </div>
                    <StatusPill status={log.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span>{formatDate(log.createdAt)}</span>
                    {log.providerId ? <span>ID {log.providerId}</span> : null}
                    {log.error ? <span className="text-red-300">{log.error}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Agente</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Runs recentes</h2>
              </div>
              <Clock3 className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="space-y-3">
              {overview.agentRuns.map((run) => (
                <div key={run.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <StatusPill status={run.status} />
                    <span className="text-xs text-zinc-500">{formatDate(run.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm text-zinc-300">
                    {run.sourceCount} fontes analisadas · {run.draftCount} drafts criados
                  </p>
                  {run.error ? <p className="mt-2 text-sm text-red-300">{run.error}</p> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Conteúdo</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Briefings recentes</h2>
              </div>
              <CheckCircle2 className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="space-y-3">
              {overview.posts.slice(0, 8).map((post) => (
                <div key={post.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <StatusPill status={post.status} />
                    <span className="text-xs font-black uppercase tracking-[0.14em] text-zinc-600">{post.category}</span>
                  </div>
                  <p className="font-semibold leading-snug text-white">{post.title}</p>
                  <p className="mt-2 text-xs text-zinc-500">{formatDate(post.publishedAt ?? post.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Checkpoint humano</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Aprovar drafts</h2>
            </div>
          </div>
        </section>

        <AdminNewsletterClient initialDrafts={posts} token={apiToken} />
      </div>
    </main>
  );
}
