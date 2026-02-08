'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Star, Trash2, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface PropertyListing {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  status: string;
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

export default function AdminListingsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'notfeatured'>('all');
  const [selectedListing, setSelectedListing] = useState<PropertyListing | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [featuredDays, setFeaturedDays] = useState(30);

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchListings();
  }, [session, sessionStatus, router]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/listings');
      if (response.ok) {
        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data.map((listing: any) => ({
              ...listing,
              price: listing.price ?? listing.rentAmount ?? 0,
              location: listing.location ?? [listing.street, listing.suburb, listing.city].filter(Boolean).join(', '),
            }))
          : [];
        setListings(normalized);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (listingId: string, currentFeatured: boolean) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isFeatured: !currentFeatured,
          daysToFeature: !currentFeatured ? featuredDays : 0,
        }),
      });

      if (response.ok) {
        await fetchListings();
        setSelectedListing(null);
        toast.success(!currentFeatured ? 'Listing featured!' : 'Listing unfeatured');
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Error updating listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (listingId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchListings();
        setSelectedListing(null);
        toast.success(newStatus === 'ACTIVE' ? 'Listing activated!' : 'Listing rejected');
      }
    } catch (error) {
      console.error('Error updating listing status:', error);
      toast.error('Error updating listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (listingId: string) => {
    if (!confirm('Remove this listing from featured? It will return to regular listings.')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: false }),
      });

      if (response.ok) {
        await fetchListings();
        setSelectedListing(null);
        toast.success('Listing removed from featured');
      }
    } catch (error) {
      console.error('Error removing listing:', error);
      toast.error('Error updating listing');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFeatured = true;
    if (filterFeatured === 'featured') {
      matchesFeatured = listing.isFeatured;
    } else if (filterFeatured === 'notfeatured') {
      matchesFeatured = !listing.isFeatured;
    }

    return matchesSearch && matchesFeatured;
  });

  const stats = {
    total: listings.length,
    approved: listings.filter(l => l.status === 'APPROVED' || l.status === 'ACTIVE').length,
    featured: listings.filter(l => l.isFeatured).length,
    notFeatured: listings.filter(l => !l.isFeatured && (l.status === 'APPROVED' || l.status === 'ACTIVE')).length,
  };

  if (sessionStatus === 'loading' || loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Featured Listings</h1>
          <p className="text-gray-600 mt-1">Manage and promote active property listings</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Total Listings</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Available</p>
            <p className="text-3xl font-bold text-blue-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Featured</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.featured}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Not Featured</p>
            <p className="text-3xl font-bold text-gray-600">{stats.notFeatured}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value as 'all' | 'featured' | 'notfeatured')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Listings</option>
              <option value="featured">Featured Only</option>
              <option value="notfeatured">Not Featured</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">No listings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => {
              const mainImage = listing.images.find(img => img.isMain);
              const isExpired = listing.featuredUntil && new Date(listing.featuredUntil) < new Date();

              return (
                <div
                  key={listing.id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow ${
                    listing.isFeatured && !isExpired ? 'ring-2 ring-yellow-500' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {mainImage ? (
                      <img
                        src={mainImage.url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                    {listing.isFeatured && !isExpired && (
                      <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{listing.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{listing.location}</p>

                    <div className="mb-3 text-sm text-gray-600">
                      <p>{listing.bedrooms}bd • {listing.bathrooms}ba • {listing.type}</p>
                    </div>

                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <p className="text-lg font-bold text-emerald-600">${listing.price}/mo</p>
                      <p className="text-xs text-gray-600">{listing.landlord.name}</p>
                    </div>

                    {listing.isFeatured && listing.featuredUntil && (
                      <p className="text-xs text-yellow-600 mb-3 font-medium">
                        Featured until {new Date(listing.featuredUntil).toLocaleDateString()}
                        {isExpired && ' (Expired)'}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedListing(listing)}
                        className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium text-sm hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(listing.id, listing.isFeatured)}
                        disabled={actionLoading}
                        className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1 ${
                          listing.isFeatured && !isExpired
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                        {listing.isFeatured && !isExpired ? 'Unfeature' : 'Feature'}
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
      {selectedListing && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedListing(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Listing Details</h2>
              <button onClick={() => setSelectedListing(null)} className="text-gray-500">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Main Image */}
              {selectedListing.images.find(img => img.isMain) && (
                <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={selectedListing.images.find(img => img.isMain)?.url}
                    alt={selectedListing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-700">Title</p>
                <p className="text-gray-900">{selectedListing.title}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Location</p>
                <p className="text-gray-900">{selectedListing.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Price</p>
                  <p className="text-gray-900">${selectedListing.price}/month</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Type</p>
                  <p className="text-gray-900">{selectedListing.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Bedrooms</p>
                  <p className="text-gray-900">{selectedListing.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Bathrooms</p>
                  <p className="text-gray-900">{selectedListing.bathrooms}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Landlord</p>
                <p className="text-gray-900">{selectedListing.landlord.name}</p>
                <p className="text-gray-600 text-sm">{selectedListing.landlord.email}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Featured Status</p>
                {selectedListing.isFeatured && selectedListing.featuredUntil ? (
                  <p className="text-yellow-600">
                    ⭐ Featured until {new Date(selectedListing.featuredUntil).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-gray-600">Not featured</p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Listing Status</p>
                <div className={`px-3 py-2 rounded-lg font-medium text-sm ${
                  selectedListing.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-700' 
                    : selectedListing.status === 'REJECTED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedListing.status}
                </div>
              </div>

              {!selectedListing.isFeatured && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Feature Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={featuredDays}
                    onChange={(e) => setFeaturedDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 flex gap-3">
                {selectedListing.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedListing.id, 'ACTIVE')}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      ✓ Approve & Activate
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedListing.id, 'REJECTED')}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      ✕ Reject
                    </button>
                  </>
                )}
                {selectedListing.status === 'ACTIVE' && (
                  <>
                    {!selectedListing.isFeatured ? (
                      <button
                        onClick={() => handleToggleFeatured(selectedListing.id, false)}
                        disabled={actionLoading}
                        className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Star className="w-4 h-4 fill-current" />
                        Feature Listing
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRemove(selectedListing.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove Featured
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => setSelectedListing(null)}
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
