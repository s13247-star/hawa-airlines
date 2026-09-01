export type TripType = 'round_trip' | 'one_way' | 'multi_city';

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export type FareTierKey = 'light' | 'standard' | 'flex';

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  terminal?: string;
  timezone: string;
  popular?: boolean;
}

export interface Airline {
  name: string;
  code: string;
  logoColor: string;
  alliance?: string;
  callsign?: string;
}

export interface FlightSegment {
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: string; // ISO or HH:MM format
  arrivalTime: string;
  durationMinutes: number;
  flightNumber: string;
  airline: Airline;
  aircraft: {
    model: string;
    code: string;
    manufacturer: string;
  };
  layoverDurationMinutes?: number;
}

export interface FareTierOption {
  tier: FareTierKey;
  name: string;
  priceMultiplier: number;
  cabinBaggage: string;
  checkedBaggage: string;
  seatSelection: string;
  changesAllowed: boolean;
  refundable: boolean;
  pointsMultiplier: number; // e.g. 1.0x, 1.5x, 2.0x
  perks: string[];
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: Airline;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:MM
  arrivalDate: string;   // YYYY-MM-DD
  arrivalTime: string;   // HH:MM
  durationMinutes: number;
  stops: number; // 0 = direct, 1 = 1 stop, etc.
  stopDetails?: {
    airport: Airport;
    durationMinutes: number;
  }[];
  segments: FlightSegment[];
  aircraft: {
    model: string;
    code: string;
  };
  basePrices: Record<CabinClass, number>;
  availableSeats: {
    economy: number;
    premium_economy: number;
    business: number;
    first: number;
  };
  amenities: {
    wifi: boolean;
    powerOutlets: boolean;
    inFlightMeal: boolean;
    entertainmentScreen: boolean;
    usbPorts: boolean;
    lieFlatSeats: boolean;
    liveTv: boolean;
  };
  onTimePerformance: number; // percentage e.g. 96
  co2EmissionsKg: number;
  co2DifferencePct: number; // e.g. -14% vs avg
}

export interface Seat {
  id: string;
  number: string;
  row: number;
  column: string;
  cabinClass: CabinClass;
  type: 'window' | 'middle' | 'aisle';
  isAvailable: boolean;
  isExitRow?: boolean;
  extraLegroom?: boolean;
  price: number;
}

export interface Passenger {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: 'Mr' | 'Ms' | 'Mrs' | 'Dr' | 'Prof';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  frequentFlyerNumber?: string;
  mealPreference: string;
  specialAssistance?: string;
  selectedSeatOutbound?: Seat;
  selectedSeatReturn?: Seat;
}

export interface BookingAddons {
  extraBaggageCount: number; // $45 each
  travelShieldInsurance: boolean; // $32 per passenger
  priorityBoarding: boolean; // $18 per passenger
  executiveLoungeAccess: boolean; // $55 per passenger
  carbonNeutralOffset: boolean; // $8 per passenger
  inflightHighSpeedWifi: boolean; // $15 per passenger
}

export interface PriceBreakdown {
  baseFare: number;
  taxesAndFees: number;
  passengerCount: number;
  cabinClassFareTotal: number;
  fareTierTotal: number;
  seatSelectionFee: number;
  baggageFee: number;
  addonsFee: number;
  pointsDiscount: number;
  pointsUsed: number;
  netTotal: number;
  pointsEarned: number;
}

export type BookingStatus = 'confirmed' | 'checked_in' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  pnr: string;
  userId?: string;
  bookingDate: string;
  status: BookingStatus;
  tripType: TripType;
  cabinClass: CabinClass;
  fareTier: FareTierKey;
  outboundFlight: Flight;
  returnFlight?: Flight;
  passengers: Passenger[];
  addons: BookingAddons;
  pricing: PriceBreakdown;
  paymentMethod: 'credit_card' | 'apple_pay' | 'google_pay' | 'points_plus_cash';
  paymentCardLast4?: string;
  contactEmail: string;
  contactPhone: string;
  gateOutbound?: string;
  terminalOutbound?: string;
  boardingTimeOutbound?: string;
}

export interface PointsTransaction {
  id: string;
  date: string;
  description: string;
  points: number; // positive for earned, negative for redeemed
  type: 'earned' | 'redeemed' | 'bonus' | 'tier_adjustment';
  pnrRef?: string;
  balanceAfter: number;
}

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberId: string;
  tier: 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  tierMiles: number;
  tierMilesTarget: number;
  pointsBalance: number;
  lifetimePointsEarned: number;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  homeAirport: string;
  preferredMeal: string;
  savedPassId: string;
  memberSince: string;
  transactions: PointsTransaction[];
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'AED' | 'PKR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rateFromUSD: number;
  label: string;
}

export interface FlightSearchParams {
  tripType: TripType;
  originAirport: Airport;
  destinationAirport: Airport;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: CabinClass;
  directOnly: boolean;
}

export interface FilterState {
  maxPrice: number;
  stops: string[]; // 'direct', '1_stop', '2_stops'
  airlines: string[];
  departureTimeSlots: string[]; // 'morning', 'afternoon', 'evening', 'night'
  arrivalTimeSlots: string[];
  cabinAmenities: string[];
  sortBy: 'cheapest' | 'fastest' | 'best_value' | 'earliest_departure' | 'latest_departure';
}
