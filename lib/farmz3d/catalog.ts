import { z } from 'zod';

// Prices are suggested starting points. Adjust them here before promoting the store;
// every page and email reads from this single list.

export const COLLECTION_IDS = ['halloween', 'thanksgiving', 'christmas', 'year-round', 'business'] as const;
export type CollectionId = (typeof COLLECTION_IDS)[number];

export type Collection = {
  id: CollectionId;
  name: string;
  tagline: string;
};

export type Product = {
  id: string;
  collection: CollectionId;
  name: string;
  description: string;
  personalizationHint: string;
  priceCents: number;
  unitLabel: string;
  emoji: string;
};

export const COLLECTIONS: Collection[] = [
  { id: 'halloween', name: 'Halloween', tagline: 'Spooky, personalized, printed in our workshop.' },
  { id: 'thanksgiving', name: 'Thanksgiving', tagline: 'Set a table everyone remembers.' },
  { id: 'christmas', name: 'Christmas', tagline: 'Ornaments and gifts with their name on it.' },
  { id: 'year-round', name: 'Year-round gifts', tagline: 'Keepsakes for birthdays, pets and celebrations.' },
  { id: 'business', name: 'For businesses', tagline: 'Branded pieces that work at the counter.' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'halloween-bucket-tag',
    collection: 'halloween',
    name: 'Trick-or-Treat Name Tag',
    description: 'Custom name tag that clips onto any candy bucket or bag. Pumpkin, ghost or bat shape.',
    personalizationHint: 'Name + shape (pumpkin, ghost or bat)',
    priceCents: 1200,
    unitLabel: 'each',
    emoji: '🎃',
  },
  {
    id: 'halloween-cookie-cutters',
    collection: 'halloween',
    name: 'Halloween Cookie Cutter Set',
    description: 'Set of 3 food-contact PLA cutters. Add a name or monogram cutter for your family.',
    personalizationHint: 'Name or monogram for the custom cutter',
    priceCents: 2400,
    unitLabel: 'set of 3',
    emoji: '🦇',
  },
  {
    id: 'halloween-lithophane',
    collection: 'halloween',
    name: 'Spooky Photo Lithophane Light',
    description: 'Your photo printed in 3D — it appears when the warm LED behind it turns on.',
    personalizationHint: 'We will ask for the photo by email after the order',
    priceCents: 4500,
    unitLabel: 'each',
    emoji: '👻',
  },
  {
    id: 'thanksgiving-place-cards',
    collection: 'thanksgiving',
    name: 'Personalized Place Card Holders',
    description: 'Leaf or pumpkin holders with each guest name printed in.',
    personalizationHint: 'Guest names, separated by commas',
    priceCents: 3600,
    unitLabel: 'set of 6',
    emoji: '🍂',
  },
  {
    id: 'thanksgiving-napkin-rings',
    collection: 'thanksgiving',
    name: 'Name Napkin Rings',
    description: 'Napkin rings with each name — doubles as a take-home keepsake.',
    personalizationHint: 'Names, separated by commas',
    priceCents: 3000,
    unitLabel: 'set of 6',
    emoji: '🦃',
  },
  {
    id: 'christmas-name-ornament',
    collection: 'christmas',
    name: 'Personalized Name Ornament',
    description: 'Layered ornament with name and year. Snowflake, star or tree.',
    personalizationHint: 'Name + year + shape (snowflake, star or tree)',
    priceCents: 1500,
    unitLabel: 'each',
    emoji: '🎄',
  },
  {
    id: 'christmas-stocking-tags',
    collection: 'christmas',
    name: 'Stocking Name Tags',
    description: 'Clip-on name tags so every stocking is claimed.',
    personalizationHint: 'Names, separated by commas',
    priceCents: 2800,
    unitLabel: 'set of 4',
    emoji: '🧦',
  },
  {
    id: 'christmas-photo-lithophane',
    collection: 'christmas',
    name: 'Photo Lithophane Ornament',
    description: 'Family photo lithophane ornament — the gift grandparents keep forever.',
    personalizationHint: 'We will ask for the photo by email after the order',
    priceCents: 4500,
    unitLabel: 'each',
    emoji: '⭐',
  },
  {
    id: 'pet-memorial',
    collection: 'year-round',
    name: 'Pet Memorial Keepsake',
    description: 'Paw-print plaque with your pet name and dates, or a photo lithophane.',
    personalizationHint: 'Pet name + dates (photo requested by email)',
    priceCents: 5500,
    unitLabel: 'each',
    emoji: '🐾',
  },
  {
    id: 'cake-topper',
    collection: 'year-round',
    name: 'Custom Cake Topper',
    description: 'Name and age topper for birthdays, weddings and baby showers.',
    personalizationHint: 'Text + color',
    priceCents: 2500,
    unitLabel: 'each',
    emoji: '🎂',
  },
  {
    id: 'business-review-stand',
    collection: 'business',
    name: 'Google Review NFC + QR Stand',
    description: 'Counter stand with your logo. Customers tap their phone or scan to leave a review.',
    personalizationHint: 'Business name (we will ask for the logo by email)',
    priceCents: 4500,
    unitLabel: 'each',
    emoji: '📲',
  },
];

const PRODUCT_IDS = PRODUCTS.map((product) => product.id) as [string, ...string[]];

export function getProduct(productId: string) {
  return PRODUCTS.find((product) => product.id === productId) ?? null;
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

export const OrderInputSchema = z
  .object({
    productId: z.enum(PRODUCT_IDS, { error: 'Please choose a product.' }),
    quantity: z.coerce.number().int().min(1).max(50),
    personalization: z.string().trim().min(1, 'Tell us what to personalize.').max(300),
    neededBy: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date picker.')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    fulfillment: z.enum(['pickup', 'shipping']),
    shippingZip: optionalText(10),
    name: z.string().trim().min(2, 'Please enter your name.').max(120),
    email: z.email('Please enter a valid email.').max(200),
    phone: optionalText(40),
    notes: optionalText(1000),
    company: z.string().max(120).optional(),
    startedAt: z.number().optional(),
  })
  .refine(
    (order) => order.fulfillment === 'pickup' || /^\d{5}(-\d{4})?$/.test(order.shippingZip ?? ''),
    { message: 'Enter a 5-digit US ZIP code for shipping.', path: ['shippingZip'] },
  );

export type OrderInput = z.infer<typeof OrderInputSchema>;
