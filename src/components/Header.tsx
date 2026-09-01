import React, { useState } from 'react';
import { Plane, Award, Compass, Ticket, ShieldCheck, ChevronDown, Sparkles, User, Globe, HelpCircle } from 'lucide-react';
import { CurrencyCode, UserProfile } from '../types';
import { CURRENCIES, formatCurrency } from '../utils/formatters';

interface HeaderProps {
  activeTab: 'search' | 'trips' | 'loyalty' | 'status' | 'book';
  setActiveTab?: (tab: 'search' | 'trips' | 'loyalty' | 'status') => void;
  onTabChange?: (tab: 'search' | 'trips' | 'loyalty' | 'status') => void;
  user: UserProfile;
  currency: CurrencyCode;
  setCurrency?: (c: CurrencyCode) => void;
  onCurrencyChange?: (c: CurrencyCode) => void;
  bookingCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onTabChange,
  user,
  currency,
  setCurrency,
  onCurrencyChange,
  bookingCount = 0,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const handleTabSelect = (tab: 'search' | 'trips' | 'loyalty' | 'status') => {
    if (onTabChange) onTabChange(tab);
    if (setActiveTab) setActiveTab(tab);
  };

  const handleCurrencySelect = (c: CurrencyCode) => {
    if (onCurrencyChange) onCurrencyChange(c);
    if (setCurrency) setCurrency(c);
  };

  const isTabActive = (tab: 'search' | 'trips' | 'loyalty' | 'status') => {
    if (tab === 'search') return activeTab === 'search' || (activeTab as string) === 'book';
    return activeTab === tab;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-slate-900 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/30 text-[10px] uppercase">
              <Sparkles className="w-3 h-3 text-amber-300" /> SkyClub Gold Perks Active
            </span>
            <span className="hidden sm:inline text-slate-300 text-xs">
              Welcome back, <strong className="text-white font-semibold">{user.name}</strong> • Redeem points for up to 100% off any booking
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="hidden md:inline text-sky-400 font-medium">24/7 Dedicated Gold Concierge: +971 4 800-HAWA</span>
            <span className="text-slate-300 font-medium">Official Flagship Booking</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            id="brand-logo-btn"
            onClick={() => handleTabSelect('search')}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-600 shadow-sm flex items-center justify-center text-white group-hover:bg-sky-500 transition-colors">
              <Plane className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-['Cabinet_Grotesk']">
                  Hawa<span className="text-sky-600">.Airlines</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  Global
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Elevated Aviation & SkyClub</p>
            </div>
          </button>

          {/* Nav links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              id="nav-book-flights"
              onClick={() => handleTabSelect('search')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                isTabActive('search')
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4 text-sky-600" />
              Search & Book
            </button>

            <button
              id="nav-my-trips"
              onClick={() => handleTabSelect('trips')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer relative ${
                isTabActive('trips')
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Ticket className="w-4 h-4 text-sky-600" />
              My Trips
              {bookingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-sky-600 text-white font-bold text-[10px] rounded-full">
                  {bookingCount}
                </span>
              )}
            </button>

            <button
              id="nav-loyalty-club"
              onClick={() => handleTabSelect('loyalty')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                isTabActive('loyalty')
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4 text-amber-600" />
              SkyClub Rewards
              <span className="text-[10px] font-bold text-amber-700 bg-yellow-500/20 px-1.5 py-0.5 rounded border border-amber-300">
                Gold
              </span>
            </button>

            <button
              id="nav-flight-status"
              onClick={() => handleTabSelect('status')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                isTabActive('status')
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Plane className="w-4 h-4 rotate-45 text-sky-600" />
              Flight Radar
            </button>
          </nav>
        </div>

        {/* Right side: Currency switcher & Logged-in Passenger Badge */}
        <div className="flex items-center gap-3">
          {/* Currency Switcher */}
          <div className="relative">
            <button
              id="currency-switcher-btn"
              onClick={() => {
                setShowCurrencyDropdown(!showCurrencyDropdown);
                setShowUserDropdown(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Currency
                </div>
                {Object.values(CURRENCIES).map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => {
                      handleCurrencySelect(curr.code);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      currency === curr.code ? 'text-sky-600 font-bold bg-sky-50' : 'text-slate-700'
                    }`}
                  >
                    <span>{curr.label}</span>
                    {currency === curr.code && <span className="text-sky-600">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logged-in Member Badge: M.Isam */}
          <div className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowCurrencyDropdown(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer group"
            >
              <div className="w-7 h-7 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center font-bold text-xs">
                MI
              </div>
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-800">
                    {user.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-yellow-500/20 text-yellow-700 border border-amber-300">
                    {user.tier}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono font-medium text-amber-700">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{user.pointsBalance.toLocaleString()} pts</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition" />
            </button>

            {/* Profile Flyout Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-slate-950 text-base shadow-sm">
                    MI
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {user.title} {user.firstName} {user.lastName}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">{user.memberId}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-700 border border-amber-300">
                        SkyClub {user.tier} Tier
                      </span>
                    </div>
                  </div>
                </div>

                {/* Points Card in dropdown */}
                <div className="my-3 p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">Available Points</span>
                    <span className="text-amber-400 font-bold font-mono">≈ {formatCurrency(user.pointsBalance / 100, currency)} off</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {user.pointsBalance.toLocaleString()} <span className="text-xs font-normal text-slate-400">pts</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Target to Platinum:</span>
                    <span className="text-slate-200 font-medium">11,600 miles left</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-400 to-amber-300 h-full rounded-full w-[76%]" />
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      handleTabSelect('loyalty');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-amber-700 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    Open SkyClub Loyalty Center
                  </button>
                  <button
                    onClick={() => {
                      handleTabSelect('trips');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-sky-600 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Ticket className="w-4 h-4 text-sky-600" />
                    Manage My Bookings ({bookingCount})
                  </button>
                  <button
                    onClick={() => {
                      handleTabSelect('status');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Plane className="w-4 h-4 text-slate-500" />
                    Flight Schedule Radar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation tab bar */}
      <div className="lg:hidden px-4 py-2 bg-white border-t border-slate-200 flex items-center justify-around text-xs">
        <button
          onClick={() => handleTabSelect('search')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg font-semibold ${
            isTabActive('search') ? 'text-sky-600' : 'text-slate-500'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Book</span>
        </button>
        <button
          onClick={() => handleTabSelect('trips')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg font-semibold relative ${
            isTabActive('trips') ? 'text-sky-600' : 'text-slate-500'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Trips ({bookingCount})</span>
        </button>
        <button
          onClick={() => handleTabSelect('loyalty')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg font-semibold ${
            isTabActive('loyalty') ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>SkyClub</span>
        </button>
        <button
          onClick={() => handleTabSelect('status')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg font-semibold ${
            isTabActive('status') ? 'text-sky-600' : 'text-slate-500'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Radar</span>
        </button>
      </div>
    </header>
  );
};
