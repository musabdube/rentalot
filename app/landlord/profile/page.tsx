'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Save, X, MapPin, Phone, Mail, FileText, Eye, EyeOff, Lock, User } from 'lucide-react';
import { useEffect, useState } from 'react';import toast from 'react-hot-toast';import Image from 'next/image';

interface LandlordProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  verificationStatus: boolean;
}

export default function LandlordProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<LandlordProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<LandlordProfile>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
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
    if (status === 'loading') {
      return;
    }

    if (!session || session.user?.role !== 'LANDLORD') {
      router.push('/auth/signin');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/landlord/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setFormData(data);
          if (data.avatar) {
            setAvatarPreview(data.avatar);
          }
          if (data.deleteRequested) {
            setDeleteRequested(Boolean(data.deleteRequested));
            setDeleteRequestedAt(data.deleteRequestedAt || null);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, status, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value as string);
        }
      });

      // Add avatar file if changed
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const response = await fetch('/api/landlord/profile', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setFormData(updatedProfile);
        setAvatarFile(null);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setAvatarFile(null);
    if (profile?.avatar) {
      setAvatarPreview(profile.avatar);
    }
    setIsEditing(false);
  };

  if (status === 'loading' || loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!profile) {
    return <div className="p-8">Failed to load profile</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/landlord/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><User className="w-7 h-7 text-emerald-600" />My Profile</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Avatar Section */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Profile Picture</h2>
                <p className="text-gray-600 text-sm">Your profile picture is displayed to tenants</p>
              </div>
              {isEditing && (
                <label className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+263 77 123 4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., Zimbabwe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., Harare"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., HRR 263"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="e.g., 12 Samora Machel Avenue, Harare"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Bio / About Me
              </label>
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Tell tenants about yourself, your properties, and what makes you a great landlord..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Verification Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Verification Status</h3>
                  <p className="text-sm text-gray-600">Your account verification status</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                  profile.verificationStatus
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.verificationStatus ? '✓ Verified' : 'Pending Verification'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 className="w-5 h-5" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </>
            )}
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
                    const res = await fetch('/api/landlord/request-delete', { method: 'POST' });
                    if (res.ok) {
                      setDeleteRequested(true);
                      const data = await res.json();
                      setDeleteRequestedAt(data.user.deleteRequestedAt || null);
                    } else {
                      toast.error('Failed to request deletion');
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error('Failed to request deletion');
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
                        const res = await fetch('/api/landlord/request-delete', { method: 'DELETE' });
                        if (res.ok) {
                          setDeleteRequested(false);
                          setDeleteRequestedAt(null);
                        } else {
                          toast.error('Failed to cancel deletion');
                        }
                      } catch (err) {
                        console.error(err);
                        toast.error('Failed to cancel deletion');
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
        </div>
      </main>
    </div>
  );
}
