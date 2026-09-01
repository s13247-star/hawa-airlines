import React, { useState, useEffect } from 'react';
import {
  BookingAddons,
  CabinClass,
  CurrencyCode,
  FareTierKey,
  Flight,
  Passenger,
  UserProfile,
} from '../types';
import { FARE_TIERS } from '../data/flights';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  Plane,
  User,
  Luggage,
  Award,
  Check,
  CheckCircle2,
  ArrowRight,
  X,
  Plus,
} from 'lucide-react';

interface CheckoutPaymentStepProps {
  user: UserProfile;
  flight: Flight;
  cabinClass: CabinClass;
  fareTier: FareTierKey;
  passengers: Passenger[];
  addons: BookingAddons;
  pointsToRedeem: number;
  onUpdatePointsToRedeem?: (points: number) => void;
  currency: CurrencyCode;
  onCompleteBooking: (paymentDetails: {
    method: 'credit_card' | 'apple_pay' | 'google_pay' | 'points_plus_cash';
    cardLast4: string;
  }) => void;
  onBack: () => void;
  isProcessing?: boolean;
}

export const CheckoutPaymentStep: React.FC<CheckoutPaymentStepProps> = ({
  user,
  flight,
  cabinClass,
  fareTier,
  passengers,
  addons,
  pointsToRedeem,
  onUpdatePointsToRedeem,
  currency,
  onCompleteBooking,
  onBack,
  isProcessing = false,
}) => {
  const [localPoints, setLocalPoints] = useState<number>(pointsToRedeem);
  const [paymentMethod, setPaymentMethod] = useState<
    'credit_card' | 'apple_pay' | 'google_pay' | 'points_plus_cash'
  >(pointsToRedeem > 0 ? 'points_plus_cash' : 'credit_card');

  // Keep localPoints synced if parent changes
  useEffect(() => {
    setLocalPoints(pointsToRedeem);
  }, [pointsToRedeem]);

  const handleSetPoints = (pts: number) => {
    setLocalPoints(pts);
    if (onUpdatePointsToRedeem) {
      onUpdatePointsToRedeem(pts);
    }
    if (pts > 0 && paymentMethod === 'credit_card') {
      setPaymentMethod('points_plus_cash');
    }
  };

  // Card form state (prefilled realistically for M.Isam)
  const [cardNumber, setCardNumber] = useState('4821 •••• •••• 9104');
  const [cardHolder, setCardHolder] = useState('MUHAMMAD ISAM');
  const [cardExpiry, setCardExpiry] = useState('11/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const paxCount = passengers.length;
  const tierConfig = FARE_TIERS[fareTier];
  const basePricePerPax = Math.round(flight.basePrices[cabinClass] * tierConfig.priceMultiplier);
  const totalBaseFare = basePricePerPax * paxCount;
  const taxes = Math.round(totalBaseFare * 0.12);

  const baggageCost = addons.extraBaggageCount * 45;
  const insuranceCost = addons.travelShieldInsurance ? 32 * paxCount : 0;
  const priorityCost = addons.priorityBoarding ? 18 * paxCount : 0;
  const loungeCost = addons.executiveLoungeAccess ? 55 * paxCount : 0;
  const carbonCost = addons.carbonNeutralOffset ? 8 * paxCount : 0;
  const wifiCost = addons.inflightHighSpeedWifi ? 15 * paxCount : 0;
  const totalAddonsCost = baggageCost + insuranceCost + priorityCost + loungeCost + carbonCost + wifiCost;

  const grossTotal = totalBaseFare + taxes + totalAddonsCost;
  const maxPossiblePoints = Math.min(user.pointsBalance, grossTotal * 100);
  const pointsDiscountUSD = Math.floor(localPoints / 100);
  const netTotalUSD = Math.max(0, grossTotal - pointsDiscountUSD);
  const earnedPoints = Math.round(totalBaseFare * 2 * tierConfig.pointsMultiplier);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;

    onCompleteBooking({
      method: paymentMethod,
      cardLast4: cardNumber.replace(/\D/g, '').slice(-4) || '4821',
    });
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 uppercase font-mono">
              Final Step 4 of 4
            </span>
            <h2 className="text-lg font-bold text-slate-900">Review & Complete Secure Reservation</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official E-Ticket and Boarding Pass will be generated immediately with PNR code.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-emerald-700 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-Bit SSL Encrypted Booking</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Itinerary Review + Payment form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Flight & Passenger Verification Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Plane className="w-4 h-4 text-sky-600" />
              Verified Flight Details
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-xs"
                    style={{ backgroundColor: flight.airline.logoColor }}
                  >
                    {flight.airline.code}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{flight.airline.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">{flight.flightNumber} • {flight.aircraft.model}</p>
                  </div>
                </div>

                <div className="text-xs px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                  {tierConfig.name} ({cabinClass.replace('_', ' ')} Class)
                </div>
              </div>

              {/* Route snippet */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs text-slate-700">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-base">
                    {flight.departureTime}
                  </span>{' '}
                  ({flight.departureAirport.code} - {flight.departureAirport.city})
                </div>
                <div className="text-slate-400 font-mono">✈</div>
                <div>
                  <span className="font-mono font-bold text-slate-900 text-base">
                    {flight.arrivalTime}
                  </span>{' '}
                  ({flight.arrivalAirport.code} - {flight.arrivalAirport.city})
                </div>
              </div>
            </div>

            {/* Passenger & Seat tags */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500">Confirmed Travelers:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {passengers.map((pax, idx) => (
                  <div
                    key={pax.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-sky-600" />
                      <span className="font-bold text-slate-900">
                        {pax.title} {pax.firstName} {pax.lastName}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 font-mono text-[11px] font-bold">
                      Seat {pax.selectedSeatOutbound ? pax.selectedSeatOutbound.number : 'Auto (2A)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PAYMENT METHOD SELECTION */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sky-600" />
                Select Payment Method
              </h3>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> Encrypted Checkout
              </span>
            </div>

            {/* Payment Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'credit_card'
                    ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-5 h-5 text-sky-600" />
                <span className="text-xs">Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('points_plus_cash')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'points_plus_cash'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Award className="w-5 h-5 text-amber-600" />
                <span className="text-xs">Points + Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'apple_pay'
                    ? 'bg-slate-800 border-slate-800 text-white font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="text-base font-black">Pay</span>
                <span className="text-xs">Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('google_pay')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'google_pay'
                    ? 'bg-slate-800 border-slate-800 text-white font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="text-base font-black text-sky-400">GPay</span>
                <span className="text-xs">Google Pay</span>
              </button>
            </div>

            {/* Credit Card Form Fields */}
            {(paymentMethod === 'credit_card' || paymentMethod === 'points_plus_cash') && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-3.5 pl-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:border-sky-500 focus:bg-white focus:outline-none"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:border-sky-500 focus:bg-white focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:border-sky-500 focus:bg-white focus:outline-none text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      CVV / Security Code
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:border-sky-500 focus:bg-white focus:outline-none text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quick 1-touch note for Apple / Google Pay */}
            {(paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-600">
                  Ready to authenticate with {paymentMethod === 'apple_pay' ? 'Apple Touch ID / Face ID' : 'Google Pay 1-Touch'} linked to <strong>m.isam@hawa-air.com</strong>.
                </p>
                <div className="text-xs text-emerald-600 font-semibold">
                  Instant biometric checkout enabled
                </div>
              </div>
            )}

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-sky-600 bg-slate-50 border-slate-300 focus:ring-sky-500"
                />
                <span>
                  I confirm the traveler details are correct and accept the Hawa.Airlines Conditions of Carriage, Baggage Allowances, and Privacy Policy.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!agreeTerms || isProcessing}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Issuing E-Ticket & Boarding Pass...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-white" />
                  <span>
                    Pay & Confirm Ticket • {formatCurrency(netTotalUSD, currency)}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Final Price Breakdown Card */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 sticky top-20 shadow-sm space-y-5">
            <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
              Payment Summary
            </h3>

            {/* Line Items */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Flight Base Fare ({paxCount} Passenger)</span>
                <span className="font-mono text-slate-900">{formatCurrency(totalBaseFare, currency)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Airport Taxes & Carrier Surcharges</span>
                <span className="font-mono text-slate-900">{formatCurrency(taxes, currency)}</span>
              </div>

              {totalAddonsCost > 0 && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Selected Add-ons & Luggage</span>
                  <span className="font-mono text-slate-900">{formatCurrency(totalAddonsCost, currency)}</span>
                </div>
              )}

              {/* Loyalty discount line and interactive controls */}
              {pointsDiscountUSD > 0 ? (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-emerald-800 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      SkyClub Loyalty Discount
                    </span>
                    <span className="font-mono">-{formatCurrency(pointsDiscountUSD, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-700">
                    <span>{localPoints.toLocaleString()} points applied</span>
                    <button
                      type="button"
                      onClick={() => handleSetPoints(0)}
                      className="px-2 py-0.5 rounded bg-white hover:bg-red-50 text-red-600 font-bold border border-red-200 flex items-center gap-1 transition cursor-pointer shadow-2xs"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove Discount</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Redeem SkyClub Points
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {user.pointsBalance.toLocaleString()} pts available
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSetPoints(Math.min(15000, maxPossiblePoints))}
                      className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold transition cursor-pointer"
                    >
                      Use 15k pts (-$150)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPoints(Math.min(30000, maxPossiblePoints))}
                      className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold transition cursor-pointer"
                    >
                      Use 30k pts (-$300)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPoints(maxPossiblePoints)}
                      className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold transition cursor-pointer"
                    >
                      Use Max Pts
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Net Total Payable */}
            <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                  Total Charged
                </span>
                <span className="text-[11px] text-slate-400">Includes all VAT & fees</span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900">
                {formatCurrency(netTotalUSD, currency)}
              </div>
            </div>

            {/* Points Earned Preview */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span>SkyClub Points Earned:</span>
                <span className="font-mono font-bold text-sky-700 text-sm">
                  +{earnedPoints.toLocaleString()} pts
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Will be credited to Member #{user.memberId}
              </div>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              ← Back to Add-ons & Luggage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
