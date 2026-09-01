import React, { useState, useRef, useEffect } from 'react';
import {
  Plane,
  Calendar,
  Users,
  ArrowRightLeft,
  Search,
  Check,
  Sparkles,
  MapPin,
  ChevronDown,
  PlaneTakeoff,
  PlaneLanding,
  ShieldAlert,
} from 'lucide-react';
import { Airport, CabinClass, FlightSearchParams, TripType } from '../types';
import { AIRPORTS } from '../data/airports';

interface FlightSearchFormProps {
  searchParams?: FlightSearchParams;
  initialParams?: FlightSearchParams;
  onSearch: (params: FlightSearchParams) => void;
  isSearching?: boolean;
}

const DEFAULT_PARAMS: FlightSearchParams = {
  tripType: 'one_way',
  originAirport: AIRPORTS[0],
  destinationAirport: AIRPORTS[1],
  departureDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: 'economy',
  directOnly: false,
};

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  searchParams,
  initialParams,
  onSearch,
  isSearching = false,
}) => {
  const activeParams = initialParams || searchParams || DEFAULT_PARAMS;

  const [tripType, setTripType] = useState<TripType>(activeParams.tripType || 'one_way');
  const [origin, setOrigin] = useState<Airport>(activeParams.originAirport || AIRPORTS[0]);
  const [destination, setDestination] = useState<Airport>(activeParams.destinationAirport || AIRPORTS[1]);
  const [departureDate, setDepartureDate] = useState<string>(activeParams.departureDate || new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState<string>(activeParams.returnDate || '2026-09-25');
  const [cabinClass, setCabinClass] = useState<CabinClass>(activeParams.cabinClass || 'economy');
  const [passengers, setPassengers] = useState(activeParams.passengers || { adults: 1, children: 0, infants: 0 });
  const [directOnly, setDirectOnly] = useState(activeParams.directOnly || false);

  // Sync state if props change (e.g. clicking quick routes)
  useEffect(() => {
    const updated = initialParams || searchParams;
    if (updated) {
      if (updated.tripType) setTripType(updated.tripType);
      if (updated.originAirport) setOrigin(updated.originAirport);
      if (updated.destinationAirport) setDestination(updated.destinationAirport);
      if (updated.departureDate) setDepartureDate(updated.departureDate);
      if (updated.returnDate) setReturnDate(updated.returnDate);
      if (updated.cabinClass) setCabinClass(updated.cabinClass);
      if (updated.passengers) setPassengers(updated.passengers);
      if (updated.directOnly !== undefined) setDirectOnly(updated.directOnly);
    }
  }, [initialParams, searchParams]);

  // Dropdown states
  const [showOriginModal, setShowOriginModal] = useState(false);
  const [showDestModal, setShowDestModal] = useState(false);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  const passengerRef = useRef<HTMLDivElement>(null);

  // Close passenger dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (passengerRef.current && !passengerRef.current.contains(event.target as Node)) {
        setShowPassengerModal(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      tripType,
      originAirport: origin,
      destinationAirport: destination,
      departureDate,
      returnDate: tripType === 'round_trip' ? returnDate : undefined,
      passengers,
      cabinClass,
      directOnly,
    });
  };

  const filteredOriginAirports = AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(originSearch.toLowerCase()) ||
      a.city.toLowerCase().includes(originSearch.toLowerCase()) ||
      a.name.toLowerCase().includes(originSearch.toLowerCase()) ||
      a.country.toLowerCase().includes(originSearch.toLowerCase())
  );

  const filteredDestAirports = AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(destSearch.toLowerCase()) ||
      a.city.toLowerCase().includes(destSearch.toLowerCase()) ||
      a.name.toLowerCase().includes(destSearch.toLowerCase()) ||
      a.country.toLowerCase().includes(destSearch.toLowerCase())
  );

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  const quickRoutes = [
    { from: 'DXB', to: 'LHR', label: 'Dubai → London' },
    { from: 'DXB', to: 'JFK', label: 'Dubai → New York' },
    { from: 'SIN', to: 'HND', label: 'Singapore → Tokyo' },
    { from: 'KHI', to: 'DXB', label: 'Karachi → Dubai' },
    { from: 'DOH', to: 'CDG', label: 'Doha → Paris' },
    { from: 'IST', to: 'LHR', label: 'Istanbul → London' },
  ];

  const setQuickRoute = (fromCode: string, toCode: string) => {
    const foundOrigin = AIRPORTS.find((a) => a.code === fromCode);
    const foundDest = AIRPORTS.find((a) => a.code === toCode);
    if (foundOrigin) setOrigin(foundOrigin);
    if (foundDest) setDestination(foundDest);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm relative">
      {/* Top tabs & Class selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
        {/* Trip Type Radios */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setTripType('round_trip')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tripType === 'round_trip'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Round Trip
          </button>
          <button
            type="button"
            onClick={() => setTripType('one_way')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tripType === 'one_way'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            One Way
          </button>
          <button
            type="button"
            onClick={() => setTripType('multi_city')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tripType === 'multi_city'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Multi-City
          </button>
        </div>

        {/* Quick Direct checkbox */}
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer hover:text-slate-900 select-none font-medium">
            <input
              type="checkbox"
              checked={directOnly}
              onChange={(e) => setDirectOnly(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 bg-white border-slate-300 focus:ring-sky-500"
            />
            <span>Direct Flights Only</span>
          </label>
        </div>
      </div>

      {/* Main Search Form */}
      <form onSubmit={handleSearchSubmit} className="mt-5 space-y-4">
        {/* Row 1: Origin & Destination with Swap button */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 relative">
          {/* Origin */}
          <div className="lg:col-span-6 relative">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <PlaneTakeoff className="w-3.5 h-3.5 text-sky-600" />
              From / Departure Airport
            </label>
            <button
              type="button"
              id="origin-airport-selector"
              onClick={() => {
                setShowOriginModal(!showOriginModal);
                setShowDestModal(false);
                setShowPassengerModal(false);
              }}
              className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-sky-300 transition cursor-pointer group flex items-center justify-between shadow-xs"
            >
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-sky-700 tracking-tight">
                    {origin.code}
                  </span>
                  <span className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition">
                    {origin.city}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate max-w-[280px]">
                  {origin.name} • {origin.country}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition" />
            </button>

            {/* Origin Airport Dropdown Modal */}
            {showOriginModal && (
              <div className="absolute top-full left-0 mt-2 w-full sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search city, country or IATA code..."
                    value={originSearch}
                    onChange={(e) => setOriginSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-slate-100">
                  {filteredOriginAirports.map((airport) => (
                    <button
                      key={airport.code}
                      type="button"
                      onClick={() => {
                        setOrigin(airport);
                        setShowOriginModal(false);
                        setOriginSearch('');
                      }}
                      className={`w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer transition ${
                        origin.code === airport.code ? 'bg-sky-50 border border-sky-200' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sky-700 text-xs px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200">
                            {airport.code}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{airport.city}</span>
                          <span className="text-xs text-slate-500">({airport.country})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{airport.name}</p>
                      </div>
                      {origin.code === airport.code && <Check className="w-4 h-4 text-sky-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Swap Button (floating in middle on large screen) */}
          <div className="lg:col-span-0 flex items-center justify-center lg:absolute lg:left-1/2 lg:top-10 lg:-translate-x-1/2 z-10 my-1 lg:my-0">
            <button
              type="button"
              id="swap-airports-btn"
              onClick={handleSwapAirports}
              title="Swap Origin and Destination"
              className="w-10 h-10 rounded-full bg-white hover:bg-sky-600 hover:text-white text-slate-700 border border-slate-200 shadow-sm flex items-center justify-center transition-all duration-300 hover:rotate-180 cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="lg:col-span-6 relative">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <PlaneLanding className="w-3.5 h-3.5 text-sky-600" />
              To / Arrival Destination
            </label>
            <button
              type="button"
              id="destination-airport-selector"
              onClick={() => {
                setShowDestModal(!showDestModal);
                setShowOriginModal(false);
                setShowPassengerModal(false);
              }}
              className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-sky-300 transition cursor-pointer group flex items-center justify-between shadow-xs"
            >
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-sky-700 tracking-tight">
                    {destination.code}
                  </span>
                  <span className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition">
                    {destination.city}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate max-w-[280px]">
                  {destination.name} • {destination.country}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition" />
            </button>

            {/* Destination Airport Dropdown Modal */}
            {showDestModal && (
              <div className="absolute top-full right-0 mt-2 w-full sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search destination city or airport..."
                    value={destSearch}
                    onChange={(e) => setDestSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-slate-100">
                  {filteredDestAirports.map((airport) => (
                    <button
                      key={airport.code}
                      type="button"
                      onClick={() => {
                        setDestination(airport);
                        setShowDestModal(false);
                        setDestSearch('');
                      }}
                      className={`w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer transition ${
                        destination.code === airport.code
                          ? 'bg-sky-50 border border-sky-200'
                          : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sky-700 text-xs px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200">
                            {airport.code}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{airport.city}</span>
                          <span className="text-xs text-slate-500">({airport.country})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{airport.name}</p>
                      </div>
                      {destination.code === airport.code && <Check className="w-4 h-4 text-sky-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Dates, Passengers & Cabin Class */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Departure Date */}
          <div className={tripType === 'round_trip' ? 'md:col-span-3' : 'md:col-span-5'}>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              Departure Date
            </label>
            <input
              type="date"
              id="departure-date-input"
              value={departureDate}
              min="2026-09-01"
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:border-sky-600 focus:bg-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* Return Date (if Round Trip) */}
          {tripType === 'round_trip' && (
            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                Return Date
              </label>
              <input
                type="date"
                id="return-date-input"
                value={returnDate}
                min={departureDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:border-sky-600 focus:bg-white focus:outline-none cursor-pointer"
              />
            </div>
          )}

          {/* Passengers & Cabin Class */}
          <div
            ref={passengerRef}
            className={`relative ${tripType === 'round_trip' ? 'md:col-span-6' : 'md:col-span-7'}`}
          >
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-600" />
              Travelers & Cabin Class
            </label>
            <button
              type="button"
              id="travelers-cabin-selector"
              onClick={() => {
                setShowPassengerModal(!showPassengerModal);
                setShowOriginModal(false);
                setShowDestModal(false);
              }}
              className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-sky-300 transition cursor-pointer flex items-center justify-between shadow-xs"
            >
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>
                    {totalPassengers} {totalPassengers === 1 ? 'Passenger' : 'Passengers'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 uppercase font-semibold">
                    {cabinClass.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {passengers.adults} Adults
                  {passengers.children > 0 ? `, ${passengers.children} Kids` : ''}
                  {passengers.infants > 0 ? `, ${passengers.infants} Infants` : ''}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Travelers & Cabin Class popover */}
            {showPassengerModal && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Travelers
                </h4>

                {/* Adults */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Adults</div>
                    <div className="text-[11px] text-slate-500">Age 12+</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={passengers.adults <= 1}
                      onClick={() =>
                        setPassengers({ ...passengers, adults: Math.max(1, passengers.adults - 1) })
                      }
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-bold w-4 text-center text-slate-900">
                      {passengers.adults}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPassengers({ ...passengers, adults: Math.min(9, passengers.adults + 1) })
                      }
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Children</div>
                    <div className="text-[11px] text-slate-500">Age 2-11</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={passengers.children <= 0}
                      onClick={() =>
                        setPassengers({
                          ...passengers,
                          children: Math.max(0, passengers.children - 1),
                        })
                      }
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-bold w-4 text-center text-slate-900">
                      {passengers.children}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPassengers({
                          ...passengers,
                          children: Math.min(6, passengers.children + 1),
                        })
                      }
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Infants</div>
                    <div className="text-[11px] text-slate-500">Under 2 (on lap)</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={passengers.infants <= 0}
                      onClick={() =>
                        setPassengers({
                          ...passengers,
                          infants: Math.max(0, passengers.infants - 1),
                        })
                      }
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-bold w-4 text-center text-slate-900">
                      {passengers.infants}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPassengers({
                          ...passengers,
                          infants: Math.min(2, passengers.infants + 1),
                        })
                      }
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Cabin Class Selection */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Cabin Class
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {(
                      [
                        { key: 'economy', label: 'Economy', badge: 'Best Value' },
                        { key: 'premium_economy', label: 'Premium Eco', badge: 'Extra Legroom' },
                        { key: 'business', label: 'Business', badge: 'Lie-Flat Suite' },
                        { key: 'first', label: 'First Class', badge: 'Private Suite' },
                      ] as const
                    ).map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setCabinClass(c.key)}
                        className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                          cabinClass === c.key
                            ? 'bg-sky-50 border-sky-600 text-sky-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>{c.label}</div>
                        <div className="text-[9px] text-sky-600 font-normal">{c.badge}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassengerModal(false)}
                  className="mt-4 w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit & Quick Inspirations */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Quick Route Tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="text-[11px] font-semibold text-slate-500">Popular:</span>
            {quickRoutes.map((qr) => (
              <button
                key={qr.label}
                type="button"
                onClick={() => setQuickRoute(qr.from, qr.to)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200 text-slate-700 text-[11px] transition cursor-pointer font-medium"
              >
                {qr.label}
              </button>
            ))}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            id="search-flights-submit-btn"
            disabled={isSearching}
            className="w-full sm:w-auto px-8 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm tracking-wide transition cursor-pointer"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching Flights...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-white" />
                <span>Find Available Flights</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
