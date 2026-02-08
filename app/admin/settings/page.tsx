'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Settings as SettingsIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PlatformSettings {
  id: string;
  platformName: string;
  platformEmail: string;
  maintenanceMode: boolean;
  enableReporting: boolean;
  enableMessaging: boolean;
  enableViewingSchedule: boolean;
  enablePayments: boolean;
  requireLandlordVerification: boolean;
  autoApproveListing: boolean;
  platformCommissionPercent: number;
  minCommissionAmount: number;
  maxFeaturedDays: number;
  featuredListingPrice: number;
  maxUploadSizeMB: number;
  maxImagesPerListing: number;
  adminNotes?: string;
}

export default function AdminSettingsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchSettings();
  }, [session, sessionStatus, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Error loading settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Error saving settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!settings) {
    return <div className="p-8">No settings found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform-wide settings and features</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-emerald-600" />
              General Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Platform Email
                </label>
                <input
                  type="email"
                  value={settings.platformEmail}
                  onChange={(e) => setSettings({ ...settings, platformEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <label htmlFor="maintenance" className="text-sm font-semibold text-gray-700">
                  Maintenance Mode (temporarily disable platform)
                </label>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Feature Toggles</h2>

            <div className="space-y-3">
              {[
                { key: 'enableReporting', label: 'Enable User Reporting' },
                { key: 'enableMessaging', label: 'Enable Messaging System' },
                { key: 'enableViewingSchedule', label: 'Enable Viewing Schedule' },
                { key: 'enablePayments', label: 'Enable Payment Processing' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={key}
                    checked={settings[key as keyof PlatformSettings] as boolean}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        [key]: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-emerald-600 rounded"
                  />
                  <label htmlFor={key} className="text-sm font-semibold text-gray-700">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Verification & Approval */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Verification & Approval</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requireVerification"
                  checked={settings.requireLandlordVerification}
                  onChange={(e) =>
                    setSettings({ ...settings, requireLandlordVerification: e.target.checked })
                  }
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <label htmlFor="requireVerification" className="text-sm font-semibold text-gray-700">
                  Require Landlord Verification
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoApprove"
                  checked={settings.autoApproveListing}
                  onChange={(e) =>
                    setSettings({ ...settings, autoApproveListing: e.target.checked })
                  }
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <label htmlFor="autoApprove" className="text-sm font-semibold text-gray-700">
                  Auto-Approve New Listings
                </label>
              </div>
            </div>
          </div>

          {/* Commission Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Commission Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Platform Commission (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.platformCommissionPercent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      platformCommissionPercent: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Commission Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.minCommissionAmount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      minCommissionAmount: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Featured Listing Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Listing Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Featured Days
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.maxFeaturedDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxFeaturedDays: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Featured Listing Price ($) - Set to 0 for free
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.featuredListingPrice}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      featuredListingPrice: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Upload Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Upload Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.maxUploadSizeMB}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxUploadSizeMB: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Images Per Listing
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.maxImagesPerListing}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxImagesPerListing: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Notes</h2>

            <textarea
              value={settings.adminNotes || ''}
              onChange={(e) => setSettings({ ...settings, adminNotes: e.target.value })}
              placeholder="Add any internal notes about platform configuration..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 h-24"
            />
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <Link
              href="/admin/dashboard"
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-semibold text-center"
            >
              Cancel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
