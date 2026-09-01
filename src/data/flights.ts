import { Airline, FareTierOption } from '../types';

export const AIRLINES: Airline[] = [
  {
    name: 'Hawa Airways',
    code: 'HW',
    logoColor: '#00A8E8',
    alliance: 'SkyAlliance',
    callsign: 'HAWA',
  },
  {
    name: 'Emirates',
    code: 'EK',
    logoColor: '#D71921',
    alliance: 'Global Partner',
    callsign: 'EMIRATES',
  },
  {
    name: 'Qatar Airways',
    code: 'QR',
    logoColor: '#5C0632',
    alliance: 'Oneworld',
    callsign: 'QATARI',
  },
  {
    name: 'Singapore Airlines',
    code: 'SQ',
    logoColor: '#E6A100',
    alliance: 'Star Alliance',
    callsign: 'SINGAPORE',
  },
  {
    name: 'Turkish Airlines',
    code: 'TK',
    logoColor: '#E81932',
    alliance: 'Star Alliance',
    callsign: 'TURKISH',
  },
  {
    name: 'British Airways',
    code: 'BA',
    logoColor: '#075AAA',
    alliance: 'Oneworld',
    callsign: 'SPEEDBIRD',
  },
];

export const FARE_TIERS: Record<string, FareTierOption> = {
  light: {
    tier: 'light',
    name: 'Hawa Light',
    priceMultiplier: 1.0,
    cabinBaggage: '1x 7kg Personal Carry-On',
    checkedBaggage: 'Not included (Add from $45)',
    seatSelection: 'Random at check-in (Paid selection)',
    changesAllowed: false,
    refundable: false,
    pointsMultiplier: 1.0,
    perks: [
      'Personal Item & 7kg Carry-on',
      'In-flight dining & beverage service',
      'Standard entertainment screen',
      '1x SkyClub Points per mile',
    ],
  },
  standard: {
    tier: 'standard',
    name: 'Hawa Standard',
    priceMultiplier: 1.25,
    cabinBaggage: '1x 7kg Carry-On + Personal Item',
    checkedBaggage: '1x 23kg Checked Bag Included',
    seatSelection: 'Free standard seat selection',
    changesAllowed: true,
    refundable: false,
    pointsMultiplier: 1.5,
    perks: [
      '1x 23kg Checked Luggage included',
      'Select any Standard Seat for free',
      'Flexible date change (fare difference only)',
      '1.5x SkyClub Points per mile',
      'Priority luggage tag',
    ],
  },
  flex: {
    tier: 'flex',
    name: 'Hawa Flex Plus',
    priceMultiplier: 1.55,
    cabinBaggage: '2x 10kg Carry-On + Personal Item',
    checkedBaggage: '2x 23kg Checked Bags Included',
    seatSelection: 'Free Extra Legroom & Preferred Seats',
    changesAllowed: true,
    refundable: true,
    pointsMultiplier: 2.0,
    perks: [
      '2x 23kg Checked Luggage included',
      'Free Extra Legroom / Exit Row Seat selection',
      'Complimentary Airport FastTrack & Lounge',
      '100% Refundable & Free cancellation',
      '2.0x Double SkyClub Points earning',
      'Priority check-in & boarding',
    ],
  },
};

export const AIRCRAFTS = [
  { model: 'Airbus A350-900 Ultra', code: 'A359', manufacturer: 'Airbus' },
  { model: 'Boeing 787-9 Dreamliner', code: 'B789', manufacturer: 'Boeing' },
  { model: 'Boeing 777-300ER', code: 'B77W', manufacturer: 'Boeing' },
  { model: 'Airbus A380-800 Superjumbo', code: 'A388', manufacturer: 'Airbus' },
  { model: 'Airbus A321neo LR', code: 'A21N', manufacturer: 'Airbus' },
];
