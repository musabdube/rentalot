'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Edit2, Trash2, Shield, CheckCircle, XCircle, AlertCircle, Eye, Loader, MessageSquare, Send } from 'lucide-react';
import { useEffect, useState } from 'react';import toast from 'react-hot-toast';
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'TENANT' | 'LANDLORD' | 'ADMIN';
  avatar?: string;
  city?: string;
  country?: string;
  verificationStatus: boolean;
  deleteRequested?: boolean;
  deleteRequestedAt?: string | null;
  createdAt: string;
}

type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN' | 'all';

export default function AdminUsersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageSending, setMessageSending] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchUsers();
  }, [session, sessionStatus, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setSelectedUser(updatedUser);
        setIsEditing(false);
        toast.success('User updated successfully!');
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setSelectedUser(null);
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    setVerifyingId(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: true }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // User verified successfully (verbose log removed)
        // Refetch all users to ensure consistency
        await fetchUsers();
        if (selectedUser?.id === userId) {
          setSelectedUser(updatedUser);
        }
        toast.success('User verified successfully!');
      } else {
        toast.error('Failed to verify user');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error('Error verifying user');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setMessageSending(true);
    try {
      const response = await fetch('/api/admin/message-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          message: messageContent,
        }),
      });

      if (response.ok) {
        toast.success('Message sent successfully!');
        setMessageContent('');
        setShowMessageModal(false);
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    } finally {
      setMessageSending(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    tenants: users.filter(u => u.role === 'TENANT').length,
    landlords: users.filter(u => u.role === 'LANDLORD').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    verified: users.filter(u => u.verificationStatus).length,
    unverified: users.filter(u => !u.verificationStatus).length,
  };

  if (sessionStatus === 'loading' || loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Shield className="w-7 h-7 text-emerald-600" />Users Management</h1>
          <p className="text-gray-600 mt-1">Manage all system users and their roles</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unverified Users Alert */}
        {stats.unverified > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-yellow-900">⚠️ Action Required</h3>
                <p className="text-yellow-800 text-sm mt-1">
                  You have <strong>{stats.unverified}</strong> unverified {stats.unverified === 1 ? 'user' : 'users'}. 
                  Review and verify them to enable full platform access.
                </p>
              </div>
              <button
                onClick={() => setRoleFilter('all')}
                className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded font-medium hover:bg-yellow-600 transition-colors text-sm whitespace-nowrap"
              >
                View Unverified
              </button>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Tenants</p>
            <p className="text-3xl font-bold text-blue-600">{stats.tenants}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Landlords</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.landlords}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Admins</p>
            <p className="text-3xl font-bold text-purple-600">{stats.admins}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Verified</p>
            <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Unverified</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.unverified}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="TENANT">Tenants</option>
              <option value="LANDLORD">Landlords</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Users Found</h2>
            <p className="text-gray-600">No users match your search criteria</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-600">
                              {user.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'LANDLORD'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.verificationStatus ? (
                          <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
                            <AlertCircle className="w-4 h-4" />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setEditData(user);
                              setIsEditing(false);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowMessageModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
                            title="Send Message"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          {!user.verificationStatus && (
                            <button
                              onClick={() => handleVerifyUser(user.id)}
                              disabled={verifyingId === user.id}
                              className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1 disabled:opacity-50"
                            >
                              {verifyingId === user.id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Verify
                            </button>
                          )}
                          {user.deleteRequested && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              <AlertCircle className="w-3 h-3" />
                              Deletion Requested
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar and Basic Info */}
              <div className="text-center">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="w-24 h-24 rounded-full mx-auto mb-4" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 text-4xl font-bold text-emerald-600">
                    {selectedUser.name.charAt(0)}
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>

              {/* User Information */}
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Role</p>
                    <p className="text-gray-900 flex items-center gap-2 mt-1">
                      <Shield className="w-4 h-4" />
                      {selectedUser.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Verification Status</p>
                    <p className={`text-gray-900 flex items-center gap-2 mt-1 ${selectedUser.verificationStatus ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedUser.verificationStatus ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          Unverified
                        </>
                      )}
                    </p>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Phone</p>
                      <p className="text-gray-900 mt-1">{selectedUser.phone}</p>
                    </div>
                  )}
                  {selectedUser.city && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">City</p>
                      <p className="text-gray-900 mt-1">{selectedUser.city}</p>
                    </div>
                  )}
                  {selectedUser.country && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Country</p>
                      <p className="text-gray-900 mt-1">{selectedUser.country}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Joined</p>
                    <p className="text-gray-900 mt-1">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select
                      value={editData.role || selectedUser.role}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="TENANT">Tenant</option>
                      <option value="LANDLORD">Landlord</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.verificationStatus !== undefined ? editData.verificationStatus : selectedUser.verificationStatus}
                        onChange={(e) => setEditData({ ...editData, verificationStatus: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-semibold text-gray-700">Verification Status</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editData.phone || selectedUser.phone || ''}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={editData.city || selectedUser.city || ''}
                      onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={editData.country || selectedUser.country || ''}
                      onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setShowMessageModal(true)}
                      className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Send Message
                    </button>
                    {!selectedUser.verificationStatus && (
                      <button
                        onClick={() => handleVerifyUser(selectedUser.id)}
                        disabled={verifyingId === selectedUser.id}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {verifyingId === selectedUser.id ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        {verifyingId === selectedUser.id ? 'Verifying...' : 'Verify User'}
                      </button>
                    )}
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Edit2 className="w-5 h-5" />
                            Edit User
                          </button>
                          {selectedUser?.deleteRequested ? (
                            <button
                              onClick={() => handleDeleteUser(selectedUser.id)}
                              disabled={actionLoading}
                              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-5 h-5" />
                              Approve Deletion
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(selectedUser!.id)}
                              disabled={actionLoading}
                              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-5 h-5" />
                              Delete User
                            </button>
                          )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleUpdateUser}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({});
                      }}
                      className="flex-1 bg-gray-400 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowMessageModal(false);
            setMessageContent('');
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Send Message</h3>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageContent('');
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">To</p>
                <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message to the user..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  disabled={messageSending}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSendMessage}
                  disabled={messageSending || !messageContent.trim()}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {messageSending ? 'Sending...' : 'Send Message'}
                </button>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageContent('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
