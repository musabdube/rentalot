'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Save, X, Phone, FileText, Eye, EyeOff, Lock, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
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
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/admin/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFormData(data);
          if (data.avatar) setAvatarPreview(data.avatar);
        }
      } catch (err) {
        console.error('Error fetching admin profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v as any);
      });
      if (avatarFile) fd.append('avatar', avatarFile);

      const res = await fetch('/api/admin/profile', { method: 'PUT', body: fd });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setFormData(data);
        setAvatarFile(null);
        setIsEditing(false);
        toast.success('Profile updated');
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch (err) {
      console.error('Error saving admin profile:', err);
      toast.error('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setChangingPwd(true);
    try {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        toast.error('All password fields are required');
        setChangingPwd(false);
        return;
      }
      if (newPassword.length < 8) {
        toast.error('New password must be at least 8 characters');
        setChangingPwd(false);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        toast.error('New passwords do not match');
        setChangingPwd(false);
        return;
      }

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword: confirmNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || 'Failed to change password');
      } else {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowChangePassword(false);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('Error changing password');
    } finally {
      setChangingPwd(false);
    }
  };

  if (status === 'loading' || loading) return <div className="p-8">Loading...</div>;
  if (!profile) return <div className="p-8">Failed to load profile</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><User className="w-7 h-7 text-emerald-600" />Admin Profile</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Profile Picture</h2>
                <p className="text-gray-600 text-sm">Your admin avatar</p>
              </div>
              {isEditing && (
                <label className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm">
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" name="email" value={formData.email || ''} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} disabled={!isEditing}
                  placeholder="+263 77 123 4567" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input type="text" name="country" value={formData.country || ''} onChange={handleInputChange} disabled={!isEditing}
                  placeholder="e.g., Zimbabwe" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} disabled={!isEditing}
                placeholder="e.g., 12 Samora Machel Avenue, Harare" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio / Notes</label>
              <textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} disabled={!isEditing} rows={4}
                placeholder="e.g., Experienced property manager based in Harare, Zimbabwe" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Account</h3>
              <div className="text-sm text-gray-600">Manage account settings</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <p className="text-sm text-gray-700">Role</p>
                <div className="mt-1 text-sm text-gray-600">{profile.role || 'Admin'}</div>
              </div>
              <div className="col-span-1 text-right">
                <button onClick={() => setShowChangePassword((s) => !s)} className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                  {showChangePassword ? 'Close' : 'Change Password'}
                </button>
              </div>
            </div>

            {showChangePassword && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg" />
                      <button type="button" onClick={() => setShowCurrent((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                        {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg" />
                      <button type="button" onClick={() => setShowNew((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                        {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-1">
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
                  <button onClick={handleChangePassword} disabled={changingPwd} className="bg-emerald-600 text-white px-4 py-2 rounded-lg">
                    {changingPwd ? 'Changing...' : 'Save Password'}
                  </button>
                  <button onClick={() => { setShowChangePassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg"> 
                <Edit2 className="w-5 h-5 inline mr-2" /> Edit Profile
              </button>
            ) : (
              <>
                <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg"> 
                  <Save className="w-5 h-5 inline mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => { setFormData(profile); setAvatarFile(null); setIsEditing(false); }} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg"> 
                  <X className="w-5 h-5 inline mr-2" /> Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
