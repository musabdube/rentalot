"use client";

import { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Header';
import { FullPageLoader } from '../components/FullPageLoader';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyModal } from '../components/PropertyModal';
import { Property } from '../types/property';
import { MapPin, Home, Users, TrendingUp, Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function HomeClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
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

  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    studentFriendly: false,
  });
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

  // Fetch properties and favorites from database
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
            setFavorites(favData.map((fav: any) => fav.id || fav.propertyId));
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

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (property.suburb?.toLowerCase().includes(filters.searchTerm.toLowerCase()) || false) ||
        (property.city?.toLowerCase().includes(filters.searchTerm.toLowerCase()) || false) ||
        property.description.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const price = (property.rentAmount || property.price || 0);
      const matchesPrice = price >= filters.priceMin && price <= filters.priceMax;

      const matchesType = filters.propertyType === 'all' || property.type === filters.propertyType;

      const matchesBedrooms =
        filters.bedrooms === 'all' ||
        (filters.bedrooms === '5+' ? property.bedrooms >= 5 : property.bedrooms === Number(filters.bedrooms));

      const matchesBathrooms =
        filters.bathrooms === 'all' ||
        (filters.bathrooms === '3+' ? property.bathrooms >= 3 : property.bathrooms === Number(filters.bathrooms));

      const matchesLocation =
        !filters.location ||
        (property.city?.toLowerCase().includes(filters.location.toLowerCase()) || false) ||
        (property.suburb?.toLowerCase().includes(filters.location.toLowerCase()) || false);

      const matchesVerified = !filters.verified || property.isVerified === true;

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

  // Get featured properties (first 3)
  const featuredProperties = properties.slice(0, 3);

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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Discover Your Perfect Home
            </h1>
            <p className="text-lg sm:text-xl text-emerald-50 mb-8">
              Find premium rental properties that match your lifestyle
            </p>
            <p className="text-emerald-100 text-xl font-semibold">
              {properties.length} Properties Available
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Home className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
              <p className="text-gray-600 text-sm">Properties</p>
            </div>
            <div className="text-center">
              <MapPin className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{new Set(properties.map(p => p.city || p.suburb)).size}</p>
              <p className="text-gray-600 text-sm">Locations</p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">500+</p>
              <p className="text-gray-600 text-sm">Happy Tenants</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">4.8</p>
              <p className="text-gray-600 text-sm">Avg. Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      {!loading && properties.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Featured Properties
              </h2>
              <p className="text-gray-600">
                Check out our most popular rental listings
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={setSelectedProperty}
                  isFavorited={favorites.includes(property.id)}
                  onFavoriteChange={(isFav) => handleFavoriteChange(property.id, isFav)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse All Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Browse All Properties
            </h2>
            <p className="text-gray-600">
              Filter and search to find your ideal rental property
            </p>
          </div>

          {/* Search Hero (matches Browse page) */}
          <section className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters((p) => ({ ...p, searchTerm: e.target.value }))}
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
          </section>

          {/* Advanced Filters Panel (matches Browse page) */}
          {showFilters && (
            <section className="bg-white border-b border-gray-200 sticky top-16 z-30 mb-6">
              <div className="py-6">
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
                          onChange={(e) => setFilters((p) => ({ ...p, priceMin: Number(e.target.value) }))}
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
                          onChange={(e) => setFilters((p) => ({ ...p, priceMax: Number(e.target.value) }))}
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
                      onChange={(e) => setFilters((p) => ({ ...p, propertyType: e.target.value }))}
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
                      onChange={(e) => setFilters((p) => ({ ...p, bedrooms: e.target.value }))}
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
                      onChange={(e) => setFilters((p) => ({ ...p, bathrooms: e.target.value }))}
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
                        onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
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
                        onChange={(e) => setFilters((p) => ({ ...p, verified: e.target.checked }))}
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
                        onChange={(e) => setFilters((p) => ({ ...p, available: e.target.checked }))}
                        className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-gray-700">Available Now</span>
                    </label>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => setFilters({
                        searchTerm: '',
                        priceMin: 0,
                        priceMax: 10000,
                        propertyType: 'all',
                        bedrooms: 'all',
                        bathrooms: 'all',
                        location: '',
                        verified: false,
                        available: true,
                        studentFriendly: false,
                        nearCampus: false,
                        walkingDistance: false,
                        publicTransportNearby: false,
                        furnished: false,
                        sharedRoomAllowed: false,
                        wifiIncluded: false,
                        utilitiesIncluded: false,
                        studyFriendly: false,
                      })}
                      className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reset Filters
                    </button>
                  </div>
                </div>

                {/* Student-Friendly Filters - Collapsible Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setExpandedSections(prev => ({ ...prev, studentFriendly: !prev.studentFriendly }))}
                    className="w-full flex items-center justify-between text-left mb-4"
                  >
                    <h4 className="text-sm font-semibold text-gray-900">🎓 Student-Friendly Features</h4>
                    {expandedSections.studentFriendly ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {expandedSections.studentFriendly && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.studentFriendly}
                          onChange={(e) => setFilters((p) => ({ ...p, studentFriendly: e.target.checked }))}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Student Friendly</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.nearCampus}
                          onChange={(e) => setFilters((p) => ({ ...p, nearCampus: e.target.checked }))}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Near Campus</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.walkingDistance}
                          onChange={(e) => setFilters((p) => ({ ...p, walkingDistance: e.target.checked }))}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Walking Distance</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.publicTransportNearby}
                          onChange={(e) => setFilters((p) => ({ ...p, publicTransportNearby: e.target.checked }))}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Public Transport</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.furnished}
                          onChange={(e) => setFilters((p) => ({ ...p, furnished: e.target.checked }))}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Furnished</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.sharedRoomAllowed}
                          onChange={(e) => setFilters((p) => ({ ...p, sharedRoomAllowed: e.target.checked }))}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Shared Room OK</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.wifiIncluded}
                          onChange={(e) => setFilters((p) => ({ ...p, wifiIncluded: e.target.checked }))}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">WiFi Included</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.utilitiesIncluded}
                          onChange={(e) => setFilters((p) => ({ ...p, utilitiesIncluded: e.target.checked }))}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Utilities Included</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.studyFriendly}
                          onChange={(e) => setFilters((p) => ({ ...p, studyFriendly: e.target.checked }))}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Study Friendly</span>
                      </label>
                    </div>
                  )}
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-lg text-emerald-50 mb-8">
            Start browsing our properties above or sign up to get personalized recommendations
          </p>
        </div>
      </section>

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}
