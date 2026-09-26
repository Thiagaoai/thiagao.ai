'use client';

import { FormEvent, useState } from 'react';
import { Loader2, Star } from 'lucide-react';

type Props = {
  clientSlug: string;
  businessName: string;
  accentColor: string;
  isDemo: boolean;
};

type Step = 'rate' | 'redirecting' | 'demo-redirect' | 'feedback' | 'thanks';

export default function ReviewFunnel({ clientSlug, businessName, accentColor, isDemo }: Props) {
  const [step, setStep] = useState<Step>('rate');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function post(payload: Record<string, unknown>) {
    const response = await fetch('/api/dockplus/reviews', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clientSlug, ...payload }),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string; redirectUrl?: string | null };
    if (!response.ok || !data.ok) throw new Error(data.message ?? 'Something went wrong. Please try again.');
    return data;
  }

  async function choose(value: number) {
    setRating(value);
    setError('');
    if (value <= 3) {
      setStep('feedback');
      return;
    }

    setStep('redirecting');
    try {
      const data = await post({ rating: value });
      if (data.redirectUrl) {
        window.location.assign(data.redirectUrl);
      } else {
        setStep('demo-redirect');
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
      setStep('rate');
    }
  }

  async function sendFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await post({ rating, name, contact, message });
      setStep('thanks');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'redirecting') {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: accentColor }} />
        <p className="font-semibold">Thank you! Opening Google reviews…</p>
      </div>
    );
  }

  if (step === 'demo-redirect') {
    return (
      <div className="mt-6 text-center">
        <h1 className="text-2xl font-bold">Thank you! 🎉</h1>
        <p className="mt-3 text-[#4b5563]">
          In a live setup, a {rating}-star customer is now sent straight to the Google review page for {businessName}.
        </p>
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Demo mode: no Google page is opened.</p>
        <button type="button" onClick={() => setStep('rate')} className="mt-6 text-sm font-semibold underline" style={{ color: accentColor }}>
          Try another rating
        </button>
      </div>
    );
  }

  if (step === 'thanks') {
    return (
      <div className="mt-6 text-center">
        <h1 className="text-2xl font-bold">Thank you for telling us.</h1>
        <p className="mt-3 text-[#4b5563]">The owner got your message and will reach out to make it right.</p>
        {isDemo && <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Demo mode: in a live setup the owner is alerted by email.</p>}
      </div>
    );
  }

  if (step === 'feedback') {
    return (
      <form onSubmit={sendFeedback} className="mt-5 grid gap-4">
        <h1 className="text-2xl font-bold">We are sorry we missed the mark.</h1>
        <p className="text-[#4b5563]">Tell the owner directly what happened — they will personally follow up.</p>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          minLength={3}
          maxLength={2000}
          rows={4}
          placeholder="What happened?"
          className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
        />
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={120}
          placeholder="Your name (optional)"
          autoComplete="name"
          className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
        />
        <input
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          maxLength={200}
          placeholder="Phone or email (optional)"
          className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
        />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: accentColor }}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Send to the owner
        </button>
        <button type="button" onClick={() => setStep('rate')} className="text-sm text-[#6b7280] underline">
          Change my rating
        </button>
      </form>
    );
  }

  return (
    <div className="mt-4 text-center">
      <h1 className="text-2xl font-bold sm:text-3xl">How was your experience?</h1>
      <p className="mt-2 text-[#4b5563]">Tap a star — it takes 5 seconds.</p>
      <div className="mt-7 flex justify-center gap-2" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((value) => {
          const active = value <= (hover || rating);
          return (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value === 1 ? '' : 's'}`}
              onMouseEnter={() => setHover(value)}
              onClick={() => choose(value)}
              className="rounded-full p-1 transition active:scale-90"
            >
              <Star className="h-11 w-11" strokeWidth={1.5} style={{ color: active ? '#f59e0b' : '#d1d5db', fill: active ? '#fbbf24' : 'transparent' }} />
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
