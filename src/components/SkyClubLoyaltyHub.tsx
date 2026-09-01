import React, { useState } from 'react';
import { CurrencyCode, PointsTransaction, UserProfile } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Award,
  Sparkles,
  QrCode,
  ShieldCheck,
  TrendingUp,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  Crown,
  Plane,
  Luggage,
  Coffee,
  CheckCircle,
  Clock,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface SkyClubLoyaltyHubProps {
  user: UserProfile;
  currency: CurrencyCode;
  onRedeemPerk?: (pointsCost: number, perkName: string) => void;
  onBookFlightCTA: () => void;
}

export const SkyClubLoyaltyHub: React.FC<SkyClubLoyaltyHubProps> = ({
  user,
  currency,
  onRedeemPerk,
  onBookFlightCTA,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'catalog'>('overview');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const tierProgressPct = Math.min(100, Math.round((user.tierMiles / user.tierMilesTarget) * 100));
  const milesNeeded = Math.max(0, user.tierMilesTarget - user.tierMiles);

  const perksCatalog = [
    {
      id: 'perk_upgrade',
      title: 'One-Way Business Class Cabin Upgrade',
      description: 'Upgrade an existing Economy or Premium Economy booking to Lie-Flat Business Suite.',
      pointsCost: 15000,
      icon: Crown,
      tag: 'Most Popular',
    },
    {
      id: 'perk_lounge',
      title: 'SkyClub Executive Lounge Pass (Guest)',
      description: 'Complimentary full-day lounge access pass for a family member or travel companion.',
      pointsCost: 5000,
      icon: Coffee,
      tag: 'Instant Voucher',
    },
    {
      id: 'perk_baggage',
      title: '+23kg Extra Checked Luggage Voucher',
      description: 'Add an additional heavy baggage allowance to your next domestic or international flight.',
      pointsCost: 4000,
      icon: Luggage,
      tag: 'Baggage Perk',
    },
    {
      id: 'perk_fasttrack',
      title: 'VIP Airport Chauffeur Transfer',
      description: 'Complimentary private luxury Mercedes S-Class airport transfer within 50km radius.',
      pointsCost: 18000,
      icon: Zap,
      tag: 'Luxury',
    },
  ];

  const handleRedeemPerkClick = (perk: (typeof perksCatalog)[0]) => {
    if (user.pointsBalance < perk.pointsCost) {
      setFeedbackMsg(`Insufficient points balance for this perk (${perk.pointsCost.toLocaleString()} required).`);
      return;
    }

    if (onRedeemPerk) {
      onRedeemPerk(perk.pointsCost, perk.title);
      setFeedbackMsg(`Successfully redeemed ${perk.title}! Voucher saved to your SkyClub wallet.`);
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome & Tier Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: User & Tier overview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                ★ SkyClub Frequent Flyer Club
              </span>
              <span className="text-xs text-slate-500 font-mono">Member Since {user.memberSince}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Cabinet_Grotesk']">
              Welcome to Your SkyClub Lounge, {user.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              As an esteemed <strong className="text-amber-800">Gold Member</strong>, you earn 1.5x points on all flights, enjoy complimentary lounge access, priority fast-track, and flexible points redemption across global destinations.
            </p>

            {/* Points counter pill */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Available Points Balance
                </span>
                <div className="text-3xl font-black font-mono text-amber-700 mt-0.5">
                  {user.pointsBalance.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500">pts</span>
                </div>
                <div className="text-xs text-emerald-700 font-mono mt-1 font-semibold">
                  ≈ {formatCurrency(user.pointsBalance / 100, currency)} Flight Discount
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Lifetime Points Earned
                </span>
                <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                  {user.lifetimePointsEarned.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500">pts</span>
                </div>
                <div className="text-xs text-sky-700 font-mono mt-1 font-medium">14 Flights Flown</div>
              </div>
            </div>
          </div>

          {/* Right: Digital Holographic Membership Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm aspect-[1.586] rounded-2xl p-6 bg-gradient-to-br from-amber-600 via-amber-700 to-slate-900 border border-amber-300 shadow-md text-white relative overflow-hidden flex flex-col justify-between">
              {/* Card Holographic texture */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-white" />
                  <span className="font-bold text-base tracking-tight">
                    Hawa<span className="text-amber-200">.Airlines</span>
                  </span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-black/40 text-amber-200 border border-amber-300/30">
                  {user.tier} TIER
                </span>
              </div>

              {/* Card Chip / Logo */}
              <div className="z-10 flex items-center justify-between">
                <div className="w-10 h-8 rounded-lg bg-amber-400/30 border border-amber-200/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                </div>
                <div className="font-mono text-xs tracking-wider font-bold text-amber-100">
                  SKYCLUB ALLIANCE
                </div>
              </div>

              {/* Card Bottom: Member Name & Number */}
              <div className="z-10 flex items-end justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-amber-200 font-bold">
                    Primary Cardholder
                  </div>
                  <div className="text-base font-bold font-mono text-white tracking-wide">
                    {user.name.toUpperCase()}
                  </div>
                  <div className="text-xs font-mono text-amber-200">{user.memberId}</div>
                </div>

                <div className="p-1.5 bg-white rounded-xl shadow-xs">
                  <QrCode className="w-8 h-8 text-slate-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Progress Milestone to Platinum */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>Next Milestone: Platinum Tier Upgrade</span>
            </h3>
            <p className="text-xs text-slate-500">
              Earn {milesNeeded.toLocaleString()} more Tier Miles by Dec 31 to unlock First Class Suites upgrades & Diamond lounge passes.
            </p>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-amber-800 font-bold">{user.tierMiles.toLocaleString()}</span>
            <span className="text-slate-400"> / {user.tierMilesTarget.toLocaleString()} Tier Miles</span>
            <span className="ml-2 text-sky-700 font-bold">({tierProgressPct}%)</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 p-0.5">
          <div
            className="bg-gradient-to-r from-amber-500 to-sky-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${tierProgressPct}%` }}
          />
        </div>
      </div>

      {/* Navigation Tabs (Overview, Points Ledger History, Rewards Shop) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Gold Perks & Privileges
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Points Activity History ({user.transactions.length})
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Rewards & Upgrades Shop
        </button>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* TAB 1: Gold Member Perks Grid */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Global Lounge Access</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unlimited complimentary access to 250+ SkyClub and partner lounges worldwide with gourmet catering and shower suites.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Luggage className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">+20kg Extra Baggage</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Guaranteed complimentary extra checked luggage allowance on all Hawa and SkyAlliance flights.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Priority FastTrack & Group 1</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Skip lines with dedicated Business/Gold check-in counters, fast security clearance, and priority boarding.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Points Activity Ledger */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600" />
            Points Activity Ledger
          </h3>

          <div className="space-y-2 divide-y divide-slate-100">
            {user.transactions.map((tx) => (
              <div key={tx.id} className="pt-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'earned' || tx.type === 'bonus'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {tx.type === 'earned' || tx.type === 'bonus' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{tx.description}</h5>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {formatDate(tx.date)} {tx.pnrRef ? `• PNR: ${tx.pnrRef}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono font-bold text-sm ${
                      tx.points > 0 ? 'text-emerald-700' : 'text-amber-800'
                    }`}
                  >
                    {tx.points > 0 ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()} pts
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Bal: {tx.balanceAfter.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Rewards & Perks Catalog */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {perksCatalog.map((perk) => {
            const Icon = perk.icon;
            const canAfford = user.pointsBalance >= perk.pointsCost;

            return (
              <div
                key={perk.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {perk.tag}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{perk.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{perk.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="font-mono font-black text-amber-700 text-base">
                    {perk.pointsCost.toLocaleString()} <span className="text-xs font-normal text-slate-500">pts</span>
                  </div>

                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleRedeemPerkClick(perk)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition cursor-pointer shadow-xs"
                  >
                    Redeem Reward
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
