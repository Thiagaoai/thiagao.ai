'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Copy, KeyRound, Loader2, MessageCircle, Radio, Send, UserPlus } from 'lucide-react';
import type { AdminUser } from '@/lib/briefing/admin-users';
import type { BriefingPost } from '@/lib/briefing/types';

export default function AdminNewsletterClient({
  initialDrafts,
  initialAdmins,
  adminsReady,
}: {
  initialDrafts: BriefingPost[];
  initialAdmins: AdminUser[];
  adminsReady: boolean;
}) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [admins, setAdmins] = useState(initialAdmins);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);
  const [mailBusy, setMailBusy] = useState(false);
  const [whatsappBusyId, setWhatsappBusyId] = useState<string | null>(null);
  const [whatsappText, setWhatsappText] = useState('');
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [mailForm, setMailForm] = useState({
    subject: 'Breaking: atualização importante da ThigaoA.i',
    headline: 'Uma notícia importante acabou de entrar no radar.',
    preheader: 'Resumo rápido, contexto e próximos passos para você agir sem perder tempo.',
    html:
      '<p>Esta é uma comunicação especial enviada fora do briefing diário.</p><p><strong>Contexto:</strong> explique aqui o que aconteceu, por que importa e qual ação você recomenda.</p>',
  });

  async function publish(id: string, sendEmail: boolean) {
    setBusyId(id);
    setMessage('');

    try {
      const response = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, sendEmail }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string; whatsapp?: { text?: string } };

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? 'Falha ao publicar.');
      }

      setDrafts((current) => current.filter((draft) => draft.id !== id));
      setMessage(sendEmail ? 'Publicado e envio disparado.' : 'Publicado sem enviar email.');
      if (data.whatsapp?.text) {
        setWhatsappText(data.whatsapp.text);
        await navigator.clipboard.writeText(data.whatsapp.text);
        setMessage(`${sendEmail ? 'Publicado e envio disparado.' : 'Publicado sem enviar email.'} Texto do WhatsApp copiado para o grupo Solocodando.`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao publicar.');
    } finally {
      setBusyId(null);
    }
  }

  async function copyWhatsAppText(id: string) {
    setWhatsappBusyId(id);
    setMessage('');

    try {
      const response = await fetch('/api/admin/whatsapp-preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string; text?: string };

      if (!response.ok || !data.ok || !data.text) {
        throw new Error(data.message ?? 'Falha ao gerar texto do WhatsApp.');
      }

      setWhatsappText(data.text);
      await navigator.clipboard.writeText(data.text);
      setMessage('Texto do WhatsApp copiado. Agora é só colar no grupo Solocodando.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao copiar texto do WhatsApp.');
    } finally {
      setWhatsappBusyId(null);
    }
  }

  async function refreshAdmins() {
    const response = await fetch('/api/admin/users', {
      headers: { 'content-type': 'application/json' },
    });
    const data = (await response.json()) as { admins?: AdminUser[] };
    setAdmins(data.admins ?? []);
  }

  async function saveAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdminBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(adminForm),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? 'Falha ao salvar admin.');
      }

      setAdminForm({ name: '', email: '', password: '' });
      await refreshAdmins();
      setMessage('Admin salvo. Se o email já existia, a senha foi resetada.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao salvar admin.');
    } finally {
      setAdminBusy(false);
    }
  }

  async function sendCommunication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMailBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/communicate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(mailForm),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        email?: { delivered?: number; failed?: number; reason?: string };
        whatsapp?: { text?: string };
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? data.email?.reason ?? 'Falha ao enviar comunicado.');
      }

      if (data.whatsapp?.text) {
        setWhatsappText(data.whatsapp.text);
        await navigator.clipboard.writeText(data.whatsapp.text);
      }
      setMessage(`Comunicado enviado. Entregues: ${data.email?.delivered ?? 0}. Falhas: ${data.email?.failed ?? 0}. Texto do WhatsApp copiado.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao enviar comunicado.');
    } finally {
      setMailBusy(false);
    }
  }

  return (
    <div>
      {message ? (
        <div className="mb-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 text-sm text-cyan-100">
          {message}
        </div>
      ) : null}

      <section className="mb-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Acesso</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Admins e reset de senha</h2>
            </div>
            <KeyRound className="h-5 w-5 text-zinc-500" />
          </div>

          {!adminsReady ? (
            <p className="mb-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              A tabela de admins precisa ser aplicada no Supabase para liberar novos usuários.
            </p>
          ) : null}

          <form onSubmit={saveAdmin} className="grid gap-3">
            <input
              value={adminForm.name}
              onChange={(event) => setAdminForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nome do admin"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50"
            />
            <input
              value={adminForm.email}
              onChange={(event) => setAdminForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email do admin"
              type="email"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50"
            />
            <input
              value={adminForm.password}
              onChange={(event) => setAdminForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Nova senha ou senha inicial"
              type="password"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50"
            />
            <button
              disabled={adminBusy || !adminsReady}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition-colors hover:bg-cyan-100 disabled:opacity-50"
            >
              {adminBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Criar admin / resetar senha
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{admin.name}</p>
                  <p className="text-xs text-zinc-500">{admin.email}</p>
                </div>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-100">
                  {admin.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Broadcast</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Enviar comunicado urgente</h2>
            </div>
            <Radio className="h-5 w-5 text-zinc-500" />
          </div>

          <form onSubmit={sendCommunication} className="grid gap-3">
            <input
              value={mailForm.subject}
              onChange={(event) => setMailForm((current) => ({ ...current, subject: event.target.value }))}
              placeholder="Assunto do email"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50"
            />
            <input
              value={mailForm.headline}
              onChange={(event) => setMailForm((current) => ({ ...current, headline: event.target.value }))}
              placeholder="Título principal"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50"
            />
            <textarea
              value={mailForm.preheader}
              onChange={(event) => setMailForm((current) => ({ ...current, preheader: event.target.value }))}
              placeholder="Resumo curto"
              rows={2}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50"
            />
            <textarea
              value={mailForm.html}
              onChange={(event) => setMailForm((current) => ({ ...current, html: event.target.value }))}
              placeholder="<p>Seu HTML aqui...</p>"
              rows={7}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-xs text-white outline-none focus:border-cyan-300/50"
            />
            <button
              disabled={mailBusy}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-black transition-colors hover:bg-cyan-200 disabled:opacity-60"
            >
              {mailBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar para inscritos ativos
            </button>
          </form>
        </div>
      </section>

      <section className="mb-8 rounded-[30px] border border-emerald-300/15 bg-emerald-300/[0.04] p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">WhatsApp</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Fluxo Solocodando</h2>
          </div>
          <MessageCircle className="h-5 w-5 text-emerald-200" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-zinc-300">
            O fluxo agora gera uma versão curta do mesmo briefing para o grupo Solocodando. No draft, use
            “Copiar WhatsApp”. Ao publicar, o texto também é copiado automaticamente para você colar no grupo.
          </div>
          <textarea
            value={whatsappText}
            onChange={(event) => setWhatsappText(event.target.value)}
            placeholder="A mensagem WhatsApp-ready aparece aqui depois de copiar um draft ou enviar um comunicado."
            rows={8}
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/50"
          />
        </div>
      </section>

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
                  onClick={() => copyWhatsAppText(draft.id)}
                  disabled={whatsappBusyId === draft.id || busyId === draft.id}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300/20 px-5 py-3 text-sm font-bold text-emerald-100 transition-colors hover:bg-emerald-300/10 disabled:opacity-60"
                >
                  {whatsappBusyId === draft.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                  Copiar WhatsApp
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
