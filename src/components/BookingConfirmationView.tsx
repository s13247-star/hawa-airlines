import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Booking, CurrencyCode } from '../types';
import { formatCurrency, formatDate, formatDuration } from '../utils/formatters';
import {
  CheckCircle,
  Sparkles,
  Plane,
  Download,
  Printer,
  Calendar,
  Share2,
  Ticket,
  Clock,
  MapPin,
  Luggage,
  ShieldCheck,
  QrCode,
  ArrowRight,
  User,
} from 'lucide-react';

interface BookingConfirmationViewProps {
  booking: Booking;
  currency: CurrencyCode;
  onViewTrips: () => void;
  onBookAnother: () => void;
}

export const BookingConfirmationView: React.FC<BookingConfirmationViewProps> = ({
  booking,
  currency,
  onViewTrips,
  onBookAnother,
}) => {
  // Launch confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00A8E8', '#F5A623', '#10B981', '#ffffff'],
      });
    } catch {
      // ignore
    }
  }, []);

  const flight = booking.outboundFlight;
  const primaryPax = booking.passengers[0];
  const assignedSeat = primaryPax.selectedSeatOutbound?.number || '2A';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hawa Airlines//Flight Reservation//EN
BEGIN:VEVENT
UID:${booking.pnr}@hawa-air.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${flight.departureDate.replace(/-/g, '')}T${flight.departureTime.replace(':', '')}00Z
DTEND:${flight.arrivalDate.replace(/-/g, '')}T${flight.arrivalTime.replace(':', '')}00Z
SUMMARY:Hawa Flight ${flight.flightNumber}: ${flight.departureAirport.code} to ${flight.arrivalAirport.code}
DESCRIPTION:PNR: ${booking.pnr}\\nPassenger: ${primaryPax.firstName} ${primaryPax.lastName}\\nSeat: ${assignedSeat}\\nCabin: ${booking.cabinClass}
LOCATION:${flight.departureAirport.name} (${flight.departureAirport.code})
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Flight-${flight.flightNumber}-${booking.pnr}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Confirmation Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <CheckCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Booking Confirmed & E-Ticket Issued
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
          Have a Wonderful Flight, {primaryPax.title} {primaryPax.lastName}!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-2">
          Your reservation is officially confirmed. A confirmation receipt has been sent to{' '}
          <strong className="text-sky-700 font-mono">{booking.contactEmail}</strong>.
        </p>

        {/* PNR Code Pill */}
        <div className="mt-5 inline-flex items-center gap-3 bg-slate-50 border-2 border-emerald-500 rounded-xl px-6 py-3 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-semibold">Booking Reference (PNR):</span>
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-emerald-700">
            {booking.pnr}
          </span>
        </div>
      </div>

      {/* SkyClub Points Ledger Notification */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">SkyClub Loyalty Rewards Updated</h4>
              <p className="text-xs text-slate-600">
                Gold Member Account: <strong>{primaryPax.firstName} {primaryPax.lastName}</strong> ({primaryPax.frequentFlyerNumber || 'HW-88294109'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {booking.pricing.pointsUsed > 0 && (
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">Points Redeemed</span>
                <span className="font-bold text-amber-700">-{booking.pricing.pointsUsed.toLocaleString()} pts</span>
              </div>
            )}
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">Points Earned</span>
              <span className="font-bold text-emerald-700">+{booking.pricing.pointsEarned.toLocaleString()} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* AUTHENTIC AVIATION BOARDING PASS COMPONENT (Perforated Design) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative">
        {/* Boarding pass top flight bar */}
        <div className="bg-sky-600 px-6 py-4 flex flex-wrap items-center justify-between text-white gap-2">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            <span className="font-black text-lg tracking-tight">
              Hawa.Airlines Boarding Pass
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/20 text-white ml-2">
              {booking.cabinClass.replace('_', ' ')} Suite
            </span>
          </div>

          <div className="font-mono font-bold text-xs bg-white/20 px-3 py-1 rounded-lg">
            ELECTRONIC TICKET / ETKT
          </div>
        </div>

        {/* Boarding Pass Body: Main Ticket Area + Perforated Stub */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-dashed divide-slate-200 bg-white">
          {/* Main Flight Info (8 cols) */}
          <div className="md:col-span-8 p-6 sm:p-8 space-y-6">
            {/* Passenger & Flight # */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Passenger Name
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono uppercase">
                  {primaryPax.lastName} / {primaryPax.firstName} {primaryPax.title}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Flight Number
                </span>
                <span className="text-sm font-bold text-sky-700 font-mono">
                  {flight.flightNumber}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Departure Date
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {formatDate(flight.departureDate, true)}
                </span>
              </div>
            </div>

            {/* Departure to Arrival Large Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              {/* Origin */}
              <div>
                <div className="text-3xl font-black font-mono text-slate-900 tracking-tight">
                  {flight.departureAirport.code}
                </div>
                <div className="text-xs font-bold text-sky-700">{flight.departureAirport.city}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Dep: <strong className="text-slate-800">{flight.departureTime}</strong>
                </div>
              </div>

              {/* Center flight line */}
              <div className="flex-1 flex flex-col items-center px-4">
                <span className="text-[11px] text-slate-500 font-mono mb-1">
                  {formatDuration(flight.durationMinutes)} Non-stop
                </span>
                <div className="w-full relative flex items-center justify-center">
                  <div className="w-full h-0.5 bg-slate-200" />
                  <Plane className="w-4 h-4 text-sky-600 absolute rotate-90" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  {flight.aircraft.model}
                </span>
              </div>

              {/* Destination */}
              <div className="text-right">
                <div className="text-3xl font-black font-mono text-slate-900 tracking-tight">
                  {flight.arrivalAirport.code}
                </div>
                <div className="text-xs font-bold text-sky-700">{flight.arrivalAirport.city}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Arr: <strong className="text-slate-800">{flight.arrivalTime}</strong>
                </div>
              </div>
            </div>

            {/* Gate, Terminal, Boarding Time, Seat */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 uppercase font-semibold block">Gate</span>
                <span className="text-lg font-black font-mono text-slate-900">
                  {booking.gateOutbound || 'B18'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 uppercase font-semibold block">
                  Terminal
                </span>
                <span className="text-lg font-black font-mono text-slate-900">
                  {flight.departureAirport.terminal || 'T3'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <span className="text-[9px] uppercase font-semibold block text-amber-700">Boarding</span>
                <span className="text-lg font-black font-mono">
                  {booking.boardingTimeOutbound || '07:45'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900">
                <span className="text-[9px] uppercase font-semibold block text-sky-700">Seat</span>
                <span className="text-lg font-black font-mono">{assignedSeat}</span>
              </div>
            </div>
          </div>

          {/* Right Perforated Stub (4 cols) with QR Code & Barcode */}
          <div className="md:col-span-4 p-6 sm:p-8 flex flex-col justify-between items-center text-center space-y-4 bg-slate-50/50">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Flight Stub</span>
              <div className="font-mono font-bold text-slate-900 text-sm">
                {flight.departureAirport.code} → {flight.arrivalAirport.code}
              </div>
              <div className="text-xs text-sky-700 font-mono font-semibold">Seat: {assignedSeat}</div>
              <div className="text-xs text-slate-500 font-mono">PNR: {booking.pnr}</div>
            </div>

            {/* Authentic Visual QR Code Container */}
            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 inline-block">
              <div className="w-28 h-28 bg-slate-900 flex flex-col items-center justify-center p-1 relative rounded-lg">
                <QrCode className="w-24 h-24 text-white" />
              </div>
            </div>

            {/* Barcode line */}
            <div className="w-full space-y-1">
              <div className="font-mono text-[9px] text-slate-400 tracking-widest uppercase">
                ||| | ||||| || |||| ||| |||| | |||
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Present at Gate for Priority Boarding
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-sky-600" />
            Print Boarding Pass
          </button>

          <button
            type="button"
            onClick={handleDownloadICS}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Calendar className="w-4 h-4 text-amber-600" />
            Add to Calendar (.ics)
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onViewTrips}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            View in My Trips
          </button>

          <button
            type="button"
            onClick={onBookAnother}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs transition cursor-pointer shadow-xs"
          >
            Book Another Flight
          </button>
        </div>
      </div>
    </div>
  );
};
