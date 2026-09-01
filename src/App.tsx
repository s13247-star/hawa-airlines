import React, { useState, useEffect, useMemo } from 'react';
import {
  Booking,
  BookingAddons,
  CabinClass,
  CurrencyCode,
  FareTierKey,
  Flight,
  FlightSearchParams,
  Passenger,
  Seat,
  UserProfile,
} from './types';
import { INITIAL_USER_PROFILE, INITIAL_PRESET_BOOKINGS } from './data/user';
import { AIRPORTS } from './data/airports';
import { FARE_TIERS } from './data/flights';
import { generateFlightsForRoute } from './utils/flightGenerator';
import { generateSeatMap } from './utils/seatGenerator';
import { Header } from './components/Header';
import { FlightSearchForm } from './components/FlightSearchForm';
import { FlightResults } from './components/FlightResults';
import { SeatMapModal } from './components/SeatMapModal';
import { PassengerDetailsStep } from './components/PassengerDetailsStep';
import { AddonsAndLoyaltyStep } from './components/AddonsAndLoyaltyStep';
import { CheckoutPaymentStep } from './components/CheckoutPaymentStep';
import { BookingConfirmationView } from './components/BookingConfirmationView';
import { DashboardTrips } from './components/DashboardTrips';
import { SkyClubLoyaltyHub } from './components/SkyClubLoyaltyHub';
import { FlightStatusRadar } from './components/FlightStatusRadar';
import {
  Plane,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronRight,
  X,
  Compass,
  ArrowRight,
  Globe2,
  Clock,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

const DEFAULT_ADDONS: BookingAddons = {
  extraBaggageCount: 0,
  travelShieldInsurance: false,
  priorityBoarding: false,
  executiveLoungeAccess: false,
  carbonNeutralOffset: false,
  inflightHighSpeedWifi: false,
};

export default function App() {
  // Global App States
  const [activeTab, setActiveTab] = useState<'search' | 'trips' | 'loyalty' | 'status'>('search');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_PRESET_BOOKINGS);

  // Booking Flow Steps: 'search' | 'results' | 'passengers' | 'addons' | 'checkout' | 'confirmation'
  const [bookingStep, setBookingStep] = useState<
    'search' | 'results' | 'passengers' | 'addons' | 'checkout' | 'confirmation'
  >('search');

  // Search State
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    tripType: 'one_way',
    originAirport: AIRPORTS[0], // DXB
    destinationAirport: AIRPORTS[1], // LHR
    departureDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    passengers: { adults: 1, children: 0, infants: 0 },
    cabinClass: 'economy',
    directOnly: false,
  });

  const [availableFlights, setAvailableFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedCabin, setSelectedCabin] = useState<CabinClass>('economy');
  const [selectedFareTier, setSelectedFareTier] = useState<FareTierKey>('standard');

  // Passengers State
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [addons, setAddons] = useState<BookingAddons>(DEFAULT_ADDONS);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [activeConfirmation, setActiveConfirmation] = useState<Booking | null>(null);

  // Seat Selection Modal State
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [activeSeatPassengerIdx, setActiveSeatPassengerIdx] = useState(0);

  // Standalone Boarding Pass Modal
  const [viewingBoardingPassBooking, setViewingBoardingPassBooking] = useState<Booking | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Initialize initial flights on mount
  useEffect(() => {
    const initialFlights = generateFlightsForRoute(
      searchParams.originAirport,
      searchParams.destinationAirport,
      searchParams.departureDate
    );
    setAvailableFlights(initialFlights);
  }, []);

  // Initialize Passengers when search params change
  const initializePassengers = (params: FlightSearchParams) => {
    const totalPax = params.passengers.adults + params.passengers.children + params.passengers.infants;
    const newPaxList: Passenger[] = [];

    // Passenger 1 is always M.Isam (logged-in user)
    newPaxList.push({
      id: 'pax_1_isam',
      type: 'adult',
      title: user.title as Passenger['title'],
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: '1992-06-14',
      nationality: 'United Arab Emirates',
      passportNumber: user.passportNumber,
      passportExpiry: '2031-10-12',
      email: user.email,
      phone: user.phone,
      frequentFlyerNumber: user.memberId,
      mealPreference: 'Halal Gourmet Special (Standard)',
    });

    // Additional adult/child passengers
    for (let i = 1; i < totalPax; i++) {
      const isChild = i >= params.passengers.adults;
      newPaxList.push({
        id: `pax_${i + 1}`,
        type: isChild ? 'child' : 'adult',
        title: isChild ? 'Mr' : 'Ms',
        firstName: isChild ? `Junior` : `Companion`,
        lastName: `Isam`,
        dateOfBirth: isChild ? '2016-04-10' : '1990-11-22',
        nationality: 'United Arab Emirates',
        passportNumber: `P${Math.floor(10000000 + Math.random() * 90000000)}B`,
        passportExpiry: '2029-05-15',
        email: user.email,
        phone: user.phone,
        mealPreference: isChild ? 'Child / Toddler Friendly Meal' : 'Halal Gourmet Special (Standard)',
      });
    }

    setPassengers(newPaxList);
  };

  // Handle Search Submission
  const handleSearchSubmit = (newParams: FlightSearchParams) => {
    setSearchParams(newParams);
    const flights = generateFlightsForRoute(
      newParams.originAirport,
      newParams.destinationAirport,
      newParams.departureDate
    );
    setAvailableFlights(flights);
    setSelectedCabin(newParams.cabinClass);
    initializePassengers(newParams);
    setBookingStep('results');
  };

  // Handle Flight & Fare Tier Selection
  const handleSelectFlight = (flight: Flight, fareTier: FareTierKey, cabin?: CabinClass) => {
    setSelectedFlight(flight);
    if (cabin) setSelectedCabin(cabin);
    setSelectedFareTier(fareTier || 'standard');

    // If passengers list is empty, initialize it
    if (passengers.length === 0) {
      initializePassengers(searchParams);
    }

    setBookingStep('passengers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Date Change from Fare Matrix
  const handleDateChange = (newDate: string) => {
    const updated = { ...searchParams, departureDate: newDate };
    setSearchParams(updated);
    const flights = generateFlightsForRoute(
      updated.originAirport,
      updated.destinationAirport,
      newDate
    );
    setAvailableFlights(flights);
  };

  // Handle Passenger updates
  const handleUpdatePassenger = (index: number, updatedData: Partial<Passenger>) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updatedData };
      return next;
    });
  };

  // Open Seat Map for specific passenger
  const handleOpenSeatMap = (passengerIndex: number) => {
    setActiveSeatPassengerIdx(passengerIndex);
    setSeatModalOpen(true);
  };

  // Handle Seat selected on map
  const handleSelectSeat = (seat: Seat) => {
    setPassengers((prev) => {
      const next = [...prev];
      if (next[activeSeatPassengerIdx]) {
        next[activeSeatPassengerIdx] = {
          ...next[activeSeatPassengerIdx],
          selectedSeatOutbound: seat,
        };
      }
      return next;
    });
  };

  // Handle Completion of Booking
  const handleCompleteBooking = (paymentDetails: {
    method: 'credit_card' | 'apple_pay' | 'google_pay' | 'points_plus_cash';
    cardLast4: string;
  }) => {
    if (!selectedFlight) return;

    setIsProcessingCheckout(true);

    setTimeout(() => {
      const paxCount = passengers.length;
      const tierConfig = FARE_TIERS[selectedFareTier];
      const baseFare =
        Math.round(selectedFlight.basePrices[selectedCabin] * tierConfig.priceMultiplier) * paxCount;
      const taxes = Math.round(baseFare * 0.12);
      const baggageCost = addons.extraBaggageCount * 45;
      const insuranceCost = addons.travelShieldInsurance ? 32 * paxCount : 0;
      const priorityCost = addons.priorityBoarding ? 18 * paxCount : 0;
      const loungeCost = addons.executiveLoungeAccess ? 55 * paxCount : 0;
      const carbonCost = addons.carbonNeutralOffset ? 8 * paxCount : 0;
      const wifiCost = addons.inflightHighSpeedWifi ? 15 * paxCount : 0;
      const totalAddons =
        baggageCost + insuranceCost + priorityCost + loungeCost + carbonCost + wifiCost;

      const gross = baseFare + taxes + totalAddons;
      const pointsDiscountUSD = Math.floor(pointsToRedeem / 100);
      const netTotal = Math.max(0, gross - pointsDiscountUSD);
      const pointsEarned = Math.round(baseFare * 2 * tierConfig.pointsMultiplier);

      const generatedPnr = `HW${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const newBooking: Booking = {
        id: `book_${Date.now()}`,
        pnr: generatedPnr,
        userId: user.id,
        bookingDate: new Date().toISOString().split('T')[0],
        status: 'confirmed',
        tripType: searchParams.tripType,
        cabinClass: selectedCabin,
        fareTier: selectedFareTier,
        outboundFlight: selectedFlight,
        passengers: [...passengers],
        addons: { ...addons },
        pricing: {
          baseFare,
          taxesAndFees: taxes,
          passengerCount: paxCount,
          cabinClassFareTotal: baseFare,
          fareTierTotal: baseFare,
          seatSelectionFee: 0,
          baggageFee: baggageCost,
          addonsFee: totalAddons - baggageCost,
          pointsUsed: pointsToRedeem,
          pointsDiscount: pointsDiscountUSD,
          netTotal,
          pointsEarned,
        },
        paymentMethod: paymentDetails.method,
        paymentCardLast4: paymentDetails.cardLast4,
        gateOutbound: 'B18',
        terminalOutbound: selectedFlight.departureAirport.terminal || 'T3',
        boardingTimeOutbound: '07:45',
        contactEmail: passengers[0]?.email || user.email,
        contactPhone: passengers[0]?.phone || user.phone,
      };

      // Update user points balance and transaction ledger
      setUser((prevUser) => {
        const newBalance = prevUser.pointsBalance - pointsToRedeem + pointsEarned;
        const newTransactions = [...prevUser.transactions];

        if (pointsToRedeem > 0) {
          newTransactions.unshift({
            id: `tx_${Date.now()}_redeem`,
            date: new Date().toISOString().split('T')[0],
            description: `Redeemed points for flight ${selectedFlight.flightNumber} discount`,
            points: -pointsToRedeem,
            type: 'redeemed',
            pnrRef: generatedPnr,
            balanceAfter: prevUser.pointsBalance - pointsToRedeem,
          });
        }

        newTransactions.unshift({
          id: `tx_${Date.now()}_earn`,
          date: new Date().toISOString().split('T')[0],
          description: `Flight ${selectedFlight.flightNumber} ${selectedFlight.departureAirport.code}→${selectedFlight.arrivalAirport.code} booking bonus`,
          points: pointsEarned,
          type: 'earned',
          pnrRef: generatedPnr,
          balanceAfter: newBalance,
        });

        return {
          ...prevUser,
          pointsBalance: newBalance,
          lifetimePointsEarned: prevUser.lifetimePointsEarned + pointsEarned,
          tierMiles: prevUser.tierMiles + Math.round(selectedFlight.durationMinutes * 6),
          transactions: newTransactions,
        };
      });

      // Add to bookings list
      setBookings((prev) => [newBooking, ...prev]);
      setActiveConfirmation(newBooking);
      setIsProcessingCheckout(false);
      setBookingStep('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  };

  // Handle Cancellation of a Booking
  const handleCancelBooking = (pnr: string) => {
    const bookingToCancel = bookings.find((b) => b.pnr === pnr);
    if (!bookingToCancel) return;

    // Refund points if any used
    if (bookingToCancel.pricing.pointsUsed > 0) {
      setUser((prevUser) => {
        const newBalance = prevUser.pointsBalance + bookingToCancel.pricing.pointsUsed;
        const newTx = [
          {
            id: `tx_${Date.now()}_refund`,
            date: new Date().toISOString().split('T')[0],
            description: `Refunded points for cancelled booking ${pnr}`,
            points: bookingToCancel.pricing.pointsUsed,
            type: 'earned' as const,
            pnrRef: pnr,
            balanceAfter: newBalance,
          },
          ...prevUser.transactions,
        ];
        return {
          ...prevUser,
          pointsBalance: newBalance,
          transactions: newTx,
        };
      });
    }

    // Mark booking status as cancelled
    setBookings((prev) =>
      prev.map((b) => (b.pnr === pnr ? { ...b, status: 'cancelled' as const } : b))
    );
  };

  // Handle Perk Redemption from SkyClub Hub
  const handleRedeemPerk = (pointsCost: number, perkName: string) => {
    setUser((prevUser) => {
      const newBal = prevUser.pointsBalance - pointsCost;
      return {
        ...prevUser,
        pointsBalance: newBal,
        transactions: [
          {
            id: `tx_${Date.now()}_perk`,
            date: new Date().toISOString().split('T')[0],
            description: `SkyClub Reward: ${perkName}`,
            points: -pointsCost,
            type: 'redeemed',
            balanceAfter: newBal,
          },
          ...prevUser.transactions,
        ],
      };
    });
  };

  // Seat map for currently selected flight
  const currentSeatMap = useMemo(() => {
    if (!selectedFlight) return null;
    return generateSeatMap(selectedCabin);
  }, [selectedFlight, selectedCabin]);

  const assignedSeatForActivePax =
    passengers[activeSeatPassengerIdx]?.selectedSeatOutbound || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-slate-950 font-['Plus_Jakarta_Sans']">
      {/* Universal Aviation Header */}
      <Header
        user={user}
        currency={currency}
        onCurrencyChange={setCurrency}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'search' && bookingStep === 'confirmation') {
            setBookingStep('search');
          }
        }}
      />

      {/* Main App Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* VIEW 1: SEARCH & BOOKING ENGINE */}
        {activeTab === 'search' && (
          <div className="space-y-8">
            {/* Step: Search Form */}
            {bookingStep === 'search' && (
              <div className="space-y-10 animate-in fade-in duration-200">
                {/* Hero Aviation Banner */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-sky-950 via-slate-900 to-slate-950 border border-sky-500/20 p-6 sm:p-10 shadow-2xl">
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 max-w-3xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Hawa Flagship Experience • Global Airline Reservation</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-['Cabinet_Grotesk'] leading-tight">
                      Elevate Your Journey Across{' '}
                      <span className="bg-gradient-to-r from-sky-400 via-sky-200 to-amber-300 bg-clip-text text-transparent">
                        6 Continents
                      </span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                      Experience world-class cabin hospitality, flexible booking classes, transparent fares, and exclusive SkyClub loyalty rewards for verified member{' '}
                      <strong className="text-amber-300 font-bold">M.Isam</strong>.
                    </p>

                    {/* Quick Highlights */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-medium text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Zero Hidden Fees</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Instant Loyalty Point Credits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>24/7 Priority Concierge</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Flight Search Card */}
                <FlightSearchForm
                  searchParams={searchParams}
                  initialParams={searchParams}
                  onSearch={handleSearchSubmit}
                />

                {/* Popular Route Spotlights */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white font-['Cabinet_Grotesk']">
                        Popular Global Routes
                      </h3>
                      <p className="text-xs text-slate-400">
                        Top destinations selected by SkyClub Gold members this season
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        from: AIRPORTS[0], // DXB
                        to: AIRPORTS[1], // LHR
                        price: 495,
                        duration: '7h 45m',
                        tag: 'Gold Favorite',
                      },
                      {
                        from: AIRPORTS[0], // DXB
                        to: AIRPORTS[4], // SIN
                        price: 440,
                        duration: '7h 30m',
                        tag: 'Non-stop',
                      },
                      {
                        from: AIRPORTS[1], // LHR
                        to: AIRPORTS[2], // JFK
                        price: 520,
                        duration: '8h 15m',
                        tag: 'Transatlantic',
                      },
                      {
                        from: AIRPORTS[0], // DXB
                        to: AIRPORTS[3], // HND
                        price: 680,
                        duration: '9h 50m',
                        tag: 'Direct Daily',
                      },
                    ].map((route, i) => (
                      <div
                        key={i}
                        onClick={() =>
                          handleSearchSubmit({
                            ...searchParams,
                            originAirport: route.from,
                            destinationAirport: route.to,
                          })
                        }
                        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/60 transition group cursor-pointer shadow-lg hover:shadow-sky-500/10 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {route.tag}
                          </span>
                          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {route.duration}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl font-black font-mono text-white">
                              {route.from.code}
                            </div>
                            <div className="text-xs text-slate-400">{route.from.city}</div>
                          </div>
                          <div className="flex-1 flex justify-center px-2">
                            <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition" />
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black font-mono text-white">
                              {route.to.code}
                            </div>
                            <div className="text-xs text-slate-400">{route.to.city}</div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">Fares from</span>
                          <span className="text-sm font-black font-mono text-emerald-400">
                            ${route.price} USD
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step: Flight Results with Filters & Price Calendar */}
            {bookingStep === 'results' && (
              <FlightResults
                flights={availableFlights}
                searchParams={searchParams}
                selectedCabin={selectedCabin}
                currency={currency}
                onSelectFlight={handleSelectFlight}
                onDateChange={handleDateChange}
                onBackToSearch={() => setBookingStep('search')}
              />
            )}

            {/* Step: Passenger Details */}
            {bookingStep === 'passengers' && selectedFlight && (
              <PassengerDetailsStep
                passengers={passengers}
                user={user}
                flight={selectedFlight}
                cabinClass={selectedCabin}
                onUpdatePassenger={handleUpdatePassenger}
                onOpenSeatMap={handleOpenSeatMap}
                onContinue={() => {
                  setBookingStep('addons');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onBack={() => setBookingStep('results')}
              />
            )}

            {/* Step: Addons & SkyClub Loyalty Points Redemption */}
            {bookingStep === 'addons' && selectedFlight && (
              <AddonsAndLoyaltyStep
                user={user}
                flight={selectedFlight}
                cabinClass={selectedCabin}
                fareTier={selectedFareTier}
                passengers={passengers}
                addons={addons}
                setAddons={setAddons}
                pointsToRedeem={pointsToRedeem}
                setPointsToRedeem={setPointsToRedeem}
                currency={currency}
                onContinue={() => {
                  setBookingStep('checkout');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onBack={() => setBookingStep('passengers')}
              />
            )}

            {/* Step: Final Checkout & Payment */}
            {bookingStep === 'checkout' && selectedFlight && (
              <CheckoutPaymentStep
                user={user}
                flight={selectedFlight}
                cabinClass={selectedCabin}
                fareTier={selectedFareTier}
                passengers={passengers}
                addons={addons}
                pointsToRedeem={pointsToRedeem}
                onUpdatePointsToRedeem={setPointsToRedeem}
                currency={currency}
                onCompleteBooking={handleCompleteBooking}
                onBack={() => setBookingStep('addons')}
                isProcessing={isProcessingCheckout}
              />
            )}

            {/* Step: Booking Confirmation */}
            {bookingStep === 'confirmation' && activeConfirmation && (
              <BookingConfirmationView
                booking={activeConfirmation}
                currency={currency}
                onViewTrips={() => setActiveTab('trips')}
                onBookAnother={() => {
                  setBookingStep('search');
                  setPointsToRedeem(0);
                  setAddons(DEFAULT_ADDONS);
                }}
              />
            )}
          </div>
        )}

        {/* VIEW 2: MY TRIPS DASHBOARD */}
        {activeTab === 'trips' && (
          <DashboardTrips
            bookings={bookings}
            user={user}
            currency={currency}
            onCancelBooking={handleCancelBooking}
            onViewBoardingPass={(booking) => setViewingBoardingPassBooking(booking)}
            onBookFlightCTA={() => {
              setActiveTab('search');
              setBookingStep('search');
            }}
          />
        )}

        {/* VIEW 3: SKYCLUB LOYALTY HUB */}
        {activeTab === 'loyalty' && (
          <SkyClubLoyaltyHub
            user={user}
            currency={currency}
            onRedeemPerk={handleRedeemPerk}
            onBookFlightCTA={() => {
              setActiveTab('search');
              setBookingStep('search');
            }}
          />
        )}

        {/* VIEW 4: LIVE FLIGHT STATUS & RADAR */}
        {activeTab === 'status' && <FlightStatusRadar />}
      </main>

      {/* Interactive Aircraft Cabin Seat Map Modal */}
      {seatModalOpen && selectedFlight && currentSeatMap && (
        <SeatMapModal
          isOpen={seatModalOpen}
          onClose={() => setSeatModalOpen(false)}
          flight={selectedFlight}
          cabinClass={selectedCabin}
          passengers={passengers}
          activePassengerIndex={activeSeatPassengerIdx}
          passengerIndex={activeSeatPassengerIdx}
          passenger={passengers[activeSeatPassengerIdx]}
          seatMap={currentSeatMap}
          assignedSeat={assignedSeatForActivePax}
          onSelectSeat={handleSelectSeat}
          currency={currency}
        />
      )}

      {/* Standalone View Boarding Pass Modal (from Dashboard) */}
      {viewingBoardingPassBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-3xl w-full my-8 relative">
            <button
              onClick={() => setViewingBoardingPassBooking(null)}
              className="absolute -top-4 -right-2 z-10 w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 shadow-xl border border-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <BookingConfirmationView
              booking={viewingBoardingPassBooking}
              currency={currency}
              onViewTrips={() => setViewingBoardingPassBooking(null)}
              onBookAnother={() => {
                setViewingBoardingPassBooking(null);
                setActiveTab('search');
                setBookingStep('search');
              }}
            />
          </div>
        </div>
      )}

      {/* Aviation Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 mt-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-slate-950 font-black">
                  <Plane className="w-4 h-4" />
                </div>
                <span className="font-black text-base text-white font-['Cabinet_Grotesk']">
                  Hawa<span className="text-sky-400">.Airlines</span>
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Global airline reservation platform and member of the SkyClub Global Alliance. Licensed carrier operating international scheduled passenger flights.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">
                Travel Services
              </h4>
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li className="hover:text-white cursor-pointer">Flight Schedules & Routes</li>
                <li className="hover:text-white cursor-pointer">Baggage Guidelines</li>
                <li className="hover:text-white cursor-pointer">SkyClub Executive Lounges</li>
                <li className="hover:text-white cursor-pointer">In-Flight Dining Menus</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">
                SkyClub Frequent Flyer
              </h4>
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li className="hover:text-white cursor-pointer">Gold Member Benefits</li>
                <li className="hover:text-white cursor-pointer">Redeem Points for Flights</li>
                <li className="hover:text-white cursor-pointer">Tier Upgrade Milestones</li>
                <li className="hover:text-white cursor-pointer">SkyAlliance Partners</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">
                Active Traveler
              </h4>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-white font-bold">{user.name}</div>
                <div className="text-amber-400 font-mono text-[11px]">{user.tier} Tier #{user.memberId}</div>
                <div className="text-emerald-400 font-mono text-[11px] font-bold">
                  {user.pointsBalance.toLocaleString()} Loyalty Points
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} Hawa Airlines Inc. All rights reserved. IATA Code: HW • ICAO: HWA.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Carriage</span>
              <span>•</span>
              <span>Accessibility</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
