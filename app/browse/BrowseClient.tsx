"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '../components/Header';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyModal } from '../components/PropertyModal';
import { Property } from '../types/property';
import { PropertyFilters, PropertyFiltersState } from '../components/PropertyFilters';
import { FullPageLoader } from '../components/FullPageLoader';
import {
  Search, Users, Building2, MapPin, DollarSign, Calendar,
  MessageSquare, CheckCircle, PlusCircle, Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';

interface RoommateListing {
  id: string;
  title: string;
  bio: string;
  budget: number;
  currency: string;
  preferredLocation: string;
  moveInDate: string;
  smoking: boolean;
  pets: boolean;
  studyFriendly: boolean;
  nightOwl: boolean;
  earlyBird: boolean;
  cleanliness: string | null;
  gender: string | null;
  occupation: string | null;
  status: string;
  tenant: { id: string; name: string; avatar: string | null; verificationStatus: boolean };
  property: { id: string; title: string; city: string } | null;
}

const PRICE_FMT = new Intl.NumberFormat('en-US');

export default function BrowseClient() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<'properties' | 'roommates'>('properties');

  // ── Properties state ──────────────────────────────────────────────
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

  // ── Roommates state ───────────────────────────────────────────────
  const [roommates, setRoommates] = useState<RoommateListing[]>([]);
  const [roommatesLoading, setRoommatesLoading] = useState(false);
  const [roommatesLoaded, setRoommatesLoaded] = useState(false);
  const [rmLocation, setRmLocation] = useState('');
  const [rmMaxBudget, setRmMaxBudget] = useState('');
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  const fetchRoommates = async (loc = rmLocation, budget = rmMaxBudget) => {
    setRoommatesLoading(true);
    const params = new URLSearchParams();
    if (loc) params.set('location', loc);
    if (budget) params.set('maxBudget', budget);
    try {
      const res = await fetch(`/api/roommate/listings?${params}`);
      if (res.ok) setRoommates(await res.json());
    } catch { /* silent */ }
    setRoommatesLoading(false);
    setRoommatesLoaded(true);
  };

  // Load roommates when tab is first switched to it
  useEffect(() => {
    if (tab === 'roommates' && !roommatesLoaded) {
      fetchRoommates();
    }
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async (listingId: string, receiverId: string) => {
    if (!messageContent.trim()) return;
    setSending(true);
    const res = await fetch('/api/roommate/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, receiverId, content: messageContent }),
    });
    setSending(false);
    if (res.ok) {
      setMessageContent('');
      setMessagingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <div className="bg-linear-to-br from-emerald-600 to-emerald-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <Search className="w-8 h-8" />Browse
          </h1>
          <p className="text-emerald-50 mb-6">Find your next home or a compatible roommate.</p>

          {/* Tab switcher */}
          <div className="inline-flex bg-white/15 rounded-xl p-1 gap-1">
            <button
              onClick={() => setTab('properties')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'properties'
                  ? 'bg-white text-emerald-700 shadow'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Building2 className="w-4 h-4" />Properties
            </button>
            <button
              onClick={() => setTab('roommates')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'roommates'
                  ? 'bg-white text-emerald-700 shadow'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Users className="w-4 h-4" />Roommates
            </button>
          </div>
        </div>
      </div>

      {/* ── Properties tab ───────────────────────────────────── */}
      {tab === 'properties' && (
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
      )}

      {/* ── Roommates tab ────────────────────────────────────── */}
      {tab === 'roommates' && (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Roommate search bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-full bg-white px-4 py-2.5 shadow-sm">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Filter by location..."
                value={rmLocation}
                onChange={(e) => setRmLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchRoommates()}
                className="flex-1 text-sm bg-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-full bg-white px-4 py-2.5 shadow-sm w-full sm:w-44">
              <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="number"
                placeholder="Max budget"
                value={rmMaxBudget}
                onChange={(e) => setRmMaxBudget(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchRoommates()}
                className="w-full text-sm bg-transparent outline-none"
              />
            </div>
            <button
              onClick={() => fetchRoommates()}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Search className="w-4 h-4" />Search
            </button>
            <Link
              href="/tenant/roommate/create"
              className="flex items-center justify-center gap-2 border border-emerald-600 text-emerald-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-50 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />Post Listing
            </Link>
          </div>

          {roommatesLoading ? (
            <div className="text-center py-16 text-gray-400">Loading roommate listings...</div>
          ) : roommates.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No roommate listings found. Be the first to post one!</p>
              <Link
                href="/tenant/roommate/create"
                className="inline-flex items-center gap-2 mt-4 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />Post a Listing
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {roommates.length} {roommates.length === 1 ? 'listing' : 'listings'} found
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {roommates.map((l) => (
                  <div key={l.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                    {/* Tenant info */}
                    <div className="flex items-start gap-3 mb-3">
                      {l.tenant.avatar ? (
                        <img src={l.tenant.avatar} alt={l.tenant.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                          {l.tenant.name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-900 truncate">{l.tenant.name}</span>
                          {l.tenant.verificationStatus && (
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{l.occupation ?? 'Tenant'}</p>
                      </div>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium shrink-0">
                        {l.currency} {PRICE_FMT.format(l.budget)}/mo
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{l.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{l.bio}</p>

                    {/* Meta chips */}
                    <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                        <MapPin className="w-3 h-3" />{l.preferredLocation}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                        <Calendar className="w-3 h-3" />
                        {new Date(l.moveInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {l.gender && (
                        <span className="bg-gray-50 px-2 py-1 rounded-full capitalize">{l.gender}</span>
                      )}
                    </div>

                    {/* Lifestyle tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {l.pets && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Pets OK</span>}
                      {l.smoking && <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">Smoker</span>}
                      {l.studyFriendly && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">Study-friendly</span>}
                      {l.nightOwl && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">Night owl</span>}
                      {l.earlyBird && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">Early bird</span>}
                    </div>

                    {/* Message / CTA */}
                    {session ? (
                      session.user.id !== l.tenant.id && (
                        messagingId === l.id ? (
                          <div className="border-t border-gray-100 pt-3">
                            <textarea
                              rows={3}
                              className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                              placeholder="Write a message..."
                              value={messageContent}
                              onChange={(e) => setMessageContent(e.target.value)}
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => sendMessage(l.id, l.tenant.id)}
                                disabled={sending}
                                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
                              >
                                {sending ? 'Sending...' : 'Send'}
                              </button>
                              <button
                                onClick={() => setMessagingId(null)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setMessagingId(l.id); setMessageContent(''); }}
                            className="w-full flex items-center justify-center gap-2 border border-emerald-200 text-emerald-700 py-2 rounded-full text-sm font-semibold hover:bg-emerald-50 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />Message
                          </button>
                        )
                      )
                    ) : (
                      <Link
                        href="/auth/signin"
                        className="w-full flex items-center justify-center gap-2 border border-emerald-200 text-emerald-700 py-2 rounded-full text-sm font-semibold hover:bg-emerald-50 transition-colors"
                      >
                        <LinkIcon className="w-4 h-4" />Sign in to message
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      )}

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}
