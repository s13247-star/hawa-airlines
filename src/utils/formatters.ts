import { CurrencyCode, CurrencyConfig } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rateFromUSD: 1.0, label: 'USD ($)' },
  EUR: { code: 'EUR', symbol: '€', rateFromUSD: 0.92, label: 'EUR (€)' },
  GBP: { code: 'GBP', symbol: '£', rateFromUSD: 0.79, label: 'GBP (£)' },
  AED: { code: 'AED', symbol: 'AED ', rateFromUSD: 3.67, label: 'AED (د.إ)' },
  PKR: { code: 'PKR', symbol: 'Rs ', rateFromUSD: 278.5, label: 'PKR (₨)' },
};

/**
 * Format monetary amount with active currency
 */
export function formatCurrency(
  amountInUSD: number,
  currency: CurrencyCode = 'USD',
  showDecimals = true
): string {
  const config = CURRENCIES[currency] || CURRENCIES.USD;
  const converted = amountInUSD * config.rateFromUSD;
  
  // Format with commas and appropriate decimal places
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: showDecimals && (currency === 'USD' || currency === 'EUR' || currency === 'GBP') ? 2 : 0,
    maximumFractionDigits: (currency === 'PKR') ? 0 : 2,
  }).format(converted);

  if (currency === 'AED') {
    return `${config.symbol}${formattedNumber}`;
  }
  if (currency === 'PKR') {
    return `${config.symbol}${formattedNumber}`;
  }
  return `${config.symbol}${formattedNumber}`;
}

/**
 * Format duration in minutes to e.g. "7h 45m"
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Generate a realistic PNR (Passenger Name Record) e.g. "HW7X9Q"
 */
export function generatePNR(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pnr = 'HW';
  for (let i = 0; i < 4; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

/**
 * Format date string e.g. "2026-09-18" into "Fri, 18 Sep 2026"
 */
export function formatDate(dateString: string, short = false): string {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return dateString;

  if (short) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Calculate loyalty points earned for a flight fare
 */
export function calculateEarnedPoints(fareTotalUSD: number, multiplier = 1.0): number {
  // Base rule: 2 points per 1 USD spent * tier/fare multiplier
  return Math.round(fareTotalUSD * 2 * multiplier);
}

/**
 * Points to USD value (100 points = $1 USD discount)
 */
export function pointsToUSD(points: number): number {
  return Math.floor(points / 100);
}

/**
 * USD discount to required points
 */
export function usdToPoints(usd: number): number {
  return Math.round(usd * 100);
}
