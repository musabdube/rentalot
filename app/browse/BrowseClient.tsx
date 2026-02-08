"use client";

import { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Header';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyModal } from '../components/PropertyModal';
import { Property } from '../types/property';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
import { FullPageLoader } from '../components/FullPageLoader';

interface Filters {
  searchTerm: string;
  priceMin: number;
  priceMax: number;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  location: string;
  verified: boolean;
  available: boolean;
  // Student-friendly filters
  studentFriendly: boolean;
  nearCampus: boolean;
  walkingDistance: boolean;
  publicTransportNearby: boolean;
  furnished: boolean;
  sharedRoomAllowed: boolean;
  wifiIncluded: boolean;
  utilitiesIncluded: boolean;
  studyFriendly: boolean;
}

export default function BrowseClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    priceMin: 0,
    priceMax: 10000,
    propertyType: 'all',
    bedrooms: 'all',
    bathrooms: 'all',
    location: '',
    verified: false,
    available: true,
    // Student-friendly filters
    studentFriendly: false,
    nearCampus: false,
    walkingDistance: false,
    publicTransportNearby: false,
    furnished: false,
    sharedRoomAllowed: false,
    wifiIncluded: false,
    utilitiesIncluded: false,
    studyFriendly: false,
  });

  // Fetch properties
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/properties/get');
        if (!response.ok) throw new Error('Failed to fetch properties');
        const data = await response.json();
        setProperties(data);

        // Fetch favorites
        try {
          const favRes = await fetch('/api/favorites');
          if (favRes.ok) {
            const favData = await favRes.json();
            const favList = Array.isArray(favData) ? favData : favData?.favorites ?? [];
            setFavorites(favList.map((fav: any) => fav.id || fav.propertyId));
          }
        } catch (e) {
          console.error('Could not fetch favorites:', e);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Search filter
      const matchesSearch =
        property.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (property.suburb?.toLowerCase().includes(filters.searchTerm.toLowerCase()) || false) ||
        (property.city?.toLowerCase().includes(filters.searchTerm.toLowerCase()) || false) ||
        property.description.toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Price filter
      const matchesPrice = (property.rentAmount || property.price || 0) >= filters.priceMin && (property.rentAmount || property.price || 0) <= filters.priceMax;

      // Property type filter
      const matchesType = filters.propertyType === 'all' || property.type === filters.propertyType;

      // Bedrooms filter
      const matchesBedrooms =
        filters.bedrooms === 'all' ||
        (filters.bedrooms === '5+' ? property.bedrooms >= 5 : property.bedrooms === Number(filters.bedrooms));

      // Bathrooms filter
      const matchesBathrooms =
        filters.bathrooms === 'all' ||
        (filters.bathrooms === '3+' ? property.bathrooms >= 3 : property.bathrooms === Number(filters.bathrooms));

      // Location filter
      const matchesLocation =
        !filters.location ||
        (property.city?.toLowerCase().includes(filters.location.toLowerCase()) || false) ||
        (property.suburb?.toLowerCase().includes(filters.location.toLowerCase()) || false);

      // Verified filter
      const matchesVerified = !filters.verified || property.isVerified === true;

      // Available filter
      const matchesAvailable = !filters.available || property.available === true;

      // Student-friendly filters
      const matchesStudentFriendly = !filters.studentFriendly || property.studentFriendly === true;
      const matchesNearCampus = !filters.nearCampus || property.nearCampus === true;
      const matchesWalkingDistance = !filters.walkingDistance || property.walkingDistance === true;
      const matchesPublicTransport = !filters.publicTransportNearby || property.publicTransportNearby === true;
      const matchesFurnished = !filters.furnished || (property.furnished && property.furnished !== 'No');
      const matchesSharedRoom = !filters.sharedRoomAllowed || property.sharedRoomAllowed === true;
      const matchesWifi = !filters.wifiIncluded || property.wifiIncluded === true;
      const matchesUtilities = !filters.utilitiesIncluded || property.utilitiesIncluded === true;
      const matchesStudyFriendly = !filters.studyFriendly || property.studyFriendly === true;

      return (
        matchesSearch &&
        matchesPrice &&
        matchesType &&
        matchesBedrooms &&
        matchesBathrooms &&
        matchesLocation &&
        matchesVerified &&
        matchesAvailable &&
        matchesStudentFriendly &&
        matchesNearCampus &&
        matchesWalkingDistance &&
        matchesPublicTransport &&
        matchesFurnished &&
        matchesSharedRoom &&
        matchesWifi &&
        matchesUtilities &&
        matchesStudyFriendly
      );
    });
  }, [properties, filters]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      priceMin: 0,
      priceMax: 10000,
      propertyType: 'all',
      bedrooms: 'all',
      bathrooms: 'all',
      location: '',
      verified: false,
      available: true,
      // Student-friendly filters
      studentFriendly: false,
      nearCampus: false,
      walkingDistance: false,
      publicTransportNearby: false,
      furnished: false,
      sharedRoomAllowed: false,
      wifiIncluded: false,
      utilitiesIncluded: false,
      studyFriendly: false,
    });
  };

  const handleFavoriteChange = (propertyId: string, isFavorited: boolean) => {
    if (isFavorited) {
      setFavorites([...favorites, propertyId]);
    } else {
      setFavorites(favorites.filter(id => id !== propertyId));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Browse Rentals</h1>
          <p className="text-emerald-50">Search verified and available rental properties across top locations.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Search by title, location..."
                className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Price Range</label>
                <div className="space-y-3">
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="relative mt-2 h-5">
                      <span
                        className="absolute -top-1 -translate-x-1/2 text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow"
                        style={{ left: `${(filters.priceMin / 10000) * 100}%` }}
                      >
                        ${filters.priceMin.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="relative mt-2 h-5">
                      <span
                        className="absolute -top-1 -translate-x-1/2 text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow"
                        style={{ left: `${(filters.priceMax / 10000) * 100}%` }}
                      >
                        ${filters.priceMax.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white text-gray-900"
                >
                  <option value="all">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white text-gray-900"
                >
                  <option value="all">Any</option>
                  <option value="0">Studio</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4 Bedrooms</option>
                  <option value="5+">5+ Bedrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Bathrooms</label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white text-gray-900"
                >
                  <option value="all">Any</option>
                  <option value="1">1 Bathroom</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="3+">3+ Bathrooms</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Enter city or area..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Verification</label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => handleFilterChange('verified', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">Verified Properties Only</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Availability</label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.available}
                    onChange={(e) => handleFilterChange('available', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">Available Now</span>
                </label>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleResetFilters}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reset Filters
                </button>
              </div>
            </div>
          </section>
        )}

        {loading ? (
          <FullPageLoader message="Loading properties..." small />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              {properties.length === 0
                ? 'No properties available at the moment.'
                : 'No properties match your search criteria. Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-700 font-medium">
              Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={setSelectedProperty}
                  isFavorited={favorites.includes(property.id)}
                  onFavoriteChange={(isFav) => handleFavoriteChange(property.id, isFav)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}
