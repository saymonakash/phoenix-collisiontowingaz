export type LngLat = [number, number];

export type ServiceType = "towing" | "fuel" | "lockout" | "jumpstart";

export interface AddressSuggestion {
  label: string;
  coords: LngLat;
}

export interface VehicleInfo {
  year: string;
  make: string;
  model: string;
  plate: string;
  registrationState: string;
  isLarge: boolean;
}

export interface LocationInfo {
  fromAddress: string;
  toAddress: string;
  fromSelected: AddressSuggestion | null;
  toSelected: AddressSuggestion | null;
  miles: string;
  currentCoords: LngLat | null;
}

export interface DiscountInfo {
  isVeteran: boolean;
  isStudent: boolean;
}

export interface QuoteData extends VehicleInfo, LocationInfo, DiscountInfo {
  service: ServiceType;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message?: string;
  location?: {
    latitude: number;
    longitude: number;
    googleMapsLink: string;
    accuracy: string;
  } | null;
  estimatedTotal: number;
}
