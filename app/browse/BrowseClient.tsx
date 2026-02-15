"use client";

import { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Header';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyModal } from '../components/PropertyModal';
import { Property } from '../types/property';
import { PropertyFilters, PropertyFiltersState } from '../components/PropertyFilters';
import { FullPageLoader } from '../components/FullPageLoader';

export default function BrowseClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
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
      const query = filters.location.trim().toLowerCase();
      const matchesSearch =
        !query ||
        property.title.toLowerCase().includes(query) ||
        (property.suburb?.toLowerCase().includes(query) || false) ||
        (property.city?.toLowerCase().includes(query) || false) ||
        property.description.toLowerCase().includes(query);

      // Price filter
      const matchesPrice = (property.rentAmount || property.price || 0) >= filters.priceMin && (property.rentAmount || property.price || 0) <= filters.priceMax;

      // Property type filter
      const matchesType = filters.propertyType === 'all' || property.type === filters.propertyType;

      // Bedrooms filter
      const matchesBedrooms =
        filters.bedrooms === 'all' ||
        (filters.bedrooms.endsWith('+')
          ? property.bedrooms >= Number(filters.bedrooms.replace('+', ''))
          : property.bedrooms === Number(filters.bedrooms));

      // Bathrooms filter
      const matchesBathrooms =
        filters.bathrooms === 'all' ||
        (filters.bathrooms.endsWith('+')
          ? property.bathrooms >= Number(filters.bathrooms.replace('+', ''))
          : property.bathrooms === Number(filters.bathrooms));

      // Verified filter
      const matchesVerified = !filters.verified || property.isVerified === true;

      // Available filter
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
