import React from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
}

/**
 * Component to inject JSON-LD structured data for SEO
 * Helps search engines understand your content better
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Organization schema for the website
 */
export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Rentalot',
    description: 'Premium rental property marketplace',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`,
    sameAs: [
      'https://www.facebook.com/rentalot',
      'https://www.twitter.com/rentalot',
      'https://www.instagram.com/rentalot',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@rentalot.com',
    },
  };

  return <StructuredData data={data} />;
}

/**
 * Website schema
 */
export function WebsiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Rentalot',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/browse?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <StructuredData data={data} />;
}

/**
 * Property listing schema
 */
export function PropertySchema({
  name,
  description,
  address,
  price,
  images,
  bedrooms,
  bathrooms,
  propertyType,
}: {
  name: string;
  description: string;
  address: string;
  price: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Apartment',
    name,
    description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
    },
    numberOfRooms: bedrooms,
    numberOfBathroomsTotal: bathrooms,
    image: images,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    additionalType: propertyType,
  };

  return <StructuredData data={data} />;
}

/**
 * Blog post article schema
 */
export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
  url,
}: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  url: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Rentalot',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return <StructuredData data={data} />;
}

/**
 * Breadcrumb schema
 */
export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <StructuredData data={data} />;
}
