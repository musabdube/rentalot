'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Check, X, Loader, Eye, EyeOff, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function TenantProfilePage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    bio: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [deleteRequested, setDeleteRequested] = useState(false);
  const [deleteRequestedAt, setDeleteRequestedAt] = useState<string | null>(null);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'TENANT') {
      redirect('/auth/signin');
    }

    // Fetch current profile
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/tenant/profile');
        const data = await res.json();

        if (res.ok) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            country: data.country || '',
            postalCode: data.postalCode || '',
            bio: data.bio || '',
          });
          if (data.avatar) {
            setAvatarPreview(data.avatar);
          }
          if (data.deleteRequested) {
            setDeleteRequested(Boolean(data.deleteRequested));
            setDeleteRequestedAt(data.deleteRequestedAt || null);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [status, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('postalCode', formData.postalCode);
      formDataToSend.append('bio', formData.bio);

      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const res = await fetch('/api/tenant/profile', {
        method: 'PUT',
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Profile updated successfully!');
        setAvatarFile(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while saving');
      console.error('Error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/tenant/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 font-medium">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
              <X className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
              <Check className="w-5 h-5" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={avatarPreview || 'https://via.placeholder.com/150?text=No+Avatar'}
                    alt="Avatar preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-emerald-100"
                  />
                  <label className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg">
                    <Upload className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Upload a new profile picture</p>
                  <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 5MB.</p>
                  {avatarFile && (
                    <p className="text-sm text-emerald-600 mt-2">✓ {avatarFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="Postal code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Me
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell landlords about yourself (interests, work, lifestyle, etc.)"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
              <Link
                href="/tenant/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>

            {/* Change Password */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Account</h3>
                <div>
                  <button onClick={() => setShowChangePassword((s) => !s)} className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                    {showChangePassword ? 'Close' : 'Change Password'}
                  </button>
                </div>
              </div>

              {showChangePassword && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <div className="relative">
                        <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg" />
                        <button type="button" onClick={() => setShowCurrent((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                          {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <div className="relative">
                        <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg" />
                        <button type="button" onClick={() => setShowNew((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                          {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New</label>
                      <div className="relative">
                        <input type={showConfirm ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg" />
                        <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                          {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button onClick={async () => {
                      setChangingPwd(true);
                      try {
                        if (!currentPassword || !newPassword || !confirmNewPassword) { toast.error('All password fields are required'); setChangingPwd(false); return; }
                        if (newPassword.length < 8) { toast.error('New password must be at least 8 characters'); setChangingPwd(false); return; }
                        if (newPassword !== confirmNewPassword) { toast.error('New passwords do not match'); setChangingPwd(false); return; }

                        const res = await fetch('/api/auth/change-password', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ currentPassword, newPassword, confirmPassword: confirmNewPassword }),
                        });
                        const data = await res.json();
                        if (!res.ok) { toast.error(data?.message || 'Failed to change password'); } else { toast.success('Password changed successfully'); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); setShowChangePassword(false); }
                      } catch (err) {
                        console.error('Error changing password:', err);
                        toast.error('Error changing password');
                      } finally { setChangingPwd(false); }
                    }} disabled={changingPwd} className="bg-emerald-600 text-white px-4 py-2 rounded-lg">
                      {changingPwd ? 'Changing...' : 'Save Password'}
                    </button>
                    <button onClick={() => { setShowChangePassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4">
              {!deleteRequested ? (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/tenant/request-delete', { method: 'POST' });
                      if (res.ok) {
                        setDeleteRequested(true);
                        const data = await res.json();
                        setDeleteRequestedAt(data.user.deleteRequestedAt || null);
                      } else {
                        const err = await res.json();
                        setError(err.error || 'Failed to request deletion');
                      }
                    } catch (e) {
                      setError('Failed to request deletion');
                    }
                  }}
                  className="w-full mt-2 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Request Account Deletion
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-yellow-700">You have requested account deletion{deleteRequestedAt ? ` on ${new Date(deleteRequestedAt).toLocaleString()}` : ''}.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/tenant/request-delete', { method: 'DELETE' });
                          if (res.ok) {
                            setDeleteRequested(false);
                            setDeleteRequestedAt(null);
                          } else {
                            const err = await res.json();
                            setError(err.error || 'Failed to cancel deletion');
                          }
                        } catch (e) {
                          setError('Failed to cancel deletion');
                        }
                      }}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
                    >
                      Cancel Deletion Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
