import { Search, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  priceRange: number;
  onPriceRangeChange: (value: number) => void;
  propertyType: string;
  onPropertyTypeChange: (value: string) => void;
  // Student-friendly filters
  studentFriendly?: boolean;
  onStudentFriendlyChange?: (value: boolean) => void;
  nearCampus?: boolean;
  onNearCampusChange?: (value: boolean) => void;
  walkingDistance?: boolean;
  onWalkingDistanceChange?: (value: boolean) => void;
  publicTransportNearby?: boolean;
  onPublicTransportNearbyChange?: (value: boolean) => void;
  furnished?: boolean;
  onFurnishedChange?: (value: boolean) => void;
  sharedRoomAllowed?: boolean;
  onSharedRoomAllowedChange?: (value: boolean) => void;
  wifiIncluded?: boolean;
  onWifiIncludedChange?: (value: boolean) => void;
  utilitiesIncluded?: boolean;
  onUtilitiesIncludedChange?: (value: boolean) => void;
  studyFriendly?: boolean;
  onStudyFriendlyChange?: (value: boolean) => void;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  priceRange,
  onPriceRangeChange,
  propertyType,
  onPropertyTypeChange,
  studentFriendly = false,
  onStudentFriendlyChange,
  nearCampus = false,
  onNearCampusChange,
  walkingDistance = false,
  onWalkingDistanceChange,
  publicTransportNearby = false,
  onPublicTransportNearbyChange,
  furnished = false,
  onFurnishedChange,
  sharedRoomAllowed = false,
  onSharedRoomAllowedChange,
  wifiIncluded = false,
  onWifiIncludedChange,
  utilitiesIncluded = false,
  onUtilitiesIncludedChange,
  studyFriendly = false,
  onStudyFriendlyChange,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filter Properties</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Location, title..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price: ${priceRange.toLocaleString()}/mo
          </label>
          <div className="relative pt-3">
            {/* Slider with filled track using inline gradient */}
            {(() => {
              const min = 0;
              const max = 6000;
              const pct = Math.round(((priceRange - min) / (max - min)) * 100);
              const bg = `linear-gradient(90deg, rgba(16,185,129,1) 0%, rgba(16,185,129,1) ${pct}%, rgba(229,231,235,1) ${pct}%, rgba(229,231,235,1) 100%)`;
              return (
                <>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={100}
                    value={priceRange}
                    onChange={(e) => onPriceRangeChange(Number(e.target.value))}
                    className="w-full h-3 appearance-none cursor-pointer rounded-lg"
                    style={{ background: bg }}
                  />

                  {/* Value bubble */}
                  <div className="absolute left-0 top-1/2 w-full pointer-events-none">
                    <div
                      className="absolute"
                      style={{ left: `${pct}%`, transform: 'translate(-50%, -120%)' }}
                    >
                      <div className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-md shadow">${priceRange.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Min/Max labels */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                    <span>$0</span>
                    <span>$6,000+</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <select
            value={propertyType}
            onChange={(e) => onPropertyTypeChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white"
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="studio">Studio</option>
          </select>
        </div>
      </div>

      {/* Student-Friendly Filters Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Student-Friendly Features</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {onStudentFriendlyChange && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={studentFriendly}
                onChange={(e) => onStudentFriendlyChange(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Student Friendly</span>
            </label>
          )}

          {onNearCampusChange && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={nearCampus}
                onChange={(e) => onNearCampusChange(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Near Campus</span>
            </label>
          )}

          {onWalkingDistanceChange && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={walkingDistance}
                onChange={(e) => onWalkingDistanceChange(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Walking Distance</span>
            </label>
          )}

          {onPublicTransportNearbyChange && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={publicTransportNearby}
                onChange={(e) => onPublicTransportNearbyChange(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Public Transport</span>
            </label>
          )}

          {onFurnishedChange && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={furnished}
                onChange={(e) => onFurnishedChange(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Furnished</span>
            </label>
          )}

          {onSharedRoomAllowedChange && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sharedRoomAllowed}
                onChange={(e) => onSharedRoomAllowedChange(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Shared Room OK</span>
            </label>
          )}

          {onWifiIncludedChange && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wifiIncluded}
                onChange={(e) => onWifiIncludedChange(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">WiFi Included</span>
            </label>
          )}

          {onUtilitiesIncludedChange && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={utilitiesIncluded}
                onChange={(e) => onUtilitiesIncludedChange(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Utilities Included</span>
            </label>
          )}

          {onStudyFriendlyChange && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={studyFriendly}
                onChange={(e) => onStudyFriendlyChange(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Study Friendly</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
