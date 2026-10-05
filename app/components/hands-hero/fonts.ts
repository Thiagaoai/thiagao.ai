import { Outfit } from 'next/font/google';

// Display face for the hands hero, exposed as --ht-display on the hero root.
export const handsDisplay = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--ht-display',
  display: 'swap',
});
