'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/app/components/Header';
import { Property } from '@/app/types/property';
import { ArrowLeft, Plus, Minus, X } from 'lucide-react';
import Link from 'next/link';
import { PropertyCard } from '@/app/components/PropertyCard';
import { compareProperties, calculateSecurityScore, calculateAmenityScore, formatPrice } from '@/app/lib/propertyUtils';
import { SecurityBadge } from '@/app/components/SecurityBadge';

export default function PropertyComparePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/properties/get');
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }

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
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToComparison = (property: Property) => {
    if (selectedProperties.length < 4 && !selectedProperties.find(p => p.id === property.id)) {
      setSelectedProperties([...selectedProperties, property]);
    }
  };

  const removeFromComparison = (propertyId: string) => {
    setSelectedProperties(selectedProperties.filter(p => p.id !== propertyId));
  };

  const handleFavoriteChange = (propertyId: string, isFavorited: boolean) => {
    if (isFavorited) {
      setFavorites([...favorites, propertyId]);
    } else {
      setFavorites(favorites.filter(id => id !== propertyId));
    }
  };

  const comparisonData = selectedProperties.length > 1 ? compareProperties(selectedProperties[0], selectedProperties[1]) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/browse" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Compare Properties</h1>
          <p className="text-gray-600">
            Select up to 4 properties to compare side-by-side. Click the + button on any property card to add it to the comparison.
          </p>
        </div>

        {/* Comparison View */}
        {selectedProperties.length > 0 && (
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border-2 border-emerald-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Selected for Comparison ({selectedProperties.length}/4)
              </h2>
              {selectedProperties.length > 0 && (
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  {showComparison ? 'Hide' : 'Show'} Comparison
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {selectedProperties.map((property) => (
                <div key={property.id} className="relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 mb-3">
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{property.title}</h3>
                    <p className="text-sm text-gray-600">${property.rentAmount || property.price}/{property.currency || 'USD'}/mo</p>
                  </div>
                  <button
                    onClick={() => removeFromComparison(property.id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Detailed Comparison Table */}
            {showComparison && selectedProperties.length > 1 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Feature</th>
                      {selectedProperties.map((property) => (
                        <th key={property.id} className="px-4 py-3 text-left font-semibold text-gray-900">
                          <div className="text-sm line-clamp-2">{property.title}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Price */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Price/Month</td>
                      {selectedProperties.map((property) => (
                        <td key={property.id} className="px-4 py-3 text-gray-700">
                          <span className="font-semibold text-emerald-600">
                            ${property.rentAmount || property.price} {property.currency || 'USD'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Bedrooms */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Bedrooms</td>
                      {selectedProperties.map((property) => (
                        <td key={property.id} className="px-4 py-3 text-gray-700">
                          {property.bedrooms}
                        </td>
                      ))}
                    </tr>

                    {/* Bathrooms */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Bathrooms</td>
                      {selectedProperties.map((property) => (
                        <td key={property.id} className="px-4 py-3 text-gray-700">
                          {property.bathrooms}
                        </td>
                      ))}
                    </tr>

                    {/* Area */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Area (m²)</td>
                      {selectedProperties.map((property) => (
                        <td key={property.id} className="px-4 py-3 text-gray-700">
                          {property.area || 'N/A'}
                        </td>
                      ))}
                    </tr>

                    {/* Security Score */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50 bg-red-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Security Score</td>
                      {selectedProperties.map((property) => {
                        const score = calculateSecurityScore(property);
                        return (
                          <td key={property.id} className="px-4 py-3">
                            <span className="font-semibold text-red-600">{score.toFixed(0)}%</span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Amenity Score */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Amenity Score</td>
                      {selectedProperties.map((property) => {
                        const score = calculateAmenityScore(property);
                        return (
                          <td key={property.id} className="px-4 py-3">
                            <span className="font-semibold text-emerald-600">{score.toFixed(0)}%</span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Water */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Water Sources</td>
                      {selectedProperties.map((property) => {
                        const sources = [
                          property.municipalWater ? 'Municipal' : null,
                          property.borehole ? 'Borehole' : null,
                          property.waterTank ? 'Tank' : null,
                        ].filter(Boolean);
                        return (
                          <td key={property.id} className="px-4 py-3 text-gray-700">
                            {sources.length > 0 ? sources.join(', ') : 'None'}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Power */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Power Sources</td>
                      {selectedProperties.map((property) => {
                        const sources = [
                          property.zesaAvailable ? 'ZESA' : null,
                          property.solarSystem ? 'Solar' : null,
                          property.generator ? 'Generator' : null,
                        ].filter(Boolean);
                        return (
                          <td key={property.id} className="px-4 py-3 text-gray-700">
                            {sources.length > 0 ? sources.join(', ') : 'None'}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Furnished */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Furnished</td>
                      {selectedProperties.map((property) => (
                        <td key={property.id} className="px-4 py-3 text-gray-700">
                          {property.furnished || 'No'}
                        </td>
                      ))}
                    </tr>

                    {/* Parking */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Parking Spaces</td>
                      {selectedProperties.map((property) => (
                        <td key={property.id} className="px-4 py-3 text-gray-700">
                          {property.parkingSpaces || '0'}
                        </td>
                      ))}
                    </tr>

                    {/* Pets */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Pets Allowed</td>
                      {selectedProperties.map((property) => (
                        <td key={property.id} className="px-4 py-3 text-gray-700">
                          {property.petsAllowed ? '✅ Yes' : '❌ No'}
                        </td>
                      ))}
                    </tr>

                    {/* Smoking */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Smoking Allowed</td>
                      {selectedProperties.map((property) => (
                        <td key={property.id} className="px-4 py-3 text-gray-700">
                          {property.smokingAllowed ? '✅ Yes' : '❌ No'}
                        </td>
                      ))}
                    </tr>

                    {/* WiFi */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">WiFi Included</td>
                      {selectedProperties.map((property) => (
                        <td key={property.id} className="px-4 py-3 text-gray-700">
                          {property.wifiIncluded ? '✅ Yes' : '❌ No'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Browse Properties */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {properties.length > 0 ? 'Click + to Add Properties to Compare' : 'Loading Properties...'}
          </h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="relative">
                  <PropertyCard
                    property={property}
                    onSelect={() => setSelectedProperty(property)}
                    onClick={() => setSelectedProperty(property)}
                    isFavorited={favorites.includes(property.id)}
                    onFavoriteChange={(isFav) => handleFavoriteChange(property.id, isFav)}
                  />
                  {selectedProperties.find(p => p.id === property.id) ? (
                    <button
                      onClick={() => removeFromComparison(property.id)}
                      className="absolute bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors"
                      title="Remove from comparison"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  ) : selectedProperties.length < 4 ? (
                    <button
                      onClick={() => addToComparison(property)}
                      className="absolute bottom-4 right-4 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg transition-colors"
                      title="Add to comparison"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
