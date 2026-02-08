'use client';

import { Header } from '@/app/components/Header';
import { Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                RentALot ("we", "us", "our", or "Company") operates the RentALot website and application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.
              </p>
            </div>

            {/* Data Collection */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Information Collection</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We collect several types of information for various purposes to provide and improve our service to you:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Personal Data:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Email address</li>
                    <li>First name and last name</li>
                    <li>Phone number</li>
                    <li>Address, City, Province, Postal code, Country</li>
                    <li>Cookies and usage data</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Usage Data:</h3>
                  <p className="text-gray-600">
                    When you access the service by or through a mobile device, we may collect certain information automatically, including, but not limited to, the type of mobile device you use, your mobile device unique ID, the IP address of your mobile device, and certain information about your use of the service.
                  </p>
                </div>
              </div>
            </div>

            {/* Use of Data */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Use of Data</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                RentALot uses the collected data for various purposes:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To allow you to participate in interactive features of our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so that we can improve our service</li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </div>

            {/* Security */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Security of Data</h2>
              <p className="text-gray-600 leading-relaxed flex items-start gap-3">
                <Lock className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
                The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
              </p>
            </div>

            {/* Third Party Services */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Third-Party Services</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We have no control over and assume no responsibility for the content, privacy policies or practices of any third-party sites or services.
              </p>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from children under 18. If we become aware that a child under 18 has provided us with personal data, we immediately delete such information from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us immediately.
              </p>
            </div>

            {/* Changes to Policy */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Changes to This Privacy Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
              </p>
            </div>

            {/* User Rights */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Access the personal data we hold about you</li>
                <li>Correct any inaccurate or incomplete data</li>
                <li>Request the deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-semibold">Email:</span>{' '}
                  <a href="mailto:support@rentalot.co.zw" className="text-emerald-600 hover:text-emerald-700">
                    support@rentalot.co.zw
                  </a>
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Phone:</span> +263 (4) XXX-XXXX
                </p>
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
