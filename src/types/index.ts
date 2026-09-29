export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  role: 'guest' | 'host' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  host_id: string;
  title: string;
  description: string;
  city: string;
  state: string | null;
  country: string;
  property_type: 'resort' | 'villa' | 'cabin' | 'hotel' | 'apartment' | 'cottage';
  amenities: string[];
  images: string[];
  base_price: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  cancellation_policy: 'flexible' | 'moderate' | 'strict';
  booking_mode: 'instant' | 'request';
  status: 'active' | 'pending' | 'inactive';
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  host?: Profile;
  reviews?: Review[];
  pricing_rules?: PricingRule[];
}

export interface PricingRule {
  id: string;
  property_id: string;
  rule_type: 'weekend_surcharge' | 'seasonal' | 'long_stay_discount' | 'last_minute_discount';
  value: number;
  start_date: string | null;
  end_date: string | null;
  min_nights: number | null;
  created_at: string;
}

export interface Booking {
  id: string;
  property_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  base_total: number | null;
  fees: number;
  taxes: number;
  discount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'declined';
  stripe_payment_intent_id: string | null;
  promo_code_id: string | null;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
  property?: Property;
  guest?: Profile;
}

export interface Review {
  id: string;
  booking_id: string;
  property_id: string;
  guest_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  guest?: Profile;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  created_by: string | null;
  property_id: string | null;
  created_at: string;
}

export interface Availability {
  id: string;
  property_id: string;
  date: string;
  is_blocked: boolean;
}

export interface SearchFilters {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  minPrice: number;
  maxPrice: number;
  propertyType: string;
  amenities: string[];
}
