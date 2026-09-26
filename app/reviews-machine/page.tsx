import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageSquareText, PhoneMissed, ShieldCheck, Smartphone, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reviews Machine + Missed-Call Text-Back — DockPlus AI',
  description:
    'More 5-star Google reviews and zero lost leads from missed calls. NFC review stands, private feedback alerts and instant text-back for local businesses.',
  alternates: { canonical: '/reviews-machine' },
};

// Offer pricing lives here so it is easy to change in one place.
const PLANS = [
  {
    name: 'Reviews Machine',
    setup: '$497 setup',
    monthly: '$197/mo',
    items: [
      '3 branded NFC + QR counter stands (3D-printed)',
      'Your own review page: 4–5 stars go to Google',
      '1–3 stars become private feedback, emailed to you instantly',
      'Monthly report: scans, ratings, feedback',
    ],
  },
  {
    name: 'Missed-Call Text-Back',
    setup: '$297 setup',
    monthly: '$197/mo',
    items: [
      'A business number that rings your cell',
      'Missed call? The caller gets your text in seconds',
      'Every missed call logged — no lead forgotten',
      'We handle the carrier (A2P 10DLC) registration',
    ],
  },
  {
    name: 'Both — Local Growth Kit',
    setup: '$697 setup',
    monthly: '$347/mo',
    highlight: true,
    items: ['Everything in both plans', 'One monthly report', 'Priority setup (live in about 2 weeks, after carrier approval)'],
  },
];

const CONTACT = 'mailto:dockplus@dockplusai.com?subject=Reviews%20Machine%20%2F%20Missed-Call%20Text-Back';

export default function ReviewsMachinePage() {
  return (
    <div className="min-h-screen bg-white text-[#0f172a]">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-lg font-extrabold">
            DockPlus <span className="text-emerald-600">AI</span>
          </span>
          <a href={CONTACT} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Book a demo
          </a>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-b from-emerald-50 to-white">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 md:py-24">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" /> For landscapers, contractors, restaurants & local shops
            </p>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
              More 5-star reviews. <span className="text-emerald-600">Zero leads lost</span> to missed calls.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
              Happy customers tap a stand and land on your Google review page. Unhappy ones talk to you privately first. And
              every call you cannot pick up gets an instant text back.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/r/demo" className="rounded-full bg-emerald-600 px-7 py-3.5 font-bold text-white shadow-lg hover:bg-emerald-700">
                Try the live review demo
              </Link>
              <a href={CONTACT} className="rounded-full border border-slate-300 px-7 py-3.5 font-semibold hover:bg-slate-50">
                Talk to us
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 p-8">
            <Smartphone className="h-9 w-9 text-emerald-600" />
            <h2 className="mt-4 text-2xl font-bold">How the Reviews Machine works</h2>
            <ol className="mt-5 grid gap-4 text-slate-600">
              <li><strong className="text-slate-900">1. Tap or scan.</strong> The customer taps their phone on the stand (NFC) or scans the QR code.</li>
              <li><strong className="text-slate-900">2. Rate in 5 seconds.</strong> One screen, five stars.</li>
              <li><strong className="text-slate-900">3a. 4–5 stars →</strong> straight to your Google review page.</li>
              <li><strong className="text-slate-900">3b. 1–3 stars →</strong> a private message to you, so you can fix it before it goes public.</li>
            </ol>
          </div>
          <div className="rounded-3xl border border-slate-200 p-8">
            <PhoneMissed className="h-9 w-9 text-emerald-600" />
            <h2 className="mt-4 text-2xl font-bold">How Missed-Call Text-Back works</h2>
            <ol className="mt-5 grid gap-4 text-slate-600">
              <li><strong className="text-slate-900">1. They call your business number.</strong> It rings your cell like always.</li>
              <li><strong className="text-slate-900">2. You are on a job and cannot answer.</strong></li>
              <li><strong className="text-slate-900">3. Seconds later</strong> they get a text from your business: “Sorry we missed you — how can we help?”</li>
              <li><strong className="text-slate-900">4. They reply by text</strong> instead of calling your competitor.</li>
            </ol>
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold sm:text-4xl">Simple pricing</h2>
            <p className="mt-2 text-center text-slate-600">No long contracts. Cancel anytime; the stands are yours.</p>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`flex flex-col rounded-3xl bg-white p-8 shadow-sm ${plan.highlight ? 'border-2 border-emerald-600' : 'border border-slate-200'}`}
                >
                  {plan.highlight && <span className="mb-3 self-start rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">Best value</span>}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-3 text-3xl font-extrabold">{plan.monthly}</p>
                  <p className="text-sm text-slate-500">{plan.setup}</p>
                  <ul className="mt-6 grid flex-1 gap-3 text-sm text-slate-600">
                    {plan.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a href={CONTACT} className="mt-8 rounded-full bg-slate-900 px-6 py-3 text-center font-semibold text-white hover:bg-emerald-700">
                    Get started
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <MessageSquareText className="mx-auto h-10 w-10 text-emerald-600" />
          <h2 className="mt-4 text-3xl font-extrabold">See it on your own phone</h2>
          <p className="mt-3 text-slate-600">Open the demo, give it 5 stars, then try 2 stars. That is exactly what your customers will see.</p>
          <Link href="/r/demo" className="mt-6 inline-block rounded-full bg-emerald-600 px-7 py-3.5 font-bold text-white hover:bg-emerald-700">
            Open the demo
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        DockPlus AI Solutions · Review stands 3D-printed by{' '}
        <Link href="/farmz3d" className="font-semibold text-emerald-700 underline">
          Farmz3D
        </Link>
      </footer>
    </div>
  );
}
