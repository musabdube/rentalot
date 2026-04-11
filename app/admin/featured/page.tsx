'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Star, Trash2, Eye, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface FeaturedProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  isFeatured: boolean;
  featuredUntil: string | null;
  landlord: {
    name: string;
    email: string;
  };
  images: Array<{
    url: string;
    isMain: boolean;
  }>;
  createdAt: string;
}

export default function AdminFeaturedPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<FeaturedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<FeaturedProperty | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchFeatured();
  }, [session, sessionStatus, router]);

  const fetchFeatured = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/featured');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Error fetching featured properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfeature = async (propertyId: string) => {
    if (!confirm('Remove this property from featured listings?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/listings/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: false }),
      });

      if (response.ok) {
        await fetchFeatured();
        setSelectedProperty(null);
        toast.success('Property unfeatured');
      }
    } catch (error) {
      console.error('Error unfeaturing property:', error);
      toast.error('Error updating property');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    return (
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const stats = {
    total: properties.length,
    expiredSoon: properties.filter(p => {
      if (!p.featuredUntil) return false;
      const daysLeft = Math.ceil((new Date(p.featuredUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 && daysLeft <= 7;
    }).length,
    active: properties.filter(p => {
      if (!p.featuredUntil) return false;
      return new Date(p.featuredUntil) > new Date();
    }).length,
  };

  if (sessionStatus === 'loading' || loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-emerald-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Star className="w-7 h-7 text-emerald-600" />Featured Properties</h1>
          <p className="text-gray-600 mt-1">Manage currently featured listings and promotions</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Currently Featured</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Expiring Soon (7 days)</p>
            <p className="text-3xl font-bold text-orange-600">{stats.expiredSoon}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Total on File</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Featured Properties */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No featured properties found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => {
              const mainImage = property.images.find(img => img.isMain);
              const daysLeft = property.featuredUntil
                ? Math.ceil((new Date(property.featuredUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : 0;
              const isExpired = daysLeft <= 0;
              const expiringsoon = daysLeft > 0 && daysLeft <= 7;

              return (
                <div key={property.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
                  <div className="flex">
                    {/* Image */}
                    <div className="w-40 h-40 flex-shrink-0 overflow-hidden bg-gray-200">
                      {mainImage ? (
                        <img
                          src={mainImage.url}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{property.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">${property.price}</p>
                            <p className="text-gray-600 text-sm">/month</p>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-3">
                          {property.bedrooms}bd • {property.bathrooms}ba • {property.type}
                        </div>

                        <p className="text-xs text-gray-600">by {property.landlord.name}</p>
                      </div>

                      {/* Featured Status */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {isExpired ? (
                          <p className="text-red-600 text-sm font-semibold">⏰ Featured period expired</p>
                        ) : expiringsoon ? (
                          <p className="text-orange-600 text-sm font-semibold flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Expires in {daysLeft} days
                          </p>
                        ) : (
                          <p className="text-green-600 text-sm font-semibold">
                            ⭐ Expires on {new Date(property.featuredUntil!).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedProperty(property)}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleUnfeature(property.id)}
                        disabled={actionLoading}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4" />
                        Unfeature
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedProperty && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProperty(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                Featured Property Details
              </h2>
              <button onClick={() => setSelectedProperty(null)} className="text-gray-500">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Main Image */}
              {selectedProperty.images.find(img => img.isMain) && (
                <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={selectedProperty.images.find(img => img.isMain)?.url}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-700">Title</p>
                <p className="text-gray-900">{selectedProperty.title}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Location</p>
                <p className="text-gray-900">{selectedProperty.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Price</p>
                  <p className="text-gray-900">${selectedProperty.price}/month</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Type</p>
                  <p className="text-gray-900">{selectedProperty.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Bedrooms</p>
                  <p className="text-gray-900">{selectedProperty.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Bathrooms</p>
                  <p className="text-gray-900">{selectedProperty.bathrooms}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Landlord</p>
                <p className="text-gray-900">{selectedProperty.landlord.name}</p>
                <p className="text-gray-600 text-sm">{selectedProperty.landlord.email}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-900 mb-2">Featured Until</p>
                {selectedProperty.featuredUntil ? (
                  <>
                    <p className="text-yellow-900">
                      {new Date(selectedProperty.featuredUntil).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {new Date(selectedProperty.featuredUntil) > new Date() && (
                      <p className="text-sm text-yellow-700 mt-1">
                        ({Math.ceil((new Date(selectedProperty.featuredUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining)
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-yellow-900">No expiration date</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => handleUnfeature(selectedProperty.id)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Remove from Featured
                </button>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
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
