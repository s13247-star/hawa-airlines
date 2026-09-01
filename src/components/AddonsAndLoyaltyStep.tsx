import React, { useState } from 'react';
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
import { formatCurrency } from '../utils/formatters';
import {
  Award,
  Sparkles,
  Luggage,
  Shield,
  Zap,
  Coffee,
  Leaf,
  Wifi,
  Check,
  ChevronRight,
  Plus,
  Minus,
  Gift,
  Coins,
  ArrowRight,
} from 'lucide-react';

interface AddonsAndLoyaltyStepProps {
  user: UserProfile;
  flight: Flight;
  cabinClass: CabinClass;
  fareTier: FareTierKey;
  passengers: Passenger[];
  addons: BookingAddons;
  setAddons: (addons: BookingAddons) => void;
  pointsToRedeem: number;
  setPointsToRedeem: (points: number) => void;
  currency: CurrencyCode;
  onContinue: () => void;
  onBack: () => void;
}

export const AddonsAndLoyaltyStep: React.FC<AddonsAndLoyaltyStepProps> = ({
  user,
  flight,
  cabinClass,
  fareTier,
  passengers,
  addons,
  setAddons,
  pointsToRedeem,
  setPointsToRedeem,
  currency,
  onContinue,
  onBack,
}) => {
  const paxCount = passengers.length;
  const tierConfig = FARE_TIERS[fareTier];
  const basePricePerPax = Math.round(flight.basePrices[cabinClass] * tierConfig.priceMultiplier);
  const totalBaseFare = basePricePerPax * paxCount;
  const taxes = Math.round(totalBaseFare * 0.12);

  // Addons total cost calculation
  const baggageCost = addons.extraBaggageCount * 45;
  const insuranceCost = addons.travelShieldInsurance ? 32 * paxCount : 0;
  const priorityCost = addons.priorityBoarding ? 18 * paxCount : 0;
  const loungeCost = addons.executiveLoungeAccess ? 55 * paxCount : 0;
  const carbonCost = addons.carbonNeutralOffset ? 8 * paxCount : 0;
  const wifiCost = addons.inflightHighSpeedWifi ? 15 * paxCount : 0;
  const totalAddonsCost = baggageCost + insuranceCost + priorityCost + loungeCost + carbonCost + wifiCost;

  const grossTotal = totalBaseFare + taxes + totalAddonsCost;

  // Max points redeemable cannot exceed user balance OR full ticket price
  const maxPossiblePoints = Math.min(user.pointsBalance, grossTotal * 100);
  const pointsDiscountUSD = Math.floor(pointsToRedeem / 100);
  const netPayableUSD = Math.max(0, grossTotal - pointsDiscountUSD);

  // Points earned on this flight (Gold member 1.5x / flex 2x)
  const earnedPoints = Math.round(totalBaseFare * 2 * tierConfig.pointsMultiplier);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setPointsToRedeem(Math.min(val, maxPossiblePoints));
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 uppercase font-mono">
              Step 3 of 4
            </span>
            <h2 className="text-lg font-bold text-slate-900">SkyClub Loyalty Redemption & Flight Add-ons</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Redeem M.Isam's loyalty points for instant fare discounts and customize travel comfort.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs">
          <Coins className="w-4 h-4 text-amber-600" />
          <span>Available Balance: <strong>{user.pointsBalance.toLocaleString()} pts</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Loyalty Redemption Card + Add-on options */}
        <div className="lg:col-span-8 space-y-6">
          {/* LOYALTY POINTS REDEMPTION CARD */}
          <div className="bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 border-2 border-amber-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-5 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 font-['Cabinet_Grotesk']">
                      SkyClub Loyalty Discount
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      Gold Member Privileges
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Logged in as <strong className="text-amber-800">M.Isam</strong> (#{user.memberId})
                  </p>
                </div>
              </div>

              {/* Point Value rate badge */}
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-amber-800">
                  100 Points = $1.00 USD
                </div>
                <div className="text-[11px] text-slate-500">Instant Checkout Credit</div>
              </div>
            </div>

            {/* Interactive Points Redemption Slider & Presets */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Choose Points to Redeem for this Trip:
                </label>
                <div className="text-sm font-mono font-bold text-amber-800">
                  {pointsToRedeem.toLocaleString()} pts{' '}
                  <span className="text-emerald-600">
                    (-{formatCurrency(pointsDiscountUSD, currency)})
                  </span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max={maxPossiblePoints}
                step="500"
                value={pointsToRedeem}
                onChange={handleSliderChange}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600 border border-amber-200"
              />

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPointsToRedeem(0)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    pointsToRedeem === 0
                      ? 'bg-slate-800 border-slate-800 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Don't use points
                </button>

                <button
                  type="button"
                  onClick={() => setPointsToRedeem(Math.min(15000, maxPossiblePoints))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    pointsToRedeem === 15000
                      ? 'bg-amber-600 text-white font-bold border-amber-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
                  }`}
                >
                  15,000 pts ($150 off)
                </button>

                <button
                  type="button"
                  onClick={() => setPointsToRedeem(Math.min(30000, maxPossiblePoints))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    pointsToRedeem === 30000
                      ? 'bg-amber-600 text-white font-bold border-amber-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
                  }`}
                >
                  30,000 pts ($300 off)
                </button>

                <button
                  type="button"
                  onClick={() => setPointsToRedeem(maxPossiblePoints)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    pointsToRedeem === maxPossiblePoints
                      ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
                      : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  Max Points ({maxPossiblePoints.toLocaleString()})
                </button>
              </div>

              {/* Points Earning Notification */}
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-sky-800">
                  <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    <strong>SkyClub Points Earned on this Flight:</strong> Credited immediately after confirmation
                  </span>
                </div>
                <div className="font-mono font-bold text-sky-700 text-sm">
                  +{earnedPoints.toLocaleString()} pts
                </div>
              </div>
            </div>
          </div>

          {/* ANCILLARY ADD-ONS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 mb-2">Enhance Your Journey (Add-ons)</h3>

            {/* Extra Checked Baggage */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                  <Luggage className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Extra Checked Baggage (23kg)</h4>
                  <p className="text-xs text-slate-500">
                    Pre-book online and save 40% compared to airport check-in desk rates.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-900">
                    {formatCurrency(45, currency)} / bag
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
                  <button
                    type="button"
                    disabled={addons.extraBaggageCount <= 0}
                    onClick={() =>
                      setAddons({
                        ...addons,
                        extraBaggageCount: Math.max(0, addons.extraBaggageCount - 1),
                      })
                    }
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center font-mono font-bold text-xs text-slate-900">
                    {addons.extraBaggageCount}
                  </span>
                  <button
                    type="button"
                    disabled={addons.extraBaggageCount >= 4}
                    onClick={() =>
                      setAddons({
                        ...addons,
                        extraBaggageCount: Math.min(4, addons.extraBaggageCount + 1),
                      })
                    }
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* TravelShield Insurance */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">Hawa TravelShield™ Comprehensive Protection</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    $100,000 emergency medical coverage, flight delay compensation & baggage loss protection.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-900">
                  {formatCurrency(32 * paxCount, currency)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAddons({
                      ...addons,
                      travelShieldInsurance: !addons.travelShieldInsurance,
                    })
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    addons.travelShieldInsurance
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
                >
                  {addons.travelShieldInsurance ? 'Added ✓' : 'Add Protection'}
                </button>
              </div>
            </div>

            {/* Priority FastTrack & Boarding */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Airport FastTrack & Priority Group 1 Boarding</h4>
                  <p className="text-xs text-slate-500">
                    Skip long security lines with dedicated Gold & Express security lane access.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-900">
                  {formatCurrency(18 * paxCount, currency)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAddons({
                      ...addons,
                      priorityBoarding: !addons.priorityBoarding,
                    })
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    addons.priorityBoarding
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
                >
                  {addons.priorityBoarding ? 'Added ✓' : 'Add FastTrack'}
                </button>
              </div>
            </div>

            {/* Executive Lounge Access */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">SkyClub Executive Lounge Pass</h4>
                  <p className="text-xs text-slate-500">
                    Complimentary gourmet buffet, premium beverages, shower suites and quiet work pods.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-900">
                  {formatCurrency(55 * paxCount, currency)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAddons({
                      ...addons,
                      executiveLoungeAccess: !addons.executiveLoungeAccess,
                    })
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    addons.executiveLoungeAccess
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
                >
                  {addons.executiveLoungeAccess ? 'Added ✓' : 'Add Pass'}
                </button>
              </div>
            </div>

            {/* High-Speed Streaming Inflight WiFi */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">High-Speed Satellite SkyWiFi Pass</h4>
                  <p className="text-xs text-slate-500">
                    Unlimited full-flight connectivity for video streaming and remote productivity.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-900">
                  {formatCurrency(15 * paxCount, currency)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAddons({
                      ...addons,
                      inflightHighSpeedWifi: !addons.inflightHighSpeedWifi,
                    })
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    addons.inflightHighSpeedWifi
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
                >
                  {addons.inflightHighSpeedWifi ? 'Added ✓' : 'Add WiFi'}
                </button>
              </div>
            </div>

            {/* Carbon Offset */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">100% Certified Carbon Neutral Flight Offset</h4>
                  <p className="text-xs text-slate-500">
                    Support verified reforestation & clean renewable energy projects.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-900">
                  {formatCurrency(8 * paxCount, currency)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAddons({
                      ...addons,
                      carbonNeutralOffset: !addons.carbonNeutralOffset,
                    })
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    addons.carbonNeutralOffset
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
                >
                  {addons.carbonNeutralOffset ? 'Added ✓' : 'Offset CO₂'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Column: Order Summary & Points Breakdown */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 sticky top-20 shadow-sm space-y-5">
            <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
              Trip Summary & Price
            </h3>

            {/* Flight Mini Details */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>{flight.airline.name}</span>
                <span className="font-mono text-sky-700">{flight.flightNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>
                  {flight.departureAirport.code} ({flight.departureTime})
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {flight.arrivalAirport.code} ({flight.arrivalTime})
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {tierConfig.name} • {paxCount} {paxCount === 1 ? 'Traveler' : 'Travelers'}
              </div>
            </div>

            {/* Line Item Breakdown */}
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2 text-slate-600">
                <span>Base Fare ({paxCount}x)</span>
                <span className="font-mono text-slate-900">{formatCurrency(totalBaseFare, currency)}</span>
              </div>

              <div className="flex items-center justify-between pt-2 text-slate-600">
                <span>Airport Taxes & Regulatory Surcharges</span>
                <span className="font-mono text-slate-900">{formatCurrency(taxes, currency)}</span>
              </div>

              {totalAddonsCost > 0 && (
                <div className="flex items-center justify-between pt-2 text-slate-600">
                  <span>Selected Add-ons & Baggage</span>
                  <span className="font-mono text-slate-900">{formatCurrency(totalAddonsCost, currency)}</span>
                </div>
              )}

              {/* Loyalty Discount Highlight */}
              {pointsDiscountUSD > 0 && (
                <div className="flex items-center justify-between pt-2 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    SkyClub Points Discount
                  </span>
                  <span className="font-mono">-{formatCurrency(pointsDiscountUSD, currency)}</span>
                </div>
              )}
            </div>

            {/* Net Total */}
            <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 block font-semibold">
                  Net Total Payable
                </span>
                <span className="text-[11px] text-slate-400">All fees & taxes included</span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900">
                {formatCurrency(netPayableUSD, currency)}
              </div>
            </div>

            {/* Points Summary Badge */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span>Points to Redeem:</span>
                <span className="font-mono font-bold text-amber-800">-{pointsToRedeem.toLocaleString()} pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Points to Earn:</span>
                <span className="font-mono font-bold text-sky-700">+{earnedPoints.toLocaleString()} pts</span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={onContinue}
                className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Proceed to Final Checkout</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Back to Passenger Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
