'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const DAILY_LIMIT = 10;

function getTodayKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
  }).format(new Date());
}

function createSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ThiagaoChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Eu sou o Chat do Thiagao. Posso te ajudar a entender uma noticia de IA, comparar ferramentas ou transformar um briefing em proximo passo.',
    },
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [usedCount, setUsedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const remaining = useMemo(() => Math.max(DAILY_LIMIT - usedCount, 0), [usedCount]);

  useEffect(() => {
    const storedSession = window.localStorage.getItem('thiagao-chat-session') || createSessionId();
    const countKey = `thiagao-chat-count-${getTodayKey()}`;
    const storedCount = Number(window.localStorage.getItem(countKey) || '0');

    window.localStorage.setItem('thiagao-chat-session', storedSession);
    setSessionId(storedSession);
    setUsedCount(Number.isFinite(storedCount) ? storedCount : 0);
  }, []);

  function updateLocalCount(nextCount: number) {
    const safeCount = Math.min(Math.max(nextCount, 0), DAILY_LIMIT);
    window.localStorage.setItem(`thiagao-chat-count-${getTodayKey()}`, String(safeCount));
    setUsedCount(safeCount);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();

    if (!question || isLoading) return;

    if (remaining <= 0) {
      setError('Você chegou ao limite de 10 perguntas por dia.');
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-thiagao', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-thiagao-chat-session': sessionId,
        },
        body: JSON.stringify({
          sessionId,
          messages: nextMessages.slice(-8),
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        answer?: string;
        message?: string;
        remaining?: number;
      };

      if (!response.ok || !data.ok || !data.answer) {
        throw new Error(data.message || 'Nao foi possivel responder agora.');
      }

      setMessages([...nextMessages, { role: 'assistant', content: data.answer }]);
      updateLocalCount(DAILY_LIMIT - (data.remaining ?? remaining - 1));
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'Nao foi possivel responder agora.';
      setError(message);
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: 'Nao consegui responder agora. Tente novamente em alguns instantes.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full rounded-[30px] border border-white/10 bg-zinc-950/75 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-5">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
              DeepSeek
            </p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-white">
              Chat do Thiagão
            </h3>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-zinc-300">
          <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
          {remaining}/10 hoje
        </span>
      </div>

      <div className="mt-4 max-h-[380px] space-y-3 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-[22px] px-4 py-3 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-cyan-300 text-black'
                  : 'border border-white/10 bg-white/[0.04] text-zinc-200'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-200" />
            pensando...
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 items-center rounded-full border border-white/10 bg-black/40 px-5 py-3">
          <span className="sr-only">Pergunta para o Chat do Thiagao</span>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isLoading || remaining <= 0}
            maxLength={600}
            placeholder="Pergunte sobre IA, ferramentas ou uma edição..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed"
          />
        </label>
        <button
          type="submit"
          disabled={isLoading || remaining <= 0 || !input.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-black transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Enviar
        </button>
      </form>

      <p className={`mt-3 px-1 text-xs leading-relaxed ${error ? 'text-red-300' : 'text-zinc-500'}`}>
        {error || 'Limite: 10 perguntas por usuário ao dia. Respostas curtas, práticas e em português.'}
      </p>
    </div>
  );
}
