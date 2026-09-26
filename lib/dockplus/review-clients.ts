// Reviews Machine clients. One entry per business; the slug becomes /r/<slug>
// (the URL written to the NFC tag and QR code).
//
// googleReviewUrl comes from the client's Google Business Profile
// ("Ask for reviews" / "Get more reviews" share link). Leave null until you have it:
// the page then runs in demo mode and never sends anyone to a wrong business.

export type ReviewClient = {
  slug: string;
  businessName: string;
  googleReviewUrl: string | null;
  notifyEmail: string | null;
  accentColor: string;
};

export const REVIEW_CLIENTS: ReviewClient[] = [
  {
    slug: 'demo',
    businessName: 'Cape Cod Landscaping (demo)',
    googleReviewUrl: null,
    notifyEmail: null,
    accentColor: '#15803d',
  },
];

export function getReviewClient(slug: string) {
  return REVIEW_CLIENTS.find((client) => client.slug === slug) ?? null;
}
