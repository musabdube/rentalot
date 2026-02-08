import type { Metadata } from 'next';
import HomeClient from './home/HomeClient';

export const metadata: Metadata = {
  title: 'Rentalot | Find Your Perfect Rental Home',
  description: 'Browse verified rental properties, compare listings, and find your next home with Rentalot.',
  keywords: ['rentalot', 'rental properties', 'apartments', 'houses', 'property rentals', 'real estate'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Rentalot | Find Your Perfect Rental Home',
    description: 'Browse verified rental properties, compare listings, and find your next home with Rentalot.',
    url: '/',
    siteName: 'Rentalot',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rentalot | Find Your Perfect Rental Home',
    description: 'Browse verified rental properties, compare listings, and find your next home with Rentalot.',
  },
};

export default function Page() {
  return <HomeClient />;
}
