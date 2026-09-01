import React, { useState, useMemo } from 'react';
import { CabinClass, CurrencyCode, Flight, Passenger, Seat } from '../types';
import { generateSeatMap } from '../utils/seatGenerator';
import { formatCurrency } from '../utils/formatters';
import { X, Check, Sparkles, User, Info } from 'lucide-react';

interface SeatMapModalProps {
  flight: Flight;
  cabinClass: CabinClass;
  passengers?: Passenger[];
  passenger?: Passenger;
  passengerIndex?: number;
  activePassengerIndex?: number;
  currency: CurrencyCode;
  isOpen?: boolean;
  seatMap?: Seat[];
  assignedSeat?: Seat | null;
  onSelectSeat: (passengerIndexOrSeat: any, seat?: Seat) => void;
  onClose: () => void;
}

export const SeatMapModal: React.FC<SeatMapModalProps> = ({
  flight,
  cabinClass,
  passengers: propPassengers,
  passenger,
  passengerIndex,
  activePassengerIndex,
  currency,
  seatMap: propSeatMap,
  onSelectSeat,
  onClose,
}) => {
  const passengers = useMemo(() => {
    if (propPassengers && propPassengers.length > 0) return propPassengers;
    if (passenger) return [passenger];
    return [
      {
        id: 'pax_default',
        type: 'adult' as const,
        title: 'Mr' as const,
        firstName: 'Primary',
        lastName: 'Passenger',
        dateOfBirth: '1990-01-01',
        nationality: 'United Arab Emirates',
        passportNumber: 'N12345678',
        passportExpiry: '2030-01-01',
        email: 'passenger@example.com',
        phone: '+971 50 123 4567',
        mealPreference: 'Standard',
      },
    ];
  }, [propPassengers, passenger]);

  const initialIdx = activePassengerIndex ?? passengerIndex ?? 0;
  const [currentPaxIdx, setCurrentPaxIdx] = useState(initialIdx);

  // Generate seat map for this cabin class if not passed
  const generatedSeats = useMemo(() => generateSeatMap(cabinClass), [cabinClass]);
  const allSeats = propSeatMap && propSeatMap.length > 0 ? propSeatMap : generatedSeats;

  // Group seats by row
  const rowNumbers = useMemo(() => {
    const set = new Set<number>();
    allSeats.forEach((s) => set.add(s.row));
    return Array.from(set).sort((a, b) => a - b);
  }, [allSeats]);

  const currentPassenger = passengers[currentPaxIdx] || passengers[0];

  const handleSeatClick = (seat: Seat) => {
    if (!seat.isAvailable) return;
    if (typeof onSelectSeat === 'function') {
      // Support both (idx, seat) and (seat) handler shapes
      try {
        onSelectSeat(currentPaxIdx, seat);
      } catch {
        onSelectSeat(seat);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                Interactive Cabin Seat Selection
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-bold uppercase">
                {flight.aircraft.model}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Flight {flight.flightNumber} • {flight.departureAirport.code} → {flight.arrivalAirport.code} • {cabinClass.replace('_', ' ')} Cabin
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passenger Tabs (if multiple passengers) */}
        {passengers.length > 1 && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-slate-500 font-medium mr-2">Assign Seat For:</span>
            {passengers.map((pax, idx) => (
              <button
                key={pax.id}
                onClick={() => setCurrentPaxIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  currentPaxIdx === idx
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>
                  {pax.firstName} {pax.lastName}
                </span>
                {pax.selectedSeatOutbound && (
                  <span className="bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-mono text-[10px]">
                    {pax.selectedSeatOutbound.number}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Gold Member complimentary note */}
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>
              <strong>M.Isam SkyClub Gold:</strong> Complimentary Preferred & Extra Legroom seat selection included!
            </span>
          </div>
          <span className="font-mono font-bold text-amber-700">$0.00 Fee</span>
        </div>

        {/* Modal Body: Fuselage and Seat layout */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {/* Seat Map Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-white border border-slate-300 shadow-xs" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-sky-600 border border-sky-600 font-bold text-[10px] text-white flex items-center justify-center">
                ✓
              </div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-slate-200 border border-slate-300 opacity-60" />
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-amber-100 border border-amber-300 text-[9px] text-amber-800 flex items-center justify-center font-mono font-bold">
                +XL
              </div>
              <span>Extra Legroom</span>
            </div>
          </div>

          {/* Airplane Fuselage Canvas */}
          <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-t-[100px] rounded-b-[40px] p-6 shadow-sm relative">
            {/* Cockpit Nose cone indicator */}
            <div className="text-center pb-6 border-b border-slate-200">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-mono">
                <span>✈ FRONT / COCKPIT</span>
              </div>
            </div>

            {/* Grid of Rows */}
            <div className="py-6 space-y-3">
              {rowNumbers.map((rowNum) => {
                const seatsInRow = allSeats.filter((s) => s.row === rowNum);
                const isExitRow = seatsInRow.some((s) => s.isExitRow);

                return (
                  <div key={rowNum} className="flex items-center justify-between gap-2">
                    {/* Row number left */}
                    <span className="w-6 text-center font-mono text-xs font-bold text-slate-400">
                      {rowNum}
                    </span>

                    {/* Seats container */}
                    <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2">
                      {seatsInRow.map((seat, seatIdx) => {
                        const isSelectedByCurrent =
                          currentPassenger.selectedSeatOutbound?.number === seat.number;
                        const isSelectedByOther = passengers.some(
                          (p, idx) =>
                            idx !== currentPaxIdx && p.selectedSeatOutbound?.number === seat.number
                        );

                        const isOccupied = !seat.isAvailable || isSelectedByOther;

                        // Insert aisle gap
                        const showAisleGap =
                          (cabinClass === 'economy' && (seatIdx === 2 || seatIdx === 5)) ||
                          (cabinClass === 'premium_economy' && (seatIdx === 1 || seatIdx === 4)) ||
                          (cabinClass === 'business' && (seatIdx === 0 || seatIdx === 2));

                        return (
                          <React.Fragment key={seat.id}>
                            <button
                              type="button"
                              disabled={isOccupied}
                              onClick={() => handleSeatClick(seat)}
                              title={`Seat ${seat.number} (${seat.type}) - ${seat.extraLegroom ? 'Extra Legroom' : 'Standard'}`}
                              className={`w-8 h-9 sm:w-9 sm:h-10 rounded-lg text-xs font-mono font-bold transition flex flex-col items-center justify-center relative cursor-pointer ${
                                isSelectedByCurrent
                                  ? 'bg-sky-600 text-white ring-2 ring-sky-300 shadow-sm scale-105'
                                  : isOccupied
                                  ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed opacity-50'
                                  : seat.extraLegroom
                                  ? 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <span>{seat.number}</span>
                              {seat.extraLegroom && !isSelectedByCurrent && !isOccupied && (
                                <span className="text-[8px] text-amber-700 font-bold -mt-1">
                                  XL
                                </span>
                              )}
                            </button>
                            {showAisleGap && <div className="w-4 sm:w-6" />}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Row number right */}
                    <span className="w-6 text-center font-mono text-xs font-bold text-slate-400">
                      {rowNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Galley / Rear indicator */}
            <div className="text-center pt-4 border-t border-slate-200 text-[11px] text-slate-400 font-mono">
              REAR GALLEY & LAVATORIES
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">Current Selection for {currentPassenger.firstName}:</div>
            <div className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
              <span>
                {currentPassenger.selectedSeatOutbound
                  ? `Seat ${currentPassenger.selectedSeatOutbound.number} (${currentPassenger.selectedSeatOutbound.type})`
                  : 'No seat chosen yet'}
              </span>
              {currentPassenger.selectedSeatOutbound && (
                <span className="text-xs text-emerald-700 font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                  Confirmed ($0.00 Gold Perk)
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer"
          >
            Confirm Seat & Return
          </button>
        </div>
      </div>
    </div>
  );
};
