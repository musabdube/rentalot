'use client';

import { Header } from '@/app/components/Header';
import { CheckCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6 flex justify-center items-center gap-3"><CheckCircle className="w-10 h-10 text-emerald-600" />Terms of Service</h1>
              <p className="text-lg text-gray-600">
                Last updated: January 9, 2026
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Introduction */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                By accessing and using the RentALot website and application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            {/* Use License */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on RentALot for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>Modify or copy the materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>Use the materials for any commercial purpose or for any public display</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>Attempt to decompile or reverse engineer any software contained on RentALot</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>Remove any copyright or other proprietary notations from the materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>Transfer the materials to another person or "mirror" the materials on any other server</span>
                </li>
              </ul>
            </div>

            {/* User Accounts */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 leading-relaxed">
                If you create an account on RentALot, you are responsible for maintaining the confidentiality of your account information and password and for restricting access to your account. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized uses of your account.
              </p>
            </div>

            {/* User Conduct */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. User Conduct</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree that you will not use RentALot to:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>Harass, threaten, embarrass or cause distress or discomfort to any person</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>Offend, defame, libel, slander, abuse, harass, stalk, threaten or otherwise violate the legal rights of others</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>Post or transmit obscene or indecent images, messages or material</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>Engage in commercial activities or sales without authorization</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>Transmit or introduce viruses, worms or any other malicious code</span>
                </li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Intellectual Property Rights</h2>
              <p className="text-gray-600 leading-relaxed">
                All content included on this site, such as text, graphics, logos, images, as well as the compilation thereof, and any software used on this site, is the property of RentALot or its content suppliers and is protected by international copyright laws. The compilation of all content on this site is the exclusive property of RentALot and is protected by international copyright laws.
              </p>
            </div>

            {/* Liability Disclaimer */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                The materials on RentALot are provided on an 'as is' basis. RentALot makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </div>

            {/* Termination */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                RentALot may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms. Upon termination, your right to use the service will immediately cease.
              </p>
            </div>

            {/* Governing Law */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of the Republic of Zimbabwe, and you irrevocably submit to the exclusive jurisdiction of the courts located in Zimbabwe. Any disputes arising out of or in connection with this agreement shall be subject to the jurisdiction of the courts of Zimbabwe.
              </p>
            </div>

            {/* Changes to Terms */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                RentALot reserves the right to revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Our Terms?</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Live Chat Support</p>
                    <p className="text-gray-600 text-sm">
                      Click the chat icon at the bottom-right corner of any page to connect with our support team instantly.
                    </p>
                  </div>
                </div>
                <p className="text-gray-600">
                  <span className="font-semibold">Address:</span> Harare, Zimbabwe
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
