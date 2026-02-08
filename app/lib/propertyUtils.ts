import { Property } from '../types/property';

/**
 * Calculate a security score for a property based on security features
 * Returns a score from 0-100
 */
export function calculateSecurityScore(property: Property): number {
  const securityFeatures = [
    property.walled,
    property.electricGate,
    property.burglarBars,
    property.securityAlarm,
    property.guardedArea,
    property.neighborhoodWatch,
  ];

  const activeFeatures = securityFeatures.filter(Boolean).length;
  const maxFeatures = securityFeatures.length;

  return (activeFeatures / maxFeatures) * 100;
}

/**
 * Get security level label based on score
 */
export function getSecurityLevel(score: number): 'low' | 'medium' | 'high' | 'very_high' {
  if (score >= 83) return 'very_high'; // 5/6 or more features
  if (score >= 67) return 'high'; // 4/6 features
  if (score >= 50) return 'medium'; // 3/6 features
  return 'low'; // Less than 3 features
}

/**
 * Get color for security badge based on level
 */
export function getSecurityColor(level: string): string {
  switch (level) {
    case 'very_high':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'high':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Get security level label for display
 */
export function getSecurityLevelLabel(level: string): string {
  switch (level) {
    case 'very_high':
      return 'Very High';
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return 'Unknown';
  }
}

/**
 * Get security features list for display
 */
export function getSecurityFeatures(property: Property): string[] {
  const features: string[] = [];

  if (property.walled) features.push('Walled');
  if (property.electricGate) features.push('Electric Gate');
  if (property.burglarBars) features.push('Burglar Bars');
  if (property.securityAlarm) features.push('Security Alarm');
  if (property.guardedArea) features.push('Guarded Area');
  if (property.neighborhoodWatch) features.push('Neighborhood Watch');

  return features;
}

/**
 * Calculate overall property amenity score
 */
export function calculateAmenityScore(property: Property): number {
  const amenities = [
    property.lounge,
    property.diningRoom,
    property.kitchen,
    property.veranda,
    property.fenced,
    property.pavedDriveway,
    property.garage,
    property.carport,
    property.tiles,
    property.ceiling,
    property.builtInCupboards,
    property.mainBedroomEnsuite,
  ];

  const activeAmenities = amenities.filter(Boolean).length;
  const maxAmenities = amenities.length;

  return (activeAmenities / maxAmenities) * 100;
}

/**
 * Calculate infrastructure score based on water and power
 */
export function calculateInfrastructureScore(property: Property): number {
  const waterSources = [property.municipalWater, property.borehole, property.waterTank].filter(Boolean).length;
  const powerSources = [property.zesaAvailable, property.solarSystem, property.generator].filter(Boolean).length;

  const waterScore = Math.min(waterSources / 2, 1) * 50; // Up to 50 points for water
  const powerScore = Math.min(powerSources / 2, 1) * 50; // Up to 50 points for power

  return waterScore + powerScore;
}

/**
 * Get property's overall quality rating
 */
export function getPropertyRating(property: Property): {
  security: number;
  amenities: number;
  infrastructure: number;
  overall: number;
} {
  const security = calculateSecurityScore(property);
  const amenities = calculateAmenityScore(property);
  const infrastructure = calculateInfrastructureScore(property);
  const overall = (security + amenities + infrastructure) / 3;

  return {
    security: Math.round(security),
    amenities: Math.round(amenities),
    infrastructure: Math.round(infrastructure),
    overall: Math.round(overall),
  };
}

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  if (currency === 'ZWL') {
    return `$${amount.toLocaleString()} ZWL`;
  }
  return `$${amount.toLocaleString()} ${currency}`;
}

/**
 * Compare two properties and return differences
 */
export function compareProperties(
  property1: Property,
  property2: Property
): {
  field: string;
  value1: any;
  value2: any;
  different: boolean;
}[] {
  const fieldsToCompare = [
    'title',
    'rentAmount',
    'currency',
    'bedrooms',
    'bathrooms',
    'toilets',
    'area',
    'type',
    'furnished',
    'yardSize',
    'parkingSpaces',
    'walled',
    'electricGate',
    'burglarBars',
    'securityAlarm',
    'zesaAvailable',
    'solarSystem',
    'generator',
    'municipalWater',
    'borehole',
    'waterTank',
    'internetReady',
    'fiberAvailable',
    'wifiIncluded',
  ];

  return fieldsToCompare.map((field) => ({
    field,
    value1: (property1 as any)[field],
    value2: (property2 as any)[field],
    different: (property1 as any)[field] !== (property2 as any)[field],
  }));
}
