'use client';

import { useMemo, useState } from 'react';
import { MapPin, SlidersHorizontal, Tag, X } from 'lucide-react';

export interface PropertyFiltersState {
  location: string;
  priceMin: number;
  priceMax: number;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  verified: boolean;
  available: boolean;
  nearCampus: boolean;
  walkingDistance: boolean;
  studyFriendly: boolean;
  wifiIncluded: boolean;
  furnished: boolean;
  utilitiesIncluded: boolean;
}

interface PropertyFiltersProps {
  filters: PropertyFiltersState;
  onChange: (key: keyof PropertyFiltersState, value: string | number | boolean) => void;
  onReset: () => void;
  maxPrice?: number;
}

const PROPERTY_TYPES = [
  { label: 'All', value: 'all' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Villa', value: 'villa' },
  { label: 'Studio', value: 'studio' },
];

const BED_BATH_OPTIONS = [
  { label: 'Any', value: 'all' },
  { label: '1+', value: '1+' },
  { label: '2+', value: '2+' },
  { label: '3+', value: '3+' },
];

export function PropertyFilters({ filters, onChange, onReset, maxPrice = 10000 }: PropertyFiltersProps) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPricePopover, setShowPricePopover] = useState(false);

  const activeCount = useMemo(() => {
    let count = 0;

    if (filters.location.trim()) count += 1;
    if (filters.priceMin > 0) count += 1;
    if (filters.priceMax < maxPrice) count += 1;
    if (filters.propertyType !== 'all') count += 1;
    if (filters.bedrooms !== 'all') count += 1;
    if (filters.bathrooms !== 'all') count += 1;
    if (filters.verified) count += 1;
    if (filters.nearCampus) count += 1;
    if (filters.walkingDistance) count += 1;
    if (filters.studyFriendly) count += 1;
    if (filters.wifiIncluded) count += 1;
    if (filters.furnished) count += 1;
    if (filters.utilitiesIncluded) count += 1;

    return count;
  }, [filters, maxPrice]);

  const minPct = Math.min(100, Math.max(0, Math.round((filters.priceMin / maxPrice) * 100)));
  const maxPct = Math.min(100, Math.max(0, Math.round((filters.priceMax / maxPrice) * 100)));

  const handleMinPrice = (value: number) => {
    const next = Math.min(value, filters.priceMax);
    onChange('priceMin', next);
  };

  const handleMaxPrice = (value: number) => {
    const next = Math.max(value, filters.priceMin);
    onChange('priceMax', next);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 border border-gray-100">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-3 px-4 py-3 rounded-full border border-gray-200 bg-gray-50">
            <MapPin className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => onChange('location', e.target.value)}
              placeholder="Search by city or neighborhood"
              className="w-full bg-transparent text-sm text-gray-900 outline-none"
            />
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPricePopover((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-emerald-400"
          >
            <Tag className="w-4 h-4 text-emerald-600" />
            ${filters.priceMin.toLocaleString()} - ${filters.priceMax.toLocaleString()}
          </button>

          {showPricePopover && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl p-4 z-30">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">Price range</p>
                <button
                  type="button"
                  onClick={() => setShowPricePopover(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Min</label>
                  <input
                    type="number"
                    min={0}
                    max={filters.priceMax}
                    value={filters.priceMin}
                    onChange={(e) => handleMinPrice(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Max</label>
                  <input
                    type="number"
                    min={filters.priceMin}
                    max={maxPrice}
                    value={filters.priceMax}
                    onChange={(e) => handleMaxPrice(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="relative h-6">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gray-200" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-emerald-500"
                  style={{ left: `${minPct}%`, width: `${Math.max(0, maxPct - minPct)}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  step={50}
                  value={filters.priceMin}
                  onChange={(e) => handleMinPrice(Number(e.target.value))}
                  className="absolute left-0 top-0 w-full h-6 appearance-none bg-transparent pointer-events-auto"
                />
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  step={50}
                  value={filters.priceMax}
                  onChange={(e) => handleMaxPrice(Number(e.target.value))}
                  className="absolute left-0 top-0 w-full h-6 appearance-none bg-transparent pointer-events-auto"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange('propertyType', type.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                filters.propertyType === type.value
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowDrawer(true)}
          className="relative flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-emerald-400"
        >
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-xs">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {showDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowDrawer(false)}
          />
          <div className="ml-auto w-full max-w-md bg-white h-full shadow-2xl relative overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Advanced filters</h3>
                <p className="text-xs text-gray-500">Refine your search further</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Bedrooms</p>
                <div className="flex flex-wrap gap-2">
                  {BED_BATH_OPTIONS.map((option) => (
                    <button
                      key={`bed-${option.value}`}
                      type="button"
                      onClick={() => onChange('bedrooms', option.value)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                        filters.bedrooms === option.value
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Bathrooms</p>
                <div className="flex flex-wrap gap-2">
                  {BED_BATH_OPTIONS.map((option) => (
                    <button
                      key={`bath-${option.value}`}
                      type="button"
                      onClick={() => onChange('bathrooms', option.value)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                        filters.bathrooms === option.value
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Price range</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-gray-500">Min</label>
                    <input
                      type="number"
                      min={0}
                      max={filters.priceMax}
                      value={filters.priceMin}
                      onChange={(e) => handleMinPrice(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Max</label>
                    <input
                      type="number"
                      min={filters.priceMin}
                      max={maxPrice}
                      value={filters.priceMax}
                      onChange={(e) => handleMaxPrice(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="relative h-6">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gray-200" />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-emerald-500"
                    style={{ left: `${minPct}%`, width: `${Math.max(0, maxPct - minPct)}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={50}
                    value={filters.priceMin}
                    onChange={(e) => handleMinPrice(Number(e.target.value))}
                    className="absolute left-0 top-0 w-full h-6 appearance-none bg-transparent pointer-events-auto"
                  />
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={50}
                    value={filters.priceMax}
                    onChange={(e) => handleMaxPrice(Number(e.target.value))}
                    className="absolute left-0 top-0 w-full h-6 appearance-none bg-transparent pointer-events-auto"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Student Living</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onChange('nearCampus', !filters.nearCampus)}
                    className={`px-3 py-2 rounded-full text-sm font-semibold border ${
                      filters.nearCampus
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                    }`}
                  >
                    Near Campus
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('walkingDistance', !filters.walkingDistance)}
                    className={`px-3 py-2 rounded-full text-sm font-semibold border ${
                      filters.walkingDistance
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                    }`}
                  >
                    Walking Distance
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('studyFriendly', !filters.studyFriendly)}
                    className={`px-3 py-2 rounded-full text-sm font-semibold border ${
                      filters.studyFriendly
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                    }`}
                  >
                    Study Friendly
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Inclusions</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onChange('wifiIncluded', !filters.wifiIncluded)}
                    className={`px-3 py-2 rounded-full text-sm font-semibold border ${
                      filters.wifiIncluded
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                    }`}
                  >
                    WiFi Included
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('furnished', !filters.furnished)}
                    className={`px-3 py-2 rounded-full text-sm font-semibold border ${
                      filters.furnished
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                    }`}
                  >
                    Furnished
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('utilitiesIncluded', !filters.utilitiesIncluded)}
                    className={`px-3 py-2 rounded-full text-sm font-semibold border ${
                      filters.utilitiesIncluded
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                    }`}
                  >
                    Utilities Included
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Availability and verification</p>
                <div className="space-y-3">
                  <label className="flex items-center justify-between text-sm text-gray-700">
                    Verified only
                    <button
                      type="button"
                      onClick={() => onChange('verified', !filters.verified)}
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                        filters.verified ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          filters.verified ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                  <label className="flex items-center justify-between text-sm text-gray-700">
                    Available now
                    <button
                      type="button"
                      onClick={() => onChange('available', !filters.available)}
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                        filters.available ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          filters.available ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onReset}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                Reset all
              </button>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="px-5 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
