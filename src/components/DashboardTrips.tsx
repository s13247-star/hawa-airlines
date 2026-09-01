import React, { useState } from 'react';
import { Booking, CurrencyCode, UserProfile } from '../types';
import { formatCurrency, formatDate, formatDuration } from '../utils/formatters';
import {
  Ticket,
  Plane,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Download,
  Printer,
  XCircle,
  Eye,
  Search,
  Luggage,
  Sparkles,
  ArrowRight,
  Armchair,
  ExternalLink,
} from 'lucide-react';

interface DashboardTripsProps {
  bookings: Booking[];
  user: UserProfile;
  currency: CurrencyCode;
  onCancelBooking: (pnr: string) => void;
  onViewBoardingPass: (booking: Booking) => void;
  onBookFlightCTA: () => void;
}

export const DashboardTrips: React.FC<DashboardTripsProps> = ({
  bookings,
  user,
  currency,
  onCancelBooking,
  onViewBoardingPass,
  onBookFlightCTA,
}) => {
  const [filterTab, setFilterTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModalPnr, setCancelModalPnr] = useState<string | null>(null);

  const filteredBookings = bookings.filter((b) => {
    // Filter by status tab
    if (filterTab === 'upcoming' && (b.status === 'completed' || b.status === 'cancelled')) return false;
    if (filterTab === 'completed' && b.status !== 'completed') return false;
    if (filterTab === 'cancelled' && b.status !== 'cancelled') return false;

    // Filter by query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPnr = b.pnr.toLowerCase().includes(q);
      const matchCity =
        b.outboundFlight.departureAirport.city.toLowerCase().includes(q) ||
        b.outboundFlight.arrivalAirport.city.toLowerCase().includes(q);
      const matchFlightNum = b.outboundFlight.flightNumber.toLowerCase().includes(q);
      return matchPnr || matchCity || matchFlightNum;
    }

    return true;
  });

  const handleConfirmCancel = () => {
    if (cancelModalPnr) {
      onCancelBooking(cancelModalPnr);
      setCancelModalPnr(null);
    }
  };

  const bookingToCancel = bookings.find((b) => b.pnr === cancelModalPnr);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Profile Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center font-black text-white text-xl shadow-xs">
            MI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {user.title} {user.firstName} {user.lastName}'s Reservations
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 uppercase">
                {user.tier} Member
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              SkyClub #{user.memberId} • Total Bookings on File: {bookings.length}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBookFlightCTA}
          className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition cursor-pointer"
        >
          <Plane className="w-4 h-4 text-white" />
          <span>Book New Flight</span>
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setFilterTab('upcoming')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer font-bold ${
              filterTab === 'upcoming'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming Trips ({bookings.filter((b) => b.status === 'confirmed' || b.status === 'checked_in').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('completed')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer font-bold ${
              filterTab === 'completed'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({bookings.filter((b) => b.status === 'completed').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('cancelled')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer font-bold ${
              filterTab === 'cancelled'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled ({bookings.filter((b) => b.status === 'cancelled').length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by PNR, City or Flight #..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Ticket className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 mb-1">No Bookings in this Category</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {filterTab === 'upcoming'
              ? 'You have no active flights scheduled right now. Ready to explore new horizons?'
              : 'No past records found matching your filters.'}
          </p>
          {filterTab === 'upcoming' && (
            <button
              type="button"
              onClick={onBookFlightCTA}
              className="px-5 py-2.5 bg-sky-600 text-white font-bold rounded-xl text-xs hover:bg-sky-500 cursor-pointer shadow-sm"
            >
              Search & Book a Flight
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const flight = booking.outboundFlight;
            const primaryPax = booking.passengers[0];
            const seat = primaryPax.selectedSeatOutbound?.number || '2A';

            return (
              <div
                key={booking.id}
                id={`booking-card-${booking.pnr}`}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden shadow-sm transition space-y-4 p-5 sm:p-7"
              >
                {/* Top Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-sky-700 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
                      PNR: {booking.pnr}
                    </span>
                    <span className="text-xs text-slate-500">
                      Booked on {formatDate(booking.bookingDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status === 'confirmed' && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Confirmed & Ticketed
                      </span>
                    )}
                    {booking.status === 'completed' && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Flight Flown / Completed
                      </span>
                    )}
                    {booking.status === 'cancelled' && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Cancelled (Points Refunded)
                      </span>
                    )}
                  </div>
                </div>

                {/* Flight Route Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Airline & Aircraft */}
                  <div className="md:col-span-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs"
                        style={{ backgroundColor: flight.airline.logoColor }}
                      >
                        {flight.airline.code}
                      </div>
                      <span className="font-bold text-sm text-slate-900">{flight.airline.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      {flight.flightNumber} • {flight.aircraft.model}
                    </p>
                    <div className="text-[11px] text-sky-700 font-semibold uppercase">
                      {booking.cabinClass.replace('_', ' ')} Class ({booking.fareTier} Fare)
                    </div>
                  </div>

                  {/* Flight Timeline */}
                  <div className="md:col-span-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-2xl font-black font-mono text-slate-900">
                          {flight.departureTime}
                        </div>
                        <div className="text-xs font-bold text-sky-700">
                          {flight.departureAirport.code}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatDate(flight.departureDate, true)}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col items-center px-2">
                        <span className="text-[11px] font-mono font-medium text-slate-500 mb-1">
                          {formatDuration(flight.durationMinutes)}
                        </span>
                        <div className="w-full relative flex items-center justify-center">
                          <div className="w-full h-0.5 bg-slate-200" />
                          <Plane className="w-3.5 h-3.5 text-sky-600 absolute rotate-90" />
                        </div>
                        <span className="text-[10px] text-emerald-700 mt-1 font-semibold">
                          {flight.stops === 0 ? 'Non-stop' : '1 Stop'}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black font-mono text-slate-900">
                          {flight.arrivalTime}
                        </div>
                        <div className="text-xs font-bold text-sky-700">
                          {flight.arrivalAirport.code}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatDate(flight.arrivalDate, true)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seat & Passenger */}
                  <div className="md:col-span-3 md:border-l md:border-slate-100 md:pl-6 space-y-1.5 text-xs">
                    <div className="text-slate-500">
                      Traveler: <strong className="text-slate-900">{primaryPax.firstName} {primaryPax.lastName}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Seat:</span>
                      <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {seat}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      Total Paid:{' '}
                      <strong className="text-emerald-700 font-mono">
                        {formatCurrency(booking.pricing.netTotal, currency)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    {booking.pricing.pointsUsed > 0 && (
                      <span className="text-amber-800 font-mono font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        {booking.pricing.pointsUsed.toLocaleString()} Points Redeemed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {booking.status === 'confirmed' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onViewBoardingPass(booking)}
                          className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>View Boarding Pass</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCancelModalPnr(booking.pnr)}
                          className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Cancel Flight</span>
                        </button>
                      </>
                    )}

                    {booking.status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => onViewBoardingPass(booking)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Past Ticket</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalPnr && bookingToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Cancel Reservation {cancelModalPnr}?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Flight {bookingToCancel.outboundFlight.flightNumber} from{' '}
                {bookingToCancel.outboundFlight.departureAirport.city} to{' '}
                {bookingToCancel.outboundFlight.arrivalAirport.city}.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span>Fare Flexibility:</span>
                <span className="font-bold text-sky-700 capitalize">
                  {bookingToCancel.fareTier} Fare
                </span>
              </div>
              {bookingToCancel.pricing.pointsUsed > 0 && (
                <div className="flex items-center justify-between text-amber-800 font-bold">
                  <span>Loyalty Points to be Refunded:</span>
                  <span className="font-mono">
                    +{bookingToCancel.pricing.pointsUsed.toLocaleString()} pts
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span>Cash Refund to Card:</span>
                <span className="font-mono">
                  {formatCurrency(bookingToCancel.pricing.netTotal, currency)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalPnr(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
