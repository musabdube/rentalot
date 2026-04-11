'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Loader, Eye, MapPin, Mail, Phone, Calendar, Zap, Heart, X, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface UnverifiedProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string | null;
  isVerified: boolean;
  landlord: {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
  };
  createdAt: string;
}

interface UnverifiedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  phone: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    rentalRequestsAsTenant?: number;
    favoritedProperties?: number;
    propertiesOwned?: number;
    rentalRequestsAsLandlord?: number;
  };
}

export default function VerificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [unverifiedProperties, setUnverifiedProperties] = useState<UnverifiedProperty[]>([]);
  const [unverifiedTenants, setUnverifiedTenants] = useState<UnverifiedUser[]>([]);
  const [unverifiedLandlords, setUnverifiedLandlords] = useState<UnverifiedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'properties' | 'tenants' | 'landlords'>('properties');
  const [selectedUser, setSelectedUser] = useState<UnverifiedUser | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchPendingVerifications();
  }, [session, status, router]);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/verify/pending');
      if (response.ok) {
        const data = await response.json();
        setUnverifiedProperties(data.unverifiedProperties);
        setUnverifiedTenants(data.unverifiedTenants);
        setUnverifiedLandlords(data.unverifiedLandlords);
      }
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      toast.error('Failed to load pending verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProperty = async (propertyId: string) => {
    setVerifyingId(propertyId);
    try {
      const response = await fetch('/api/admin/verify/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, verified: true }),
      });

      if (response.ok) {
        setUnverifiedProperties(prev => prev.filter(p => p.id !== propertyId));
        toast.success('Property verified successfully');
      } else {
        toast.error('Failed to verify property');
      }
    } catch (error) {
      console.error('Error verifying property:', error);
      toast.error('Error verifying property');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleVerifyUser = async (userId: string, type: 'tenant' | 'landlord') => {
    setVerifyingId(userId);
    try {
      const response = await fetch('/api/admin/verify/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, verified: true }),
      });

      if (response.ok) {
        if (type === 'tenant') {
          setUnverifiedTenants(prev => prev.filter(t => t.id !== userId));
        } else {
          setUnverifiedLandlords(prev => prev.filter(l => l.id !== userId));
        }
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully`);
      } else {
        toast.error(`Failed to verify ${type}`);
      }
    } catch (error) {
      console.error(`Error verifying ${type}:`, error);
      toast.error(`Error verifying ${type}`);
    } finally {
      setVerifyingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2"><CheckCircle className="w-8 h-8 text-emerald-600" />Verification Center</h1>
        <p className="text-gray-600 mb-8">Approve and verify properties, tenants, and landlords</p>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === 'properties'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Properties ({unverifiedProperties.length})
          </button>
          <button
            onClick={() => setActiveTab('tenants')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === 'tenants'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tenants ({unverifiedTenants.length})
          </button>
          <button
            onClick={() => setActiveTab('landlords')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === 'landlords'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Landlords ({unverifiedLandlords.length})
          </button>
        </div>

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {unverifiedProperties.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600">All properties have been verified!</p>
              </div>
            ) : (
              unverifiedProperties.map(property => (
                <div key={property.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-6">
                    {property.imageUrl && (
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                      <p className="text-gray-600 mb-2">{property.location}</p>
                      <p className="text-emerald-600 font-semibold mb-3">${property.price}/month</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span>{property.bedrooms} Bedrooms</span>
                        <span>•</span>
                        <span>{property.bathrooms} Bathrooms</span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-600">Owner:</span>
                        <span className="font-medium">{property.landlord.name}</span>
                        {property.landlord.isVerified && (
                          <div title="Verified landlord">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleVerifyProperty(property.id)}
                        disabled={verifyingId === property.id}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {verifyingId === property.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tenants Tab */}
        {activeTab === 'tenants' && (
          <div className="space-y-4">
            {unverifiedTenants.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600">All tenants have been verified!</p>
              </div>
            ) : (
              unverifiedTenants.map(tenant => (
                <div key={tenant.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div>
                        {tenant.avatar ? (
                          <img src={tenant.avatar} alt={tenant.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                            {tenant.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{tenant.name}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Tenant</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {tenant.email}
                          </div>
                          {tenant.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {tenant.phone}
                            </div>
                          )}
                          {tenant.city && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {tenant.city}
                              {tenant.country && `, ${tenant.country}`}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Joined {new Date(tenant.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {tenant.bio && (
                          <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded mt-2">&quot;{tenant.bio}&quot;</p>
                        )}
                        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="font-medium">{tenant._count?.rentalRequestsAsTenant || 0}</span> Applications
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="font-medium">{tenant._count?.favoritedProperties || 0}</span> Favorites
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-col ml-4">
                      <button
                        onClick={() => {
                          setSelectedUser(tenant);
                          setShowProfileModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Profile
                      </button>
                      <button
                        onClick={() => handleVerifyUser(tenant.id, 'tenant')}
                        disabled={verifyingId === tenant.id}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {verifyingId === tenant.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Verify
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Landlords Tab */}
        {activeTab === 'landlords' && (
          <div className="space-y-4">
            {unverifiedLandlords.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600">All landlords have been verified!</p>
              </div>
            ) : (
              unverifiedLandlords.map(landlord => (
                <div key={landlord.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div>
                        {landlord.avatar ? (
                          <img src={landlord.avatar} alt={landlord.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">
                            {landlord.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{landlord.name}</h3>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Landlord</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {landlord.email}
                          </div>
                          {landlord.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {landlord.phone}
                            </div>
                          )}
                          {landlord.city && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {landlord.city}
                              {landlord.country && `, ${landlord.country}`}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Joined {new Date(landlord.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {landlord.bio && (
                          <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded mt-2">&quot;{landlord.bio}&quot;</p>
                        )}
                        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Building2 className="w-4 h-4 text-green-600" />
                            <span className="font-medium">{landlord._count?.propertiesOwned || 0}</span> Properties
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="font-medium">{landlord._count?.rentalRequestsAsLandlord || 0}</span> Requests
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-col ml-4">
                      <button
                        onClick={() => {
                          setSelectedUser(landlord);
                          setShowProfileModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Profile
                      </button>
                      <button
                        onClick={() => handleVerifyUser(landlord.id, 'landlord')}
                        disabled={verifyingId === landlord.id}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {verifyingId === landlord.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Verify
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Profile Modal */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-linear-to-r from-emerald-600 to-emerald-700 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">Profile Details</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedUser.role === 'TENANT' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {selectedUser.role}
                </span>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-white hover:bg-emerald-600 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Profile Header */}
              <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-200">
                <div>
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-32 h-32 rounded-full object-cover ring-4 ring-emerald-200"
                    />
                  ) : (
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white ring-4 ${
                      selectedUser.role === 'TENANT' ? 'bg-blue-500 ring-blue-200' : 'bg-green-500 ring-green-200'
                    }`}>
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedUser.name}</h1>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-emerald-600" />
                      <a href={`mailto:${selectedUser.email}`} className="hover:text-emerald-600">
                        {selectedUser.email}
                      </a>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-emerald-600" />
                        <a href={`tel:${selectedUser.phone}`} className="hover:text-emerald-600">
                          {selectedUser.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      <span>Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              {(selectedUser.address || selectedUser.city || selectedUser.country) && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Location Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {selectedUser.address && <p className="text-gray-700"><span className="font-medium">Address:</span> {selectedUser.address}</p>}
                    {selectedUser.city && <p className="text-gray-700"><span className="font-medium">City:</span> {selectedUser.city}</p>}
                    {selectedUser.country && <p className="text-gray-700"><span className="font-medium">Country:</span> {selectedUser.country}</p>}
                  </div>
                </div>
              )}

              {/* Bio */}
              {selectedUser.bio && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 italic">&quot;{selectedUser.bio}&quot;</p>
                  </div>
                </div>
              )}

              {/* Activity Stats */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedUser.role === 'TENANT' ? (
                    <>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-5 h-5 text-amber-500" />
                          <span className="text-sm text-gray-600 font-medium">Applications</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{selectedUser._count?.rentalRequestsAsTenant || 0}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Heart className="w-5 h-5 text-red-500" />
                          <span className="text-sm text-gray-600 font-medium">Favorites</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{selectedUser._count?.favoritedProperties || 0}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-gray-600 font-medium">Properties</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{selectedUser._count?.propertiesOwned || 0}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-5 h-5 text-amber-500" />
                          <span className="text-sm text-gray-600 font-medium">Requests</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{selectedUser._count?.rentalRequestsAsLandlord || 0}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Account Status:</span> Pending Verification
                </p>
                <p className="text-sm text-blue-900 mt-1">
                  <span className="font-semibold">Last Updated:</span> {new Date(selectedUser.updatedAt).toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleVerifyUser(selectedUser.id, selectedUser.role === 'TENANT' ? 'tenant' : 'landlord');
                    setShowProfileModal(false);
                  }}
                  disabled={verifyingId === selectedUser.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-semibold"
                >
                  {verifyingId === selectedUser.id ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Approve & Verify
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
