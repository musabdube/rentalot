import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthSessionProvider } from "./providers";
import { Footer } from "./components/Footer";
import { CookieConsent } from "./components/CookieConsent";
import LiveChatWidget from "./components/LiveChatWidget";
import { OrganizationSchema, WebsiteSchema } from "./components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Rentalot - Find Your Perfect Rental Property",
    template: "%s | Rentalot",
  },
  description: "Discover premium rental properties with Rentalot. Browse apartments, houses, and commercial spaces. Connect with verified landlords and find your perfect home today.",
  keywords: [
    "rental properties",
    "apartments for rent",
    "houses for rent",
    "property rental",
    "find rental",
    "landlord",
    "tenant",
    "real estate rental",
    "rental marketplace",
  ],
  authors: [{ name: "Rentalot" }],
  creator: "Rentalot",
  publisher: "Rentalot",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Rentalot",
    title: "Rentalot - Find Your Perfect Rental Property",
    description: "Discover premium rental properties with Rentalot. Browse apartments, houses, and commercial spaces. Connect with verified landlords and find your perfect home today.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rentalot - Premium Rental Properties",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rentalot - Find Your Perfect Rental Property",
    description: "Discover premium rental properties with Rentalot. Browse apartments, houses, and commercial spaces.",
    images: ["/og-image.jpg"],
    creator: "@rentalot",
    site: "@rentalot",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "1ofwIjf-Tu6I8WUqgv-XCrKZmSo4OXD3xKkv8GVaI6Y",
   
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthSessionProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CookieConsent />
          <LiveChatWidget />
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
