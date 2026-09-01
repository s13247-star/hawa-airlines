import React, { useState } from 'react';
import { Plane, Search, Clock, MapPin, ShieldCheck, Wifi, Radio, AlertCircle, ArrowRight } from 'lucide-react';
import { AIRPORTS } from '../data/airports';
import { formatDuration } from '../utils/formatters';

export const FlightStatusRadar: React.FC = () => {
  const [searchMode, setSearchMode] = useState<'flight_num' | 'route'>('flight_num');
  const [flightNumberQuery, setFlightNumberQuery] = useState('HW-302');
  const [originCode, setOriginCode] = useState('DXB');
  const [destCode, setDestCode] = useState('LHR');

  const radarFlights = [
    {
      flightNumber: 'HW-302',
      airline: 'Hawa Airways Flagship',
      from: { code: 'DXB', city: 'Dubai', time: '08:30', terminal: 'T3', gate: 'B18' },
      to: { code: 'LHR', city: 'London Heathrow', time: '13:15', terminal: 'T2', gate: 'A12' },
      status: 'On-Time • Boarding at Gate B18',
      statusCode: 'boarding',
      aircraft: 'Airbus A350-900 Ultra (Reg: A6-HWA)',
      altitude: 'Gate Assigned',
      speed: '0 km/h',
      baggageBelt: 'Carousel 8',
      progressPct: 15,
    },
    {
      flightNumber: 'HW-708',
      airline: 'Hawa Airways',
      from: { code: 'DXB', city: 'Dubai', time: '13:20', terminal: 'T3', gate: 'B24' },
      to: { code: 'LHR', city: 'London Heathrow', time: '18:05', terminal: 'T2', gate: 'B04' },
      status: 'Scheduled • Gate opens at 12:20',
      statusCode: 'scheduled',
      aircraft: 'Boeing 787-9 Dreamliner (Reg: A6-HWB)',
      altitude: 'Pre-flight Check',
      speed: '0 km/h',
      baggageBelt: 'Carousel 4',
      progressPct: 0,
    },
    {
      flightNumber: 'HW-610',
      airline: 'Hawa Airways',
      from: { code: 'DXB', city: 'Dubai', time: '21:15', terminal: 'T3', gate: 'A04' },
      to: { code: 'SIN', city: 'Singapore Changi', time: '08:45', terminal: 'T1', gate: 'C14' },
      status: 'Airborne • Cruising at 39,000 ft',
      statusCode: 'in_air',
      aircraft: 'Boeing 787-9 Dreamliner (Reg: A6-HWC)',
      altitude: '39,000 ft (11,887 m)',
      speed: '890 km/h',
      baggageBelt: 'Belt 12',
      progressPct: 65,
    },
    {
      flightNumber: 'EK-029',
      airline: 'Emirates Partner',
      from: { code: 'DXB', city: 'Dubai', time: '09:40', terminal: 'T3', gate: 'A08' },
      to: { code: 'LHR', city: 'London Heathrow', time: '14:25', terminal: 'T3', gate: 'C22' },
      status: 'Departed • En Route',
      statusCode: 'in_air',
      aircraft: 'Airbus A380-800 Superjumbo',
      altitude: '37,500 ft',
      speed: '910 km/h',
      baggageBelt: 'Belt 6',
      progressPct: 40,
    },
  ];

  const filteredFlight = radarFlights.find((f) =>
    searchMode === 'flight_num'
      ? f.flightNumber.toLowerCase().includes(flightNumberQuery.trim().toLowerCase())
      : f.from.code === originCode && f.to.code === destCode
  ) || radarFlights[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Cabinet_Grotesk']">
              Live Flight Radar & Airport Operations
            </h2>
            <p className="text-xs text-slate-500">
              Track live departure gates, terminal assignments, aircraft altitude, and baggage carousels.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSearchMode('flight_num')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                searchMode === 'flight_num'
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Flight #
            </button>
            <button
              type="button"
              onClick={() => setSearchMode('route')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                searchMode === 'route'
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Route
            </button>
          </div>

          {searchMode === 'flight_num' ? (
            <div className="flex-1 relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={flightNumberQuery}
                onChange={(e) => setFlightNumberQuery(e.target.value)}
                placeholder="Enter Flight # (e.g. HW-302, HW-708, HW-610)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase font-mono focus:border-sky-500 focus:bg-white focus:outline-none"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <select
                value={originCode}
                onChange={(e) => setOriginCode(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:bg-white"
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} - {a.city}
                  </option>
                ))}
              </select>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <select
                value={destCode}
                onChange={(e) => setDestCode(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:bg-white"
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} - {a.city}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Active Flight Radar Card */}
      {filteredFlight && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black font-mono text-sky-700">
                  {filteredFlight.flightNumber}
                </span>
                <span className="text-xs text-slate-700 font-semibold">{filteredFlight.airline}</span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{filteredFlight.aircraft}</p>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>{filteredFlight.status}</span>
            </div>
          </div>

          {/* Route Display */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Origin */}
            <div className="md:col-span-4">
              <div className="text-4xl font-black font-mono text-slate-900">
                {filteredFlight.from.code}
              </div>
              <div className="text-sm font-bold text-sky-700">{filteredFlight.from.city}</div>
              <div className="text-xs text-slate-500 mt-1">
                Scheduled: <strong className="text-slate-900 font-mono">{filteredFlight.from.time}</strong>
              </div>
              <div className="mt-2 text-xs text-slate-600 space-x-2 font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {filteredFlight.from.terminal}
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  Gate {filteredFlight.from.gate}
                </span>
              </div>
            </div>

            {/* Flight In-Air Progress Track */}
            <div className="md:col-span-4 text-center space-y-2">
              <div className="text-xs text-slate-500 font-mono flex items-center justify-center gap-1">
                <Plane className="w-3.5 h-3.5 text-sky-600 rotate-45" />
                <span>Altitude: {filteredFlight.altitude}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.max(10, filteredFlight.progressPct)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Speed: {filteredFlight.speed}
              </div>
            </div>

            {/* Destination */}
            <div className="md:col-span-4 text-left md:text-right">
              <div className="text-4xl font-black font-mono text-slate-900">
                {filteredFlight.to.code}
              </div>
              <div className="text-sm font-bold text-sky-700">{filteredFlight.to.city}</div>
              <div className="text-xs text-slate-500 mt-1">
                Estimated: <strong className="text-slate-900 font-mono">{filteredFlight.to.time}</strong>
              </div>
              <div className="mt-2 text-xs text-slate-600 space-x-2 font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {filteredFlight.to.terminal}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {filteredFlight.baggageBelt}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
