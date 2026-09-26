import type { Metadata } from 'next';
import Link from 'next/link';
import { COLLECTIONS, formatUsd, PRODUCTS, type CollectionId } from '@/lib/farmz3d/catalog';
import { formatLongDate, getActiveCampaign, getUpcomingCampaigns, newYorkToday, type CampaignId } from '@/lib/farmz3d/season';
import { MotionRoot, PrintedOrnament, Reveal, TiltCard } from './Motion';
import OrderForm from './OrderForm';

// Re-render hourly so the active campaign and countdown follow the calendar.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Farmz3D — Personalized 3D-Printed Holiday Gifts',
  description:
    'Custom 3D-printed Halloween, Thanksgiving and Christmas gifts: name ornaments, photo lithophanes, place cards and more. Made to order.',
  alternates: { canonical: '/farmz3d' },
  openGraph: {
    title: 'Farmz3D — Personalized 3D-Printed Holiday Gifts',
    description: 'Made-to-order personalized gifts for Halloween, Thanksgiving and Christmas.',
    url: '/farmz3d',
    type: 'website',
    locale: 'en_US',
  },
};

const THEME: Record<CampaignId, { bg: string; accent: string; label: string }> = {
  halloween: { bg: 'from-[#1f130c] via-[#3a1d0b] to-[#6b2d0c]', accent: '#f08a24', label: '🎃' },
  thanksgiving: { bg: 'from-[#2a1a0e] via-[#5a3413] to-[#8a5a1c]', accent: '#f2b33d', label: '🍂' },
  christmas: { bg: 'from-[#0f2418] via-[#16402a] to-[#7a1820]', accent: '#f5d37a', label: '🎄' },
};

const FAQ = [
  {
    q: 'When do I pay?',
    a: 'After we review your order we email you a confirmation and a secure payment link. Nothing is charged before you approve it.',
  },
  {
    q: 'How do photo lithophanes work?',
    a: 'We turn your photo into a 3D print with different thicknesses. When light shines through it, the photo appears. After you order, we reply asking for the photo.',
  },
  {
    q: 'What are the pieces made of?',
    a: 'PLA plastic printed in our workshop. Cookie cutters use food-contact PLA; hand wash only.',
  },
  {
    q: 'What if I need it faster?',
    a: 'Add your date in "Needed by". We confirm by email whether we can make it before you pay.',
  },
];

