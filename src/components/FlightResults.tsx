import React, { useState, useMemo } from 'react';
import {
  Flight,
  FlightSearchParams,
  CurrencyCode,
  CabinClass,
  FareTierKey,
  FareTierOption,
} from '../types';
import { FARE_TIERS } from '../data/flights';
import { formatCurrency, formatDuration, formatDate } from '../utils/formatters';
import {
  Clock,
  Plane,
  Wifi,
  Zap,
  Utensils,
  Tv,
  Bed,
  Check,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Leaf,
  ShieldCheck,
  Luggage,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  X,
  Edit3,
} from 'lucide-react';

interface FlightResultsProps {
  flights: Flight[];
  searchParams: FlightSearchParams;
  selectedCabin?: CabinClass;
  currency: CurrencyCode;
  onSelectFlight: (flight: Flight, fareTier: FareTierKey, cabin?: CabinClass) => void;
  onDateChange?: (newDate: string) => void;
  onBackToSearch?: () => void;
}

export const FlightResults: React.FC<FlightResultsProps> = ({
  flights,
  searchParams,
  selectedCabin,
  currency,
  onSelectFlight,
  onDateChange,
  onBackToSearch,
}) => {
  // Sort state
  const [sortBy, setSortBy] = useState<
    'cheapest' | 'fastest' | 'best_value' | 'earliest' | 'latest'
  >('best_value');

  // Filter states
  const [selectedStops, setSelectedStops] = useState<number[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<string[]>([]);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(5000);
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);

  // Selected tier per flight card
  const [selectedTiers, setSelectedTiers] = useState<Record<string, FareTierKey>>({});

  const cabinClass = selectedCabin || searchParams?.cabinClass || 'economy';

  // Extract unique airlines from flights
  const availableAirlines = useMemo(() => {
    const map = new Map();
    flights.forEach((f) => map.set(f.airline.code, f.airline));
    return Array.from(map.values());
  }, [flights]);

  // 7-day price strip generator
  const dateStrip = useMemo(() => {
    const dates = [];
    const baseDate = new Date(searchParams.departureDate);
    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yr}-${mo}-${day}`;

      // Calculate pseudo price for that day
      const minPrice = flights.length > 0 ? flights[0].basePrices[cabinClass] : 420;
      const dayVariance = (i % 2 === 0 ? 0 : i > 0 ? 35 : -25) + (i === 0 ? 0 : 15);
      const estPrice = Math.max(180, minPrice + dayVariance);

      dates.push({
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: estPrice,
        isCurrent: dateStr === searchParams.departureDate,
      });
    }
    return dates;
  }, [searchParams.departureDate, flights, cabinClass]);

  // Filter & Sort Logic
  const filteredAndSortedFlights = useMemo(() => {
    let result = flights.filter((f) => {
      // Stops filter
      if (selectedStops.length > 0 && !selectedStops.includes(f.stops)) {
        return false;
      }
      // Airlines filter
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(f.airline.code)) {
        return false;
      }
      // Price filter
      const price = f.basePrices[cabinClass];
      if (price > maxPriceFilter) {
        return false;
      }
      // Time of day filter
      if (timeOfDay.length > 0) {
        const hour = parseInt(f.departureTime.split(':')[0], 10);
        const matchesTime = timeOfDay.some((slot) => {
          if (slot === 'morning' && hour >= 6 && hour < 12) return true;
          if (slot === 'afternoon' && hour >= 12 && hour < 18) return true;
          if (slot === 'evening' && hour >= 18 && hour < 24) return true;
          if (slot === 'night' && (hour >= 0 && hour < 6)) return true;
          return false;
        });
        if (!matchesTime) return false;
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      const priceA = a.basePrices[cabinClass];
      const priceB = b.basePrices[cabinClass];

      if (sortBy === 'cheapest') return priceA - priceB;
      if (sortBy === 'fastest') return a.durationMinutes - b.durationMinutes;
      if (sortBy === 'earliest') return a.departureTime.localeCompare(b.departureTime);
      if (sortBy === 'latest') return b.departureTime.localeCompare(a.departureTime);
      if (sortBy === 'best_value') {
        // Score = Price (60%) + Duration (30%) - On-time bonus (10%)
        const scoreA = priceA * 0.6 + a.durationMinutes * 0.3 - (a.onTimePerformance * 2);
        const scoreB = priceB * 0.6 + b.durationMinutes * 0.3 - (b.onTimePerformance * 2);
        return scoreA - scoreB;
      }
      return 0;
    });

    return result;
  }, [flights, cabinClass, selectedStops, selectedAirlines, maxPriceFilter, timeOfDay, sortBy]);

  const toggleStopFilter = (stop: number) => {
    if (selectedStops.includes(stop)) {
      setSelectedStops(selectedStops.filter((s) => s !== stop));
    } else {
      setSelectedStops([...selectedStops, stop]);
    }
  };

  const toggleAirlineFilter = (code: string) => {
    if (selectedAirlines.includes(code)) {
      setSelectedAirlines(selectedAirlines.filter((a) => a !== code));
    } else {
      setSelectedAirlines([...selectedAirlines, code]);
    }
  };

  const toggleTimeFilter = (slot: string) => {
    if (timeOfDay.includes(slot)) {
      setTimeOfDay(timeOfDay.filter((t) => t !== slot));
    } else {
      setTimeOfDay([...timeOfDay, slot]);
    }
  };

  const resetFilters = () => {
    setSelectedStops([]);
    setSelectedAirlines([]);
    setTimeOfDay([]);
    setMaxPriceFilter(5000);
    setSortBy('best_value');
  };

  return (
    <div className="space-y-6">
      {/* Top Search Navigation Bar & Breadcrumb with BACK button */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            id="back-to-search-btn"
            type="button"
            onClick={onBackToSearch}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back to Search</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <span>{searchParams.originAirport.city} ({searchParams.originAirport.code})</span>
              <ArrowRight className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{searchParams.destinationAirport.city} ({searchParams.destinationAirport.code})</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{formatDate(searchParams.departureDate)}</span>
              <span>•</span>
              <span className="capitalize">{cabinClass.replace('_', ' ')} Class</span>
              <span>•</span>
              <span>{searchParams.passengers.adults + searchParams.passengers.children + (searchParams.passengers.infants || 0)} Traveler(s)</span>
            </div>
          </div>
        </div>

        <button
          id="modify-search-btn"
          type="button"
          onClick={onBackToSearch}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 transition cursor-pointer shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-sky-600" />
          <span>Modify Origin, Destination & Dates</span>
        </button>
      </div>

      {/* 7-Day Flexible Date Matrix Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 overflow-x-auto shadow-sm">
        <div className="flex items-center gap-2 min-w-max">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-r border-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Lowest Fare Matrix:</span>
          </div>
          {dateStrip.map((item) => (
            <button
              key={item.dateStr}
              type="button"
              onClick={() => onDateChange && onDateChange(item.dateStr)}
              className={`px-4 py-2 rounded-xl text-left transition cursor-pointer flex flex-col items-center ${
                item.isCurrent
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span className={`text-[10px] uppercase font-semibold ${item.isCurrent ? 'text-white' : 'text-slate-500'}`}>
                {item.dayName}, {item.formatted}
              </span>
              <span className={`text-xs font-black font-mono mt-0.5 ${item.isCurrent ? 'text-white' : 'text-sky-700'}`}>
                {formatCurrency(item.price, currency, false)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 sticky top-20 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Stops Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Stops
              </label>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedStops.includes(0)}
                      onChange={() => toggleStopFilter(0)}
                      className="rounded text-sky-600 bg-white border-slate-300 focus:ring-sky-500"
                    />
                    <span className="text-slate-800 font-medium">Direct / Non-stop</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {flights.filter((f) => f.stops === 0).length}
                  </span>
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedStops.includes(1)}
                      onChange={() => toggleStopFilter(1)}
                      className="rounded text-sky-600 bg-white border-slate-300 focus:ring-sky-500"
                    />
                    <span className="text-slate-800 font-medium">1 Stop</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {flights.filter((f) => f.stops === 1).length}
                  </span>
                </label>
              </div>
            </div>

            {/* Airlines Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Airlines
              </label>
              <div className="space-y-1.5 text-xs">
                {availableAirlines.map((airline) => (
                  <label
                    key={airline.code}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedAirlines.includes(airline.code)}
                        onChange={() => toggleAirlineFilter(airline.code)}
                        className="rounded text-sky-600 bg-white border-slate-300 focus:ring-sky-500"
                      />
                      <span className="text-slate-800 font-medium">{airline.name}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-semibold">
                      {airline.code}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Departure Time Slots */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Departure Time
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'morning', label: 'Morning', time: '06:00 - 12:00' },
                  { id: 'afternoon', label: 'Afternoon', time: '12:00 - 18:00' },
                  { id: 'evening', label: 'Evening', time: '18:00 - 24:00' },
                  { id: 'night', label: 'Night', time: '00:00 - 06:00' },
                ].map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => toggleTimeFilter(slot.id)}
                    className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                      timeOfDay.includes(slot.id)
                        ? 'bg-sky-50 border-sky-600 text-sky-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="text-xs font-semibold">{slot.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{slot.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-500">
                  Max Budget
                </label>
                <span className="text-sky-700 font-mono font-bold">
                  {formatCurrency(maxPriceFilter, currency)}
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="50"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>
          </div>
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-9 space-y-4">
          {/* Header & Sorting Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{searchParams.originAirport.city}</span>
                <ArrowRight className="w-4 h-4 text-sky-600" />
                <span>{searchParams.destinationAirport.city}</span>
                <span className="text-xs font-normal text-slate-500">
                  ({filteredAndSortedFlights.length} Flights Available)
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {formatDate(searchParams.departureDate)} • {searchParams.passengers.adults + searchParams.passengers.children} Travelers •{' '}
                <span className="capitalize font-semibold text-slate-700">{cabinClass.replace('_', ' ')} Class</span>
              </p>
            </div>

            {/* Sorting Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setSortBy('best_value')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
                  sortBy === 'best_value'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Best Value ⭐
              </button>
              <button
                type="button"
                onClick={() => setSortBy('cheapest')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
                  sortBy === 'cheapest'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cheapest
              </button>
              <button
                type="button"
                onClick={() => setSortBy('fastest')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
                  sortBy === 'fastest'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fastest
              </button>
              <button
                type="button"
                onClick={() => setSortBy('earliest')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
                  sortBy === 'earliest'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Earliest
              </button>
            </div>
          </div>

          {/* Flight Card List */}
          {filteredAndSortedFlights.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-slate-900 mb-1">No Flights Match Your Filters</h4>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
                Try expanding your budget slider, including 1-stop flights, or removing airline restrictions.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 bg-sky-600 text-white font-bold rounded-xl text-xs hover:bg-sky-500 cursor-pointer shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedFlights.map((flight) => {
                const basePrice = flight.basePrices[cabinClass];
                const isExpanded = expandedFlightId === flight.id;
                const isDetailsExpanded = expandedDetailsId === flight.id;
                const activeTier = selectedTiers[flight.id] || 'standard';

                return (
                  <div
                    key={flight.id}
                    id={`flight-card-${flight.id}`}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden shadow-sm transition duration-200"
                  >
                    {/* Flagship ribbon if Hawa Airways */}
                    {flight.airline.code === 'HW' && (
                      <div className="bg-sky-50 px-4 py-1.5 border-b border-sky-100 text-[11px] text-sky-800 font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                          Hawa Flagship Experience • Complimentary High-Speed SkyWiFi & Halal Dining
                        </span>
                        <span className="text-amber-700 font-mono font-bold bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                          2x Gold SkyClub Miles
                        </span>
                      </div>
                    )}

                    {/* Flight Core Card Details */}
                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        {/* Airline & Aircraft info */}
                        <div className="lg:col-span-3 flex lg:flex-col items-center lg:items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs"
                              style={{ backgroundColor: flight.airline.logoColor }}
                            >
                              {flight.airline.code}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-900">{flight.airline.name}</h4>
                              <p className="text-xs text-slate-500 font-mono">{flight.flightNumber}</p>
                            </div>
                          </div>
                          <div className="text-left text-[11px] text-slate-500 flex items-center gap-2">
                            <span>{flight.aircraft.model}</span>
                          </div>
                        </div>

                        {/* Route Timeline (Times, Duration, Stops) */}
                        <div className="lg:col-span-6">
                          <div className="flex items-center justify-between gap-4">
                            {/* Departure */}
                            <div className="text-left">
                              <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                                {flight.departureTime}
                              </div>
                              <div className="text-sm font-bold text-sky-700">
                                {flight.departureAirport.code}
                              </div>
                              <div className="text-[11px] text-slate-500">{flight.departureAirport.city}</div>
                            </div>

                            {/* Center Duration Bar */}
                            <div className="flex-1 flex flex-col items-center px-2">
                              <span className="text-[11px] font-mono font-semibold text-slate-500 mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {formatDuration(flight.durationMinutes)}
                              </span>

                              {/* Graphic Flight Route Line */}
                              <div className="w-full relative flex items-center justify-center">
                                <div className="w-full h-0.5 bg-slate-200 rounded-full" />
                                <Plane className="w-3.5 h-3.5 text-sky-600 absolute rotate-90" />
                              </div>

                              {/* Stops / Direct indicator */}
                              <div className="mt-1">
                                {flight.stops === 0 ? (
                                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                                    Direct Non-stop
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                                    1 Stop ({flight.stopDetails?.[0]?.airport.code})
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Arrival */}
                            <div className="text-right">
                              <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                                {flight.arrivalTime}
                              </div>
                              <div className="text-sm font-bold text-sky-700">
                                {flight.arrivalAirport.code}
                              </div>
                              <div className="text-[11px] text-slate-500">{flight.arrivalAirport.city}</div>
                            </div>
                          </div>
                        </div>

                        {/* Price & Select CTA */}
                        <div className="lg:col-span-3 lg:border-l lg:border-slate-100 lg:pl-6 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2">
                          <div className="text-left lg:text-right">
                            <span className="text-[10px] uppercase font-semibold text-slate-500">
                              From per traveler
                            </span>
                            <div className="text-2xl font-black font-mono text-slate-900">
                              {formatCurrency(basePrice, currency)}
                            </div>
                            <div className="text-[10px] text-amber-700 font-mono font-medium flex items-center lg:justify-end gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                              <span>Earn +{Math.round(basePrice * 2 * 1.5).toLocaleString()} pts</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedFlightId(isExpanded ? null : flight.id)}
                              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                                isExpanded
                                  ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                  : 'bg-sky-600 hover:bg-sky-500 text-white'
                              }`}
                            >
                              <span>{isExpanded ? 'Close Fares' : 'Select Flight'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Flight Micro Highlights: Seats Left, Amenities & Details toggle */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Seat count urgency badge */}
                          {flight.availableSeats[cabinClass] <= 5 && (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              Only {flight.availableSeats[cabinClass]} seats left at this fare
                            </span>
                          )}

                          {/* On Time Rate */}
                          <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            {flight.onTimePerformance}% On-Time Rating
                          </span>

                          {/* CO2 Emissions */}
                          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                            {flight.co2DifferencePct}% CO₂ Emissions
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Amenities icons */}
                          <div className="hidden sm:flex items-center gap-2 text-slate-500">
                            {flight.amenities.wifi && <Wifi className="w-3.5 h-3.5 text-sky-600" title="High-speed WiFi" />}
                            {flight.amenities.powerOutlets && <Zap className="w-3.5 h-3.5 text-amber-500" title="In-seat AC & USB Power" />}
                            {flight.amenities.inFlightMeal && <Utensils className="w-3.5 h-3.5 text-slate-500" title="Gourmet Dining" />}
                            {flight.amenities.entertainmentScreen && <Tv className="w-3.5 h-3.5 text-slate-500" title="HD Screen & Live TV" />}
                            {cabinClass === 'business' || cabinClass === 'first' ? (
                              <Bed className="w-3.5 h-3.5 text-indigo-600" title="Lie-flat bed" />
                            ) : null}
                          </div>

                          {/* Flight Details expansion button */}
                          <button
                            type="button"
                            onClick={() => setExpandedDetailsId(isDetailsExpanded ? null : flight.id)}
                            className="text-xs text-sky-600 hover:text-sky-700 underline underline-offset-4 cursor-pointer font-medium"
                          >
                            {isDetailsExpanded ? 'Hide Route Details' : 'View Flight Details'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Flight Segment Details */}
                    {isDetailsExpanded && (
                      <div className="bg-slate-50 p-5 border-t border-slate-100 text-xs space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <Plane className="w-3.5 h-3.5 text-sky-600" />
                            <span>Flight Itinerary Breakdown • {flight.flightNumber}</span>
                          </h5>
                          <button
                            type="button"
                            onClick={() => setExpandedDetailsId(null)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Close Details</span>
                          </button>
                        </div>
                        <div className="space-y-4 pt-1">
                          {flight.segments.map((seg, idx) => (
                            <div key={idx} className="relative pl-6 border-l-2 border-sky-400 space-y-2">
                              <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-sky-600" />
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-sm">
                                  {seg.departureTime} • {seg.departureAirport.name} ({seg.departureAirport.code})
                                </span>
                                <span className="text-slate-500 font-mono">{seg.flightNumber}</span>
                              </div>
                              <p className="text-slate-600">
                                {seg.airline.name} • {seg.aircraft.model} • Non-stop duration: {formatDuration(seg.durationMinutes)}
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="font-bold text-slate-900 text-sm">
                                  {seg.arrivalTime} • {seg.arrivalAirport.name} ({seg.arrivalAirport.code})
                                </span>
                              </div>

                              {seg.layoverDurationMinutes && (
                                <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>
                                    Layover in {seg.arrivalAirport.city} ({seg.arrivalAirport.code}): {formatDuration(seg.layoverDurationMinutes)}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expandable 3-Tier Fare Selector */}
                    {isExpanded && (
                      <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-150">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              <span>Select Your Fare Tier for</span>
                              <span className="text-sky-700 uppercase font-mono">
                                {cabinClass.replace('_', ' ')} Class
                              </span>
                            </h4>
                            <p className="text-xs text-slate-500">
                              Compare baggage, cancellation flexibility, and SkyClub points multipliers.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(['light', 'standard', 'flex'] as FareTierKey[]).map((tierKey) => {
                            const option = FARE_TIERS[tierKey];
                            const tierPrice = Math.round(basePrice * option.priceMultiplier);
                            const isSelected = activeTier === tierKey;
                            const pointsEarned = Math.round(tierPrice * 2 * option.pointsMultiplier);

                            return (
                              <div
                                key={tierKey}
                                className={`rounded-2xl p-4 border transition flex flex-col justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-white border-sky-600 ring-2 ring-sky-500/20 shadow-md'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                                onClick={() =>
                                  setSelectedTiers({ ...selectedTiers, [flight.id]: tierKey })
                                }
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm text-slate-900">
                                      {option.name}
                                    </span>
                                    {tierKey === 'standard' && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                                        Most Popular
                                      </span>
                                    )}
                                    {tierKey === 'flex' && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                        Max Benefits
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-2xl font-black font-mono text-slate-900 mb-3">
                                    {formatCurrency(tierPrice, currency)}
                                  </div>

                                  {/* Points Earning Badge */}
                                  <div className="mb-3 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono flex items-center gap-1.5 font-medium">
                                    <Sparkles className="w-3 h-3 text-amber-600" />
                                    <span>Earn +{pointsEarned.toLocaleString()} SkyClub pts</span>
                                  </div>

                                  {/* Perks list */}
                                  <ul className="space-y-2 text-xs text-slate-600 mb-4 divide-y divide-slate-100">
                                    <li className="pt-1.5 flex items-start gap-2">
                                      <Luggage className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                                      <span>{option.checkedBaggage}</span>
                                    </li>
                                    <li className="pt-1.5 flex items-start gap-2">
                                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                      <span>{option.seatSelection}</span>
                                    </li>
                                    <li className="pt-1.5 flex items-start gap-2">
                                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                      <span>
                                        {option.refundable
                                          ? '100% Refundable'
                                          : option.changesAllowed
                                          ? 'Free date changes'
                                          : 'Non-refundable'}
                                      </span>
                                    </li>
                                  </ul>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectFlight(flight, tierKey, cabinClass);
                                  }}
                                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs ${
                                    isSelected
                                      ? 'bg-sky-600 hover:bg-sky-500 text-white'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                  }`}
                                >
                                  <span>Choose {option.name}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
