export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'villa' | 'studio';
  available: boolean;
  area?: number;
  features: string[];
  
  // Listing status
  status?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  featuredUntil?: string;
  isPinned?: boolean;
  pinnedAt?: string | null;

  // Landlord info
  landlordId?: string;
  landlord?: {
    id: string;
    name: string;
    avatar?: string;
    isVerified?: boolean;
  };

  // Images
  imageUrl?: string;
  images?: Array<{ url: string; isMain: boolean }>;

  // ===== LOCATION =====
  city: string;
  suburb?: string;
  street?: string;
  nearbyLandmark?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;

  // ===== PRICING =====
  rentAmount: number;
  price?: number; // Legacy support
  currency?: string;
  depositAmount?: number;
  leaseTerm?: string;
  negotiable?: boolean;

  // ===== GARDEN / YARD =====
  yardSize?: string;
  veranda?: boolean;
  fenced?: boolean;
  pavedDriveway?: boolean;

  // ===== ROOMS =====
  bedrooms: number;
  bathrooms: number;
  toilets?: number;
  lounge?: boolean;
  diningRoom?: boolean;
  kitchen?: boolean;
  sharedBathroom?: boolean;

  // ===== PARKING =====
  parkingSpaces?: number;
  garage?: boolean;
  carport?: boolean;

  // ===== WATER =====
  municipalWater?: boolean;
  borehole?: boolean;
  waterTank?: boolean;
  tankCapacity?: string;

  // ===== POWER =====
  zesaAvailable?: boolean;
  solarSystem?: boolean;
  solarBackupHours?: number;
  generator?: boolean;

  // ===== CONNECTIVITY =====
  internetReady?: boolean;
  fiberAvailable?: boolean;
  wifiIncluded?: boolean;

  // ===== SECURITY =====
  walled?: boolean;
  electricGate?: boolean;
  burglarBars?: boolean;
  securityAlarm?: boolean;
  guardedArea?: boolean;
  neighborhoodWatch?: boolean;

  // ===== CONDITION & EXTRAS =====
  furnished?: string;
  recentlyRenovated?: boolean;
  tiles?: boolean;
  ceiling?: boolean;
  builtInCupboards?: boolean;
  mainBedroomEnsuite?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  sharedProperty?: boolean;

  // ===== STUDENT FRIENDLY =====
  studentFriendly?: boolean;
  nearCampus?: boolean;
  campusName?: string;
  distanceToCampus?: number;
  walkingDistance?: boolean;
  publicTransportNearby?: boolean;
  sharedRoomAllowed?: boolean;
  utilitiesIncluded?: boolean;
  studyFriendly?: boolean;

  // ===== SHORT-TERM BOOKINGS =====
  shortTermAvailable?: boolean;
  shortTermPricePerNight?: number;
  shortTermMinNights?: number;
  shortTermMaxNights?: number;
}
