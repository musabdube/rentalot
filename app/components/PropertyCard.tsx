import { Bed, Bath, Maximize2, MapPin, ImageIcon, Heart, ChevronLeft, ChevronRight, GraduationCap, Wifi, Zap, Bus } from 'lucide-react';
import { Property } from '../types/property';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { VerificationBadge } from './VerificationBadge';

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
  onClick?: (property: Property) => void;
  isFavorited?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
}

export function PropertyCard({ property, onSelect, onClick, isFavorited = false, onFavoriteChange }: PropertyCardProps) {
  const [isLiked, setIsLiked] = useState(isFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data: session } = useSession();
  
  const images = property.images && property.images.length > 0 
    ? property.images 
    : [{ url: property.imageUrl, isMain: true }];
  const imageCount = images.length;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session || session.user?.role !== 'TENANT') {
      toast.error('Sign in as a tenant to favorite properties');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/favorites/${property.id}`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        onFavoriteChange?.(!isLiked);
        toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error updating favorite');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      onClick={() => {
        if (onClick) {
          onClick(property);
        } else if (onSelect) {
          onSelect(property);
        }
      }}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-64 overflow-hidden bg-gray-200">
        <img
          src={images[currentImageIndex].url}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Image Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 transition-all z-10"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </>
        )}

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`p-2 rounded-full transition-all ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-800 hover:bg-red-50'
            } disabled:opacity-50`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <div className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
            ${(property.rentAmount || property.price || 0).toLocaleString()}/{property.currency || 'USD'}/mo
          </div>
        </div>
        <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium uppercase">
          {property.type}
        </div>
        
        {/* Image Counter & Count Badge */}
        {imageCount > 1 && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
            <ImageIcon className="w-3 h-3" />
            {currentImageIndex + 1} / {imageCount}
          </div>
        )}
      </div>

      {/* Image Thumbnails */}
      {images.length > 1 && (
        <div className="bg-gray-100 px-4 py-3 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(index);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                index === currentImageIndex
                  ? 'ring-2 ring-emerald-600'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors flex-1">
            {property.title}
          </h3>
          <VerificationBadge isVerified={property.isVerified ?? false} size="sm" />
        </div>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.suburb || property.city}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        {/* Student-Friendly Badges */}
        {(property.studentFriendly || property.nearCampus || property.wifiIncluded || property.utilitiesIncluded || property.publicTransportNearby) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {property.studentFriendly && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                <GraduationCap className="w-3 h-3" />
                Student Friendly
              </span>
            )}
            {property.nearCampus && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                <MapPin className="w-3 h-3" />
                Near Campus
              </span>
            )}
            {property.wifiIncluded && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                <Wifi className="w-3 h-3" />
                WiFi
              </span>
            )}
            {property.utilitiesIncluded && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                <Zap className="w-3 h-3" />
                Utilities
              </span>
            )}
            {property.publicTransportNearby && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                <Bus className="w-3 h-3" />
                Transport
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-gray-700">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span className="text-sm font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span className="text-sm font-medium">{property.bathrooms}</span>
            </div>
              {property.sharedBathroom && (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-emerald-600">Shared Bath</span>
                </div>
              )}
            <div className="flex items-center gap-1">
              <Maximize2 className="w-4 h-4" />
              <span className="text-sm font-medium">{property.area} m²</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
