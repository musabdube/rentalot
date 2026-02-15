'use client';

import { Header } from '@/app/components/Header';
import { MessageCircle, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to send message');
      }

      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">Get In Touch</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Need help? Chat with our support team instantly using our live chat feature. We're here to help you!
              </p>
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <MessageCircle className="w-6 h-6 animate-pulse" />
                <p className="text-lg font-semibold">Look for the chat icon at the bottom-right corner 👉</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
              {/* Contact Info Cards */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-xl shadow-lg border-2 border-emerald-200 hover:shadow-xl transition-all">
                <div className="bg-emerald-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Live Chat Support</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Get instant help from our support team. Click the chat icon at the bottom-right corner to start a conversation.
                </p>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold text-emerald-600">💬 Available 24/7</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    We typically respond within minutes during business hours
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Location</h3>
                <p className="text-gray-600 leading-relaxed">
                  Harare<br />
                  Zimbabwe
                </p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 mb-16">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Business Hours</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                    <div>
                      <p className="font-semibold">Monday - Friday</p>
                      <p>9:00 AM - 6:00 PM</p>
                    </div>
                    <div>
                      <p className="font-semibold">Saturday - Sunday</p>
                      <p>10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Or Send Us a Message</h2>
                <p className="text-gray-600">
                  Prefer a form? Fill out the details below and we'll get back to you.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-gray-50 py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <details className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow">
                <summary className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-emerald-600">+</span>
                  How do I create an account?
                </summary>
                <p className="mt-4 text-gray-600 ml-6">
                  Click on the "Sign Up" button and choose whether you want to register as a tenant or landlord. Fill in your details and verify your email to get started.
                </p>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow">
                <summary className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-emerald-600">+</span>
                  Is my personal information safe?
                </summary>
                <p className="mt-4 text-gray-600 ml-6">
                  Yes, we use industry-standard encryption and security measures to protect your personal information. We never share your data with third parties without permission.
                </p>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow">
                <summary className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-emerald-600">+</span>
                  How do I list a property?
                </summary>
                <p className="mt-4 text-gray-600 ml-6">
                  If you're a landlord, go to your dashboard and click "Add Property". Fill in all the property details, upload photos, and submit for admin approval.
                </p>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow">
                <summary className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-emerald-600">+</span>
                  How can I get quick support?
                </summary>
                <p className="mt-4 text-gray-600 ml-6">
                  Use our live chat feature! Click the chat icon (💬) at the bottom-right corner of any page to instantly connect with our support team. We're available 24/7 to help you.
                </p>
              </details>

              <details className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow">
                <summary className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-emerald-600">+</span>
                  How do I contact a landlord?
                </summary>
                <p className="mt-4 text-gray-600 ml-6">
                  Use the messaging feature on the property listing to contact the landlord directly. You can also schedule viewings through our platform.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="bg-white py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal Information</h2>
            <p className="text-gray-600 mb-6">
              For more information about how we operate, please review our legal documents:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/privacy"
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
