"use client";

import { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Header';
import { FullPageLoader } from '../components/FullPageLoader';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyModal } from '../components/PropertyModal';
import { Property } from '../types/property';
import { MapPin, Home, Users, TrendingUp } from 'lucide-react';
import { PropertyFilters, PropertyFiltersState } from '../components/PropertyFilters';

export default function HomeClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFiltersState>({
    location: '',
    priceMin: 0,
    priceMax: 10000,
    propertyType: 'all',
    bedrooms: 'all',
    bathrooms: 'all',
    verified: false,
    available: true,
    nearCampus: false,
    walkingDistance: false,
    studyFriendly: false,
    wifiIncluded: false,
    furnished: false,
    utilitiesIncluded: false,
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
            // Support new response shape { authenticated: boolean, favorites: [] }
            const favList = Array.isArray(favData)
              ? favData
              : favData?.favorites ?? [];
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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) return;
        const data = await response.json();
        setHeroImageUrl(data?.heroImageUrl || null);
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    fetchSettings();
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const query = filters.location.trim().toLowerCase();
      const matchesSearch =
        !query ||
        property.title.toLowerCase().includes(query) ||
        (property.suburb?.toLowerCase().includes(query) || false) ||
        (property.city?.toLowerCase().includes(query) || false) ||
        property.description.toLowerCase().includes(query);

      const price = (property.rentAmount || property.price || 0);
      const matchesPrice = price >= filters.priceMin && price <= filters.priceMax;

      const matchesType = filters.propertyType === 'all' || property.type === filters.propertyType;

      const matchesBedrooms =
        filters.bedrooms === 'all' ||
        (filters.bedrooms.endsWith('+')
          ? property.bedrooms >= Number(filters.bedrooms.replace('+', ''))
          : property.bedrooms === Number(filters.bedrooms));

      const matchesBathrooms =
        filters.bathrooms === 'all' ||
        (filters.bathrooms.endsWith('+')
          ? property.bathrooms >= Number(filters.bathrooms.replace('+', ''))
          : property.bathrooms === Number(filters.bathrooms));

      const matchesVerified = !filters.verified || property.isVerified === true;

      const matchesAvailable = !filters.available || property.available === true;

      // Student-friendly filters
      const matchesNearCampus = !filters.nearCampus || property.nearCampus === true;
      const matchesWalkingDistance = !filters.walkingDistance || property.walkingDistance === true;
      const matchesFurnished = !filters.furnished || (property.furnished && property.furnished !== 'No');
      const matchesWifi = !filters.wifiIncluded || property.wifiIncluded === true;
      const matchesUtilities = !filters.utilitiesIncluded || property.utilitiesIncluded === true;
      const matchesStudyFriendly = !filters.studyFriendly || property.studyFriendly === true;

      return (
        matchesSearch &&
        matchesPrice &&
        matchesType &&
        matchesBedrooms &&
        matchesBathrooms &&
        matchesVerified &&
        matchesAvailable &&
        matchesNearCampus &&
        matchesWalkingDistance &&
        matchesFurnished &&
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

  const handleFilterChange = (key: keyof PropertyFiltersState, value: string | number | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      location: '',
      priceMin: 0,
      priceMax: 10000,
      propertyType: 'all',
      bedrooms: 'all',
      bathrooms: 'all',
      verified: false,
      available: true,
      nearCampus: false,
      walkingDistance: false,
      studyFriendly: false,
      wifiIncluded: false,
      furnished: false,
      utilitiesIncluded: false,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section
        className={`text-white py-16 sm:py-20 bg-cover bg-center ${
          heroImageUrl ? '' : 'bg-gradient-to-br from-emerald-600 to-emerald-800'
        }`}
        style={
          heroImageUrl
            ? {
                backgroundImage: `linear-gradient(120deg, rgba(5, 150, 105, 0.85), rgba(6, 95, 70, 0.85)), url(${heroImageUrl})`,
              }
            : undefined
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 flex justify-center items-center gap-3">
              <Home className="w-10 h-10" />Discover Your Perfect Home
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

          <PropertyFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            maxPrice={10000}
          />

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
