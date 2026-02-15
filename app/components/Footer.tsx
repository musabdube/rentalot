'use client';

import Link from 'next/link';
import { Home, MessageCircle, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">RentALot</h2>
                <p className="text-sm text-gray-400">Find Your Dream Home</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted platform for finding rental properties and connecting landlords with tenants.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/browse" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Compare
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a href="/contact#faq" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Get In Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-400 mt-1" />
                <div>
                  <p className="text-emerald-400 font-semibold">Live Chat Support</p>
                  <span className="text-gray-400 text-sm">Click the chat icon to message us</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 mt-1" />
                <span className="text-gray-400">Harare<br />Zimbabwe</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400 text-sm">
            &copy; {currentYear} RentALot. All rights reserved. | Built with ❤️ for renters and landlords.
          </p>
        </div>
      </div>
    </footer>
  );
}
