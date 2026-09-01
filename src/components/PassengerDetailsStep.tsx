import React from 'react';
import { Passenger, UserProfile, Flight, CabinClass } from '../types';
import { User, Shield, Sparkles, Utensils, Armchair, ChevronRight, Phone, Mail, CheckCircle2 } from 'lucide-react';

interface PassengerDetailsStepProps {
  passengers: Passenger[];
  user: UserProfile;
  flight: Flight;
  cabinClass: CabinClass;
  onUpdatePassenger: (index: number, updatedData: Partial<Passenger>) => void;
  onOpenSeatMap: (passengerIndex: number) => void;
  onContinue: () => void;
  onBack: () => void;
}

const MEAL_OPTIONS = [
  'Halal Gourmet Special (Standard)',
  'Asian Vegetarian / Hindu Meal',
  'Western Vegetarian / Vegan Meal',
  'Gluten-Friendly Meal',
  'Diabetic / Low-Glycemic Meal',
  'Low-Sodium / Heart-Healthy Meal',
  'Child / Toddler Friendly Meal',
  'Kosher Certified Meal',
  'Fruit Platter / Raw Meal',
];

export const PassengerDetailsStep: React.FC<PassengerDetailsStepProps> = ({
  passengers,
  user,
  flight,
  cabinClass,
  onUpdatePassenger,
  onOpenSeatMap,
  onContinue,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 uppercase font-mono">
              Step 2 of 4
            </span>
            <h2 className="text-lg font-bold text-slate-900">Passenger & Travel Information</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Flight {flight.flightNumber} • {flight.departureAirport.code} → {flight.arrivalAirport.code} • Pre-filled for SkyClub Gold Member
          </p>
        </div>

        {/* M.Isam Verified Gold Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <div>
            <span className="font-bold">M.Isam</span> • Frequent Flyer #{user.memberId}
          </div>
        </div>
      </div>

      {/* Passenger Cards */}
      <div className="space-y-4">
        {passengers.map((pax, idx) => {
          const isPrimaryMember = idx === 0;

          return (
            <div
              key={pax.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-5"
            >
              {/* Passenger Card Header */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-bold text-xs">
                    P{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>
                        Passenger {idx + 1}: {pax.firstName} {pax.lastName}
                      </span>
                      {isPrimaryMember && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          Logged-in Account
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 capitalize">{pax.type} Passenger</p>
                  </div>
                </div>

                {/* Seat Assignment Button */}
                <button
                  type="button"
                  onClick={() => onOpenSeatMap(idx)}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-sky-300 text-xs font-bold text-slate-800 flex items-center gap-2 transition cursor-pointer"
                >
                  <Armchair className="w-4 h-4 text-sky-600" />
                  <span>
                    {pax.selectedSeatOutbound
                      ? `Seat ${pax.selectedSeatOutbound.number} Selected`
                      : 'Choose Aircraft Seat'}
                  </span>
                  {pax.selectedSeatOutbound && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </button>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {/* Title */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Title</label>
                  <select
                    value={pax.title}
                    onChange={(e) =>
                      onUpdatePassenger(idx, { title: e.target.value as Passenger['title'] })
                    }
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:border-sky-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Dr">Dr</option>
                    <option value="Prof">Prof</option>
                  </select>
                </div>

                {/* First / Given Name */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    First Name (as on Passport)
                  </label>
                  <input
                    type="text"
                    value={pax.firstName}
                    onChange={(e) => onUpdatePassenger(idx, { firstName: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:border-sky-500 focus:bg-white focus:outline-none placeholder:text-slate-400"
                    placeholder="First Name"
                  />
                </div>

                {/* Last / Surname */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Last / Family Name
                  </label>
                  <input
                    type="text"
                    value={pax.lastName}
                    onChange={(e) => onUpdatePassenger(idx, { lastName: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:border-sky-500 focus:bg-white focus:outline-none placeholder:text-slate-400"
                    placeholder="Last Name"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={pax.dateOfBirth}
                    onChange={(e) => onUpdatePassenger(idx, { dateOfBirth: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium font-mono focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nationality</label>
                  <input
                    type="text"
                    value={pax.nationality}
                    onChange={(e) => onUpdatePassenger(idx, { nationality: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:border-sky-500 focus:bg-white focus:outline-none placeholder:text-slate-400"
                    placeholder="e.g. United Arab Emirates"
                  />
                </div>

                {/* Passport Number */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Passport / Travel ID
                  </label>
                  <input
                    type="text"
                    value={pax.passportNumber}
                    onChange={(e) => onUpdatePassenger(idx, { passportNumber: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium font-mono uppercase focus:border-sky-500 focus:bg-white focus:outline-none placeholder:text-slate-400"
                    placeholder="e.g. P9842104B"
                  />
                </div>

                {/* Passport Expiry */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Passport Expiry</label>
                  <input
                    type="date"
                    value={pax.passportExpiry}
                    onChange={(e) => onUpdatePassenger(idx, { passportExpiry: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium font-mono focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Frequent Flyer # */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    SkyClub Frequent Flyer #
                  </label>
                  <input
                    type="text"
                    value={pax.frequentFlyerNumber || ''}
                    onChange={(e) =>
                      onUpdatePassenger(idx, { frequentFlyerNumber: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium font-mono focus:border-sky-500 focus:bg-white focus:outline-none placeholder:text-slate-400"
                    placeholder="HW-XXXXXXXX"
                  />
                </div>
              </div>

              {/* Contact and Preferences Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
                {/* Email */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={pax.email}
                    onChange={(e) => onUpdatePassenger(idx, { email: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:border-sky-500 focus:bg-white focus:outline-none placeholder:text-slate-400"
                    placeholder="name@domain.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Mobile Phone (for SMS Gate Alerts)
                  </label>
                  <input
                    type="tel"
                    value={pax.phone}
                    onChange={(e) => onUpdatePassenger(idx, { phone: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium font-mono focus:border-sky-500 focus:bg-white focus:outline-none placeholder:text-slate-400"
                    placeholder="+971 50 XXX XXXX"
                  />
                </div>

                {/* Meal Preference */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-slate-400" />
                    Complimentary Dining Request
                  </label>
                  <select
                    value={pax.mealPreference}
                    onChange={(e) => onUpdatePassenger(idx, { mealPreference: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:border-sky-500 focus:bg-white focus:outline-none"
                  >
                    {MEAL_OPTIONS.map((meal) => (
                      <option key={meal} value={meal}>
                        {meal}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer shadow-xs"
        >
          ← Back to Flights
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition cursor-pointer"
        >
          <span>Continue to Add-ons & SkyClub Loyalty</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
