'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, PlusCircle } from 'lucide-react';

const CLEANNESS_OPTIONS = ['very_clean', 'average', 'relaxed'];
const GENDER_OPTIONS = ['any', 'male', 'female'];

export default function CreateRoommateListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    bio: '',
    budget: '',
    currency: 'USD',
    preferredLocation: '',
    moveInDate: '',
    moveOutDate: '',
    smoking: false,
    pets: false,
    studyFriendly: false,
    nightOwl: false,
    earlyBird: false,
    cleanliness: 'average',
    gender: 'any',
    occupation: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.bio || !form.budget || !form.preferredLocation || !form.moveInDate) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/roommate/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, budget: Number(form.budget) }),
    });
    setLoading(false);

    if (res.ok) {
      router.push('/tenant/roommate/my-listing');
    } else {
      const d = await res.json();
      setError(d.error ?? 'Something went wrong');
    }
  };

  if (status === 'loading') return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/tenant/roommate" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2"><PlusCircle className="w-5 h-5 text-emerald-600" />Post a Roommate Listing</h1>
          <p className="text-sm text-gray-500 mb-6">Tell other tenants about yourself and what you&apos;re looking for.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listing Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Looking for a quiet roommate in Harare"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About You <span className="text-red-500">*</span></label>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="Describe yourself, your lifestyle, and what you expect from a roommate..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
              />
            </div>

            {/* Budget + currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="0"
                  value={form.budget}
                  onChange={(e) => set('budget', e.target.value)}
                  placeholder="500"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => set('currency', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                >
                  <option value="USD">USD</option>
                  <option value="ZWL">ZWL</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.preferredLocation}
                onChange={(e) => set('preferredLocation', e.target.value)}
                placeholder="e.g. Avondale, Harare"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            {/* Move-in / move-out */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.moveInDate}
                  onChange={(e) => set('moveInDate', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Move-out Date</label>
                <input
                  type="date"
                  value={form.moveOutDate}
                  onChange={(e) => set('moveOutDate', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => set('occupation', e.target.value)}
                placeholder="e.g. Student, Software Developer..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            {/* Gender preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Roommate Gender</label>
              <div className="flex gap-3">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set('gender', g)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border capitalize ${
                      form.gender === g
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Cleanliness */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cleanliness Level</label>
              <div className="flex gap-3 flex-wrap">
                {CLEANNESS_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('cleanliness', c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border ${
                      form.cleanliness === c
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                    }`}
                  >
                    {c.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifestyle toggles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lifestyle</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {([
                  ['smoking', 'Smoker'],
                  ['pets', 'Has Pets'],
                  ['studyFriendly', 'Study-friendly'],
                  ['nightOwl', 'Night Owl'],
                  ['earlyBird', 'Early Bird'],
                ] as [keyof typeof form, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(form[key])}
                      onChange={(e) => set(key, e.target.checked)}
                      className="accent-emerald-600"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-full font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Posting...' : 'Post Listing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
