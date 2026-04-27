'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Loader2, Mail } from 'lucide-react';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [startedAt, setStartedAt] = useState(0);
  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('Sem spam. Briefing curto, pratico e com fontes.');

  useEffect(() => {
    setStartedAt(Date.now());
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedEmail = email.trim().toLowerCase();
    setState('loading');
    setMessage('Conectando com o briefing...');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: submittedEmail,
          source: 'briefing-page',
          company,
          startedAt,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; stored?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? 'Nao foi possivel assinar agora.');
      }

      setState('success');
      setMessage(
        data.stored
          ? 'Assinatura registrada. Proximo passo: aprovar os briefings e ativar o envio.'
          : 'Preview ativo. Configure o Supabase para gravar assinantes em producao.',
      );
      setEmail('');
      window.location.assign(`/newsletter/obrigado?email=${encodeURIComponent(submittedEmail)}`);
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Nao foi possivel assinar agora.');
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[30px] border border-white/10 bg-black/35 p-3 shadow-2xl backdrop-blur-xl">
      <label className="hidden" aria-hidden="true">
        Empresa
        <input
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
      <div className="liquid-glass flex flex-col gap-3 rounded-[24px] p-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-full bg-white/[0.04] px-5 py-4 text-left text-sm text-zinc-500">
          <Mail className="h-4 w-4 text-cyan-300" />
          <span className="sr-only">Email para assinar o ThigaoA.i Briefing</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            placeholder="seu@email.com"
            className="w-full bg-transparent text-zinc-100 outline-none placeholder:text-zinc-600"
          />
        </label>
        <button
          type="submit"
          disabled={state === 'loading'}
          className="liquid-glass inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold text-white transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Assinar
        </button>
      </div>
      <p className={`px-4 pt-4 text-left text-xs ${state === 'error' ? 'text-red-300' : 'text-zinc-500'}`}>
        {message}
      </p>
    </form>
  );
}