export default function Farmz3dPage() {
  const campaign = getActiveCampaign();
  const upcoming = getUpcomingCampaigns();
  const today = newYorkToday();
  const theme = THEME[campaign.id];
  const instagram = process.env.NEXT_PUBLIC_FARMZ3D_INSTAGRAM?.replace(/^@/, '');

  const collectionOrder: CollectionId[] = [
    campaign.id,
    ...COLLECTIONS.map((collection) => collection.id).filter((id) => id !== campaign.id),
  ];
  const firstProduct = PRODUCTS.find((product) => product.collection === campaign.id) ?? PRODUCTS[0];
  const productOptions = collectionOrder.flatMap((collectionId) => {
    const collection = COLLECTIONS.find((item) => item.id === collectionId);
    return PRODUCTS.filter((product) => product.collection === collectionId).map((product) => ({
      id: product.id,
      name: product.name,
      collectionName: collection?.name ?? collectionId,
      priceCents: product.priceCents,
      unitLabel: product.unitLabel,
      personalizationHint: product.personalizationHint,
    }));
  });

  return (
    <div className="min-h-screen bg-[#fbf6ee] text-[#2b1d12]">
      <header className="sticky top-0 z-30 border-b border-[#e6d8c4] bg-[#fbf6ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="text-xl font-extrabold tracking-tight">
            Farmz<span className="text-[#c2571a]">3D</span>
          </a>
          <nav className="flex items-center gap-4 text-sm font-medium sm:gap-6">
            <a href="#collections" className="hidden hover:text-[#c2571a] sm:inline">Collections</a>
            <a href="#how" className="hidden hover:text-[#c2571a] sm:inline">How it works</a>
            <a href="#order" className="rounded-full bg-[#2b1d12] px-4 py-2 text-white hover:bg-[#c2571a]">Order now</a>
          </nav>
        </div>
      </header>

      <MotionRoot>
      <main id="top">
        <section className={`bg-gradient-to-br ${theme.bg} text-white`}>
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.3fr_1fr] md:py-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold">
                {theme.label} {campaign.name} collection is open
              </p>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
                Personalized gifts, <span style={{ color: theme.accent }}>3D-printed</span> just for them.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-white/80">
                Name ornaments, photo lithophanes, place cards and keepsakes — made to order in our workshop, one family at a time.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#order"
                  data-product-id={firstProduct.id}
                  className="rounded-full px-7 py-3.5 text-center font-bold text-[#2b1d12] shadow-lg transition hover:brightness-110"
                  style={{ backgroundColor: theme.accent }}
                >
                  Order for {campaign.name}
                </a>
                <a href="#collections" className="rounded-full border border-white/40 px-7 py-3.5 text-center font-semibold hover:bg-white/10">
                  See all gifts
                </a>
              </div>
            </div>

            <div className="self-center">
            <PrintedOrnament accent={theme.accent} />
            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-widest text-white/70">{campaign.name} order deadline</p>
              <p className="mt-2 text-3xl font-extrabold">{formatLongDate(campaign.orderByDate)}</p>
              <p className="mt-1 text-white/80">
                {campaign.daysUntilOrderBy === 0
                  ? 'Last day to order!'
                  : `${campaign.daysUntilOrderBy} day${campaign.daysUntilOrderBy === 1 ? '' : 's'} left to order`}{' '}
                · holiday on {formatLongDate(campaign.holidayDate)}
              </p>
              <ul className="mt-6 grid gap-3 border-t border-white/15 pt-5 text-sm">
                {upcoming.map((item) => (
                  <li key={`${item.id}-${item.holidayDate}`} className="flex items-center justify-between gap-4">
                    <span className="font-semibold">
                      {THEME[item.id].label} {item.name}
                    </span>
                    <span className="text-white/75">order by {formatLongDate(item.orderByDate)}</span>
                  </li>
                ))}
              </ul>
            </div>
            </div>
          </div>
        </section>

        <section id="collections" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Pick a gift</h2>
          <p className="mt-2 text-[#5b4a3a]">Every piece is personalized. Prices are per item or set as shown; shipping is quoted on confirmation.</p>

          {collectionOrder.map((collectionId) => {
            const collection = COLLECTIONS.find((item) => item.id === collectionId);
            const products = PRODUCTS.filter((product) => product.collection === collectionId);
            if (!collection || products.length === 0) return null;
            return (
              <Reveal key={collection.id} className="mt-12">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-2xl font-bold">{collection.name}</h3>
                  <p className="text-sm text-[#7a6552]">{collection.tagline}</p>
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <TiltCard key={product.id} className="flex h-full flex-col rounded-3xl border border-[#e6d8c4] bg-white p-6 shadow-sm transition-shadow hover:shadow-xl">
                      <div className="flex h-28 items-center justify-center rounded-2xl bg-[#f5ebdc] text-6xl [transform:translateZ(40px)]" aria-hidden="true">
                        {product.emoji}
                      </div>
                      <h4 className="mt-5 text-lg font-bold">{product.name}</h4>
                      <p className="mt-2 flex-1 text-sm text-[#5b4a3a]">{product.description}</p>
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <p>
                          <span className="text-xl font-extrabold">{formatUsd(product.priceCents)}</span>{' '}
                          <span className="text-xs text-[#7a6552]">{product.unitLabel}</span>
                        </p>
                        <a
                          href="#order"
                          data-product-id={product.id}
                          className="rounded-full bg-[#2b1d12] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c2571a]"
                        >
                          Order this
                        </a>
                      </div>
                    </TiltCard>
                  ))}
                </div>
                {collection.id === 'business' && (
                  <p className="mt-4 text-sm text-[#5b4a3a]">
                    Want the stand to send happy customers straight to Google and catch unhappy ones privately?{' '}
                    <Link href="/reviews-machine" className="font-semibold text-[#c2571a] underline">
                      See the Reviews Machine
                    </Link>
                    .
                  </p>
                )}
              </Reveal>
            );
          })}
        </section>

        <section id="how" className="border-y border-[#e6d8c4] bg-[#f5ebdc]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-3xl font-extrabold sm:text-4xl">How it works</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Send your order', 'Pick the gift and tell us the names, text or date.'],
                ['We confirm', 'You get an email with the final price and a payment link.'],
                ['We print', 'Your piece is printed and finished by hand.'],
                ['Ship or pick up', 'Shipped to you, or picked up locally.'],
              ].map(([title, text], index) => (
                <Reveal key={title} delay={index * 0.1} className="rounded-3xl bg-white p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c2571a] font-bold text-white">{index + 1}</span>
                  <h3 className="mt-4 font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-[#5b4a3a]">{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="order" className="mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-3xl font-extrabold sm:text-4xl">Place your order</h2>
            <p className="mt-3 text-[#5b4a3a]">
              {campaign.name} orders close on <strong>{formatLongDate(campaign.orderByDate)}</strong>. You only pay after we confirm the details.
            </p>
            <dl className="mt-8 grid gap-5">
              {FAQ.map((item) => (
                <div key={item.q}>
                  <dt className="font-bold">{item.q}</dt>
                  <dd className="mt-1 text-sm text-[#5b4a3a]">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
          <OrderForm products={productOptions} defaultProductId={firstProduct.id} today={today} />
        </section>
      </main>
      </MotionRoot>

      <footer className="border-t border-[#e6d8c4] py-8 text-center text-sm text-[#7a6552]">
        <p>
          © {today.slice(0, 4)} Farmz3D · Personalized 3D-printed gifts
          {instagram && (
            <>
              {' · '}
              <a href={`https://www.instagram.com/${instagram}/`} className="font-semibold text-[#c2571a]" rel="noopener noreferrer" target="_blank">
                @{instagram}
              </a>
            </>
          )}
        </p>
      </footer>
    </div>
  );
}
