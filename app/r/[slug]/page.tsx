import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getReviewClient, REVIEW_CLIENTS } from '@/lib/dockplus/review-clients';
import ReviewFunnel from './ReviewFunnel';

type Params = { slug: string };

export function generateStaticParams() {
  return REVIEW_CLIENTS.map((client) => ({ slug: client.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const client = getReviewClient(slug);
  return {
    title: client ? `How did we do? — ${client.businessName}` : 'Review',
    robots: { index: false, follow: false },
  };
}

export default async function ReviewPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const client = getReviewClient(slug);
  if (!client) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-4 py-10 text-[#111827]">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: client.accentColor }}>
          {client.businessName}
        </p>
        <ReviewFunnel
          clientSlug={client.slug}
          businessName={client.businessName}
          accentColor={client.accentColor}
          isDemo={!client.googleReviewUrl}
        />
      </div>
    </main>
  );
}
