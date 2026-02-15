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
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Browse Rental Properties on Rentalot',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Rentals | Rentalot',
    description: 'Browse verified rental listings, filter by price, bedrooms, and location, and compare properties on Rentalot.',
    images: ['/og-image.jpg'],
    creator: '@rentalot',
    site: '@rentalot',
  },
};

export default function BrowsePage() {
  return <BrowseClient />;
}
