import { DistrictCentroid } from '@rozgarlink/shared-types';

export const DISTRICT_CENTROIDS: Record<string, DistrictCentroid> = {
  pune: { state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567 },
  nashik: { state: 'Maharashtra', district: 'Nashik', lat: 19.9975, lng: 73.7898 },
  nagpur: { state: 'Maharashtra', district: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  kolhapur: { state: 'Maharashtra', district: 'Kolhapur', lat: 16.705, lng: 74.2433 },
  satara: { state: 'Maharashtra', district: 'Satara', lat: 17.6805, lng: 74.0183 },
  mumbai: { state: 'Maharashtra', district: 'Mumbai', lat: 19.076, lng: 72.8777 },
  'mumbai suburban': { state: 'Maharashtra', district: 'Mumbai Suburban', lat: 19.1307, lng: 72.8711 },
  thane: { state: 'Maharashtra', district: 'Thane', lat: 19.2183, lng: 72.9781 },
  aurangabad: { state: 'Maharashtra', district: 'Chhatrapati Sambhajinagar', lat: 19.8762, lng: 75.3433 },
  'chhatrapati sambhajinagar': { state: 'Maharashtra', district: 'Chhatrapati Sambhajinagar', lat: 19.8762, lng: 75.3433 },
  solapur: { state: 'Maharashtra', district: 'Solapur', lat: 17.6599, lng: 75.9064 },
  amravati: { state: 'Maharashtra', district: 'Amravati', lat: 20.9374, lng: 77.7796 },
  ahmednagar: { state: 'Maharashtra', district: 'Ahmednagar', lat: 19.0948, lng: 74.748 },
  ahilyanagar: { state: 'Maharashtra', district: 'Ahilyanagar', lat: 19.0948, lng: 74.748 },
  nanded: { state: 'Maharashtra', district: 'Nanded', lat: 19.1383, lng: 77.321 },
  sangli: { state: 'Maharashtra', district: 'Sangli', lat: 16.8524, lng: 74.5815 },
  jalgaon: { state: 'Maharashtra', district: 'Jalgaon', lat: 21.0077, lng: 75.5626 },
  akola: { state: 'Maharashtra', district: 'Akola', lat: 20.7002, lng: 77.0082 },
  latur: { state: 'Maharashtra', district: 'Latur', lat: 18.4088, lng: 76.5604 },
  dhule: { state: 'Maharashtra', district: 'Dhule', lat: 20.9042, lng: 74.7749 },
  chandrapur: { state: 'Maharashtra', district: 'Chandrapur', lat: 19.9615, lng: 79.2961 },
  parbhani: { state: 'Maharashtra', district: 'Parbhani', lat: 19.2644, lng: 76.7719 },
  beed: { state: 'Maharashtra', district: 'Beed', lat: 18.9891, lng: 75.7601 },
  ratnagiri: { state: 'Maharashtra', district: 'Ratnagiri', lat: 16.9902, lng: 73.312 },
  gondia: { state: 'Maharashtra', district: 'Gondia', lat: 21.4604, lng: 80.1961 },
  wardha: { state: 'Maharashtra', district: 'Wardha', lat: 20.7453, lng: 78.6022 },
  yavatmal: { state: 'Maharashtra', district: 'Yavatmal', lat: 20.3888, lng: 78.1204 },
  osmanabad: { state: 'Maharashtra', district: 'Dharashiv', lat: 18.1856, lng: 76.0416 },
  dharashiv: { state: 'Maharashtra', district: 'Dharashiv', lat: 18.1856, lng: 76.0416 },
  nandurbar: { state: 'Maharashtra', district: 'Nandurbar', lat: 21.3683, lng: 74.2389 },
  hingoli: { state: 'Maharashtra', district: 'Hingoli', lat: 19.7196, lng: 77.1472 },
  washim: { state: 'Maharashtra', district: 'Washim', lat: 20.1114, lng: 77.1354 },
  bhandara: { state: 'Maharashtra', district: 'Bhandara', lat: 21.1714, lng: 79.654 },
  gadchiroli: { state: 'Maharashtra', district: 'Gadchiroli', lat: 20.1849, lng: 79.9948 },
  palghar: { state: 'Maharashtra', district: 'Palghar', lat: 19.6967, lng: 72.7699 },
  raigad: { state: 'Maharashtra', district: 'Raigad', lat: 18.5158, lng: 73.1812 },
  sindhudurg: { state: 'Maharashtra', district: 'Sindhudurg', lat: 16.1154, lng: 73.693 }
};

/**
 * Calculates Haversine distance in kilometers between two lat/lng points.
 */
export function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getDistrictCentroid(districtName?: string): DistrictCentroid | null {
  if (!districtName) return null;
  const key = districtName.toLowerCase().trim();
  return DISTRICT_CENTROIDS[key] || null;
}
