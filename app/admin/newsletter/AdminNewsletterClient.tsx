'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import type { BriefingPost } from '@/lib/briefing/types';

export default function AdminNewsletterClient({
  initialDrafts,
  token,
}: {
  initialDrafts: BriefingPost[];
  token: string;
}) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function publish(id: string, sendEmail: boolean) {
    setBusyId(id);
    setMessage('');

    try {
      const response = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, sendEmail }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? 'Falha ao publicar.');
      }

      setDrafts((current) => current.filter((draft) => draft.id !== id));
      setMessage(sendEmail ? 'Publicado e envio disparado.' : 'Publicado sem enviar email.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao publicar.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {message ? (
        <div className="mb-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 text-sm text-cyan-100">
          {message}
        </div>
      ) : null}

      <div className="grid gap-5">
        {drafts.length === 0 ? (
          <div className="rounded-[30px] border border-zinc-800 bg-zinc-950/70 p-8 text-zinc-400">
            Nenhum draft pendente agora. Rode o agente diario ou aguarde o job das 17h.
          </div>
        ) : null}

        {drafts.map((draft) => (
          <article key={draft.id} className="rounded-[34px] border border-zinc-800 bg-zinc-950/80 p-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-100">
                    {draft.category}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
                    Score {draft.relevanceScore} · {draft.readingMinutes} min
                  </span>
                </div>
                <h2 className="max-w-4xl text-3xl font-semibold leading-tight text-white">{draft.title}</h2>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-400">{draft.dek}</p>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-500">{draft.takeaway}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-3">
                <button
                  onClick={() => publish(draft.id, false)}
                  disabled={busyId === draft.id}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/5 disabled:opacity-60"
                >
                  {busyId === draft.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Publicar
                </button>
                <button
                  onClick={() => publish(draft.id, true)}
                  disabled={busyId === draft.id}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-cyan-200 disabled:opacity-60"
                >
                  {busyId === draft.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Publicar + email
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
