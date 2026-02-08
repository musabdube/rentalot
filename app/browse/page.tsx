import type { Metadata } from 'next';
import BrowseClient from './BrowseClient';

export const metadata: Metadata = {
  title: 'Browse Rentals | Rentalot',
  description: 'Browse verified rental listings, filter by price, bedrooms, and location, and compare properties on Rentalot.',
  keywords: ['browse rentals', 'rental listings', 'apartments for rent', 'houses for rent', 'Rentalot'],
  alternates: { canonical: '/browse' },
  openGraph: {
    title: 'Browse Rentals | Rentalot',
    description: 'Browse verified rental listings, filter by price, bedrooms, and location, and compare properties on Rentalot.',
    url: '/browse',
    siteName: 'Rentalot',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Rentals | Rentalot',
    description: 'Browse verified rental listings, filter by price, bedrooms, and location, and compare properties on Rentalot.',
  },
};

export default function BrowsePage() {
  return <BrowseClient />;
}
