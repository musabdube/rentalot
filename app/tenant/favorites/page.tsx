'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { PropertyCard } from '@/app/components/PropertyCard';
import { PropertyModal } from '@/app/components/PropertyModal';
import { Property } from '@/app/types/property';

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Check authentication first, then fetch
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      return;
    }
    fetchFavorites();
  }, [session?.user?.id, status]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
      setFavoriteIds((Array.isArray(data) ? data : []).map((fav: any) => fav.id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteChange = (propertyId: string, isFavorited: boolean) => {
    if (!isFavorited) {
      // Remove from favorites
      setFavorites(favorites.filter(p => p.id !== propertyId));
      setFavoriteIds(favoriteIds.filter(id => id !== propertyId));
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!session || session.user?.role !== 'TENANT') {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring properties and save your favorites!
            </p>
            <Link
              href="/"
              className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Heart className="w-7 h-7 text-emerald-600" />My Favorite Properties</h1>
              <p className="text-gray-600 mt-2">{favorites.length} property/properties saved</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={setSelectedProperty}
                  isFavorited={favoriteIds.includes(property.id)}
                  onFavoriteChange={(isFavorited) => handleFavoriteChange(property.id, isFavorited)}
                />
              ))}
            </div>
          </div>
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
