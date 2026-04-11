'use client';

import { Header } from '@/app/components/Header';
import { CheckCircle, Users, Heart, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6 flex justify-center items-center gap-3"><Globe className="w-10 h-10 text-emerald-600" />About RentALot</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Revolutionizing the rental market by connecting landlords and tenants with transparency, trust, and ease.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  At RentALot, our mission is to simplify the rental process by providing a transparent, secure, and user-friendly platform where landlords can showcase their properties and tenants can find their dream homes with confidence.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We believe in removing barriers and building trust in the rental market through verified profiles, seamless communication, and fair practices.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                <p className="text-gray-600 leading-relaxed">
                  We envision a world where finding a rental property is as simple as browsing your favorite store, and where every landlord and tenant feels secure and respected in their transactions.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our vision is to become the leading rental platform globally, known for innovation, reliability, and customer satisfaction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Transparency</h3>
                <p className="text-gray-600">
                  We believe in open communication and honest dealings in every transaction on our platform.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Trust</h3>
                <p className="text-gray-600">
                  Building trust is fundamental. We verify users and protect both landlords and tenants.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Community</h3>
                <p className="text-gray-600">
                  We foster a supportive community where everyone's needs are valued and respected.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
                <p className="text-gray-600">
                  We continuously improve and evolve our platform to meet changing needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose RentALot?</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-1" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Listings</h3>
                  <p className="text-gray-600">
                    All properties are verified to ensure accuracy and legitimacy.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-1" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Communication</h3>
                  <p className="text-gray-600">
                    Chat directly with landlords or tenants through our secure messaging system.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-1" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Filtering</h3>
                  <p className="text-gray-600">
                    Find exactly what you need with our powerful search and filter options.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-1" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fair Pricing</h3>
                  <p className="text-gray-600">
                    Transparent pricing with no hidden fees or surprise charges.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-1" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
                  <p className="text-gray-600">
                    Our dedicated support team is always ready to help you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
