'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, Edit2, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Property } from '@/app/types/property';

interface PropertyWithStatus extends Property {
  city: string;
  suburb?: string;
  rentAmount: number;
  availabilityStatus?: 'AVAILABLE' | 'UNAVAILABLE' | 'PENDING_RENT';
  status: string;
  images: Array<{ url: string; isMain: boolean }>;
  isPinned?: boolean;
  isFeatured?: boolean;
  featureRequested?: boolean;
  featureRequestedAt?: string | null;
  pinRequested?: boolean;
  pinRequestedAt?: string | null;
}

const statusConfig = {
  AVAILABLE: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
    label: 'Available',
  },
  UNAVAILABLE: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: AlertCircle,
    label: 'Unavailable',
  },
  PENDING_RENT: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: Clock,
    label: 'Pending Rent',
  },
};

export default function LandlordPropertiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [requestingPromo, setRequestingPromo] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session || session.user?.role !== 'LANDLORD') {
      router.push('/auth/signin');
      return;
    }

    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/landlord/properties');
        if (response.ok) {
          const data = await response.json();
          setProperties(data);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [session, status, router]);

  const handleStatusChange = async (propertyId: string, newStatus: 'AVAILABLE' | 'UNAVAILABLE' | 'PENDING_RENT') => {
    setUpdatingStatus(propertyId);
    try {
      const response = await fetch(`/api/landlord/properties/${propertyId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityStatus: newStatus }),
      });

      if (response.ok) {
        const updated = await response.json();
        setProperties(
          properties.map((p) =>
            p.id === propertyId
              ? { ...p, availabilityStatus: newStatus, available: newStatus === 'AVAILABLE' }
              : p
          )
        );
        const statusLabel = statusConfig[newStatus].label;
        toast.success(`Property status updated to ${statusLabel}`);
      } else {
        toast.error('Failed to update property status');
      }
    } catch (error) {
      console.error('Error updating property status:', error);
      toast.error('Error updating property status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handlePromoRequest = async (propertyId: string, type: 'feature' | 'pin', request: boolean) => {
    setRequestingPromo(propertyId);
    try {
      const res = await fetch(`/api/landlord/properties/${propertyId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestFeature: type === 'feature' ? request : undefined,
          requestPin: type === 'pin' ? request : undefined,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, ...updated } : p))
        );
        toast.success(request ? 'Request sent to admin' : 'Request cancelled');
      } else {
        toast.error('Failed to submit request');
      }
    } catch (error) {
      console.error('Error requesting promo:', error);
      toast.error('Error submitting request');
    } finally {
      setRequestingPromo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/landlord/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <Link
              href="/landlord/properties/new"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              + Add Property
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {status === 'loading' ? (
          <div className="text-center py-12">Loading...</div>
        ) : loading ? (
          <div className="text-center py-12">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Properties Yet</h2>
            <p className="text-gray-600 mb-6">
              Start by adding your first rental property!
            </p>
            <Link
              href="/landlord/properties/new"
              className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Add First Property
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const currentStatus = property.availabilityStatus || 'AVAILABLE';
              const config = statusConfig[currentStatus as keyof typeof statusConfig];
              const StatusIcon = config.icon;

              return (
                <div key={property.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48 w-full bg-gray-200">
                    {property.images?.[0]?.url ? (
                      <Image
                        src={property.images[0].url}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <Home className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {property.status}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
                    <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                      <div>
                        <span className="font-semibold">{property.bedrooms}</span>
                        <p className="text-gray-500">Beds</p>
                      </div>
                      <div>
                        <span className="font-semibold">{property.bathrooms}</span>
                        <p className="text-gray-500">Baths</p>
                      </div>
                      <div>
                        <span className="font-semibold">{property.area}</span>
                        <p className="text-gray-500">m²</p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-2">{property.suburb || property.city}, {property.city}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-emerald-600">${property.rentAmount || property.price}</span>
                    </div>

                    {/* Availability Status Selector */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Availability Status</label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(statusConfig).map(([key, value]) => {
                          const statusKey = key as 'AVAILABLE' | 'UNAVAILABLE' | 'PENDING_RENT';
                          const isActive = currentStatus === statusKey;
                          return (
                            <button
                              key={key}
                              onClick={() => handleStatusChange(property.id, statusKey)}
                              disabled={updatingStatus === property.id}
                              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-normal text-center leading-tight ${
                                isActive
                                  ? `${value.bgColor} ${value.textColor} border-2 border-current`
                                  : `bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300`
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title={value.label}
                            >
                              <StatusIcon className="w-3 h-3" />
                              <span>{value.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Link
                          href={`/landlord/properties/${property.id}/edit`}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Link>
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this property?')) {
                              try {
                                await fetch(`/api/landlord/properties/${property.id}`, {
                                  method: 'DELETE',
                                });
                                setProperties(properties.filter((p) => p.id !== property.id));
                                toast.success('Property deleted successfully');
                              } catch (error) {
                                console.error('Error deleting property:', error);
                                toast.error('Error deleting property');
                              }
                            }
                          }}
                          className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>

                      {property.status === 'DRAFT' && (
                        <button
                          onClick={async () => {
                            if (!confirm('Publish this draft for admin review?')) return;
                            setUpdatingStatus(property.id);
                            try {
                              const res = await fetch(`/api/landlord/properties/${property.id}/status`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ publish: true }),
                              });
                              if (res.ok) {
                                setProperties(properties.map(p => p.id === property.id ? { ...p, status: 'PENDING' } : p));
                                toast.success('Property submitted for review');
                              } else {
                                toast.error('Failed to publish draft');
                              }
                            } catch (err) {
                              console.error(err);
                              toast.error('Error publishing draft');
                            } finally {
                              setUpdatingStatus(null);
                            }
                          }}
                          className="w-full bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                          Publish
                        </button>
                      )}

                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            onClick={() => handlePromoRequest(property.id, 'feature', !property.featureRequested)}
                            disabled={requestingPromo === property.id || property.isFeatured}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                              property.isFeatured
                                ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                                : property.featureRequested
                                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {property.isFeatured ? 'Featured' : property.featureRequested ? 'Cancel Feature Request' : 'Request Featured'}
                          </button>

                          <button
                            onClick={() => handlePromoRequest(property.id, 'pin', !property.pinRequested)}
                            disabled={requestingPromo === property.id || property.isPinned}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                              property.isPinned
                                ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                                : property.pinRequested
                                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {property.isPinned ? 'Pinned' : property.pinRequested ? 'Cancel Pin Request' : 'Request Pin'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
