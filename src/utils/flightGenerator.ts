import { Airport, Flight, FlightSearchParams, FlightSegment } from '../types';
import { AIRLINES, AIRCRAFTS } from '../data/flights';
import { AIRPORTS } from '../data/airports';

// Approximate distance heuristics (km)
const APPROX_COORDINATES: Record<string, { lat: number; lng: number }> = {
  DXB: { lat: 25.2532, lng: 55.3657 },
  LHR: { lat: 51.4700, lng: -0.4543 },
  JFK: { lat: 40.6413, lng: -73.7781 },
  IST: { lat: 41.2753, lng: 28.7519 },
  SIN: { lat: 1.3644, lng: 103.9915 },
  DOH: { lat: 25.2731, lng: 51.6081 },
  KHI: { lat: 24.9065, lng: 67.1608 },
  ISB: { lat: 33.5494, lng: 72.8256 },
  CDG: { lat: 49.0097, lng: 2.5479 },
  HND: { lat: 35.5494, lng: 139.7798 },
  SYD: { lat: -33.9399, lng: 151.1753 },
  FRA: { lat: 50.0379, lng: 8.5622 },
  RUH: { lat: 24.9576, lng: 46.6988 },
  CAI: { lat: 30.1219, lng: 31.4056 },
  YYZ: { lat: 43.6777, lng: -79.6248 },
  BKK: { lat: 13.6900, lng: 100.7501 },
  KUL: { lat: 2.7456, lng: 101.7072 },
  LAX: { lat: 33.9416, lng: -118.4085 },
};

function calculateDistanceKm(c1: { lat: number; lng: number }, c2: { lat: number; lng: number }): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getFlightDurationMinutes(origin: Airport, dest: Airport): number {
  const coord1 = APPROX_COORDINATES[origin.code] || { lat: 25, lng: 55 };
  const coord2 = APPROX_COORDINATES[dest.code] || { lat: 51, lng: 0 };
  const distance = calculateDistanceKm(coord1, coord2);
  
  // Average commercial jet cruise speed ~850 km/h + 35 mins taxi/climb
  const cruiseHours = distance / 820;
  const totalMinutes = Math.round(cruiseHours * 60 + 35);
  return Math.max(90, totalMinutes);
}

function addMinutesToTime(timeStr: string, minutesToAdd: number): { time: string; dayOffset: number } {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutesToAdd;
  const dayOffset = Math.floor(totalMinutes / (24 * 60));
  const remainingMinutes = totalMinutes % (24 * 60);
  const newH = Math.floor(remainingMinutes / 60);
  const newM = remainingMinutes % 60;
  return {
    time: `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`,
    dayOffset,
  };
}

function addDaysToDateString(dateStr: string, daysToAdd: number): string {
  if (daysToAdd === 0) return dateStr;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + daysToAdd);
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
}

export function generateFlightsForRoute(
  origin: Airport,
  destination: Airport,
  departureDate: string,
  _params?: Partial<FlightSearchParams>
): Flight[] {
  const baseDuration = getFlightDurationMinutes(origin, destination);
  const coord1 = APPROX_COORDINATES[origin.code] || { lat: 25, lng: 55 };
  const coord2 = APPROX_COORDINATES[destination.code] || { lat: 51, lng: 0 };
  const distanceKm = calculateDistanceKm(coord1, coord2);

  // Base price calculation linked to distance (reasonable airline pricing)
  // e.g. 2000 km -> ~$280, 5500 km -> ~$480, 11000 km -> ~$890
  const calculatedEcoPrice = Math.max(
    195,
    Math.round(110 + distanceKm * 0.068)
  );

  // Define 6 distinct flight schedules with varying airlines, times, aircrafts, and stops
  const schedules = [
    {
      flightNumber: 'HW-302',
      airline: AIRLINES[0], // Hawa Airways Flagship
      depTime: '07:45',
      durationOffset: 0,
      stops: 0,
      aircraft: AIRCRAFTS[0], // A350-900
      priceModifier: 1.0,
      availableEco: 8,
      availableBiz: 4,
      onTime: 98,
      isFlagship: true,
    },
    {
      flightNumber: 'HW-708',
      airline: AIRLINES[0], // Hawa Airways
      depTime: '13:20',
      durationOffset: 10,
      stops: 0,
      aircraft: AIRCRAFTS[1], // B787-9 Dreamliner
      priceModifier: 1.05,
      availableEco: 14,
      availableBiz: 6,
      onTime: 96,
      isFlagship: true,
    },
    {
      flightNumber: 'EK-029',
      airline: AIRLINES[1], // Emirates
      depTime: '09:40',
      durationOffset: -5,
      stops: 0,
      aircraft: AIRCRAFTS[3], // A380 Superjumbo
      priceModifier: 1.15,
      availableEco: 5,
      availableBiz: 2,
      onTime: 94,
    },
    {
      flightNumber: 'QR-144',
      airline: AIRLINES[2], // Qatar Airways
      depTime: '16:50',
      durationOffset: 110, // 1 stop
      stops: 1,
      layoverAirportCode: 'DOH',
      layoverDuration: 85,
      aircraft: AIRCRAFTS[0],
      priceModifier: 0.88, // Cheaper because 1-stop
      availableEco: 19,
      availableBiz: 5,
      onTime: 92,
    },
    {
      flightNumber: 'TK-761',
      airline: AIRLINES[4], // Turkish Airlines
      depTime: '11:15',
      durationOffset: 130, // 1 stop
      stops: 1,
      layoverAirportCode: 'IST',
      layoverDuration: 105,
      aircraft: AIRCRAFTS[2], // B777
      priceModifier: 0.84, // Great value
      availableEco: 12,
      availableBiz: 3,
      onTime: 90,
    },
    {
      flightNumber: 'HW-944',
      airline: AIRLINES[0], // Hawa Airways Night Express
      depTime: '22:30',
      durationOffset: -10,
      stops: 0,
      aircraft: AIRCRAFTS[1], // B787 Dreamliner
      priceModifier: 0.94,
      availableEco: 3, // Low seats alert!
      availableBiz: 1,
      onTime: 97,
      isFlagship: true,
    },
  ];

  const flights: Flight[] = schedules.map((sch, idx) => {
    const flightDuration = baseDuration + sch.durationOffset;
    const { time: arrTime, dayOffset } = addMinutesToTime(sch.depTime, flightDuration);
    const arrivalDate = addDaysToDateString(departureDate, dayOffset);

    // Compute prices for all cabin classes
    const ecoPrice = Math.round(calculatedEcoPrice * sch.priceModifier);
    const premEcoPrice = Math.round(ecoPrice * 1.85);
    const bizPrice = Math.round(ecoPrice * 3.8);
    const firstPrice = Math.round(ecoPrice * 7.5);

    // Build segments if 1-stop
    const segments: FlightSegment[] = [];
    let stopDetails = undefined;

    if (sch.stops === 1) {
      const layoverAirport =
        AIRPORTS.find((a) => a.code === sch.layoverAirportCode) || AIRPORTS[5]; // DOH or IST
      const leg1Duration = Math.round(flightDuration * 0.45);
      const leg2Duration = flightDuration - leg1Duration - (sch.layoverDuration || 90);

      const leg1Arrival = addMinutesToTime(sch.depTime, leg1Duration);
      const leg2DepTime = addMinutesToTime(
        leg1Arrival.time,
        sch.layoverDuration || 90
      ).time;

      segments.push({
        departureAirport: origin,
        arrivalAirport: layoverAirport,
        departureTime: sch.depTime,
        arrivalTime: leg1Arrival.time,
        durationMinutes: leg1Duration,
        flightNumber: sch.flightNumber,
        airline: sch.airline,
        aircraft: sch.aircraft,
        layoverDurationMinutes: sch.layoverDuration || 90,
      });

      segments.push({
        departureAirport: layoverAirport,
        arrivalAirport: destination,
        departureTime: leg2DepTime,
        arrivalTime: arrTime,
        durationMinutes: leg2Duration,
        flightNumber: `${sch.airline.code}-${Math.floor(200 + Math.random() * 700)}`,
        airline: sch.airline,
        aircraft: sch.aircraft,
      });

      stopDetails = [
        {
          airport: layoverAirport,
          durationMinutes: sch.layoverDuration || 90,
        },
      ];
    } else {
      segments.push({
        departureAirport: origin,
        arrivalAirport: destination,
        departureTime: sch.depTime,
        arrivalTime: arrTime,
        durationMinutes: flightDuration,
        flightNumber: sch.flightNumber,
        airline: sch.airline,
        aircraft: sch.aircraft,
      });
    }

    const co2Avg = Math.round(distanceKm * 0.082);
    const co2Pct = sch.aircraft.code === 'A359' || sch.aircraft.code === 'B789' ? -18 : -6;

    return {
      id: `fl_${origin.code}_${destination.code}_${idx}_${departureDate}`,
      flightNumber: sch.flightNumber,
      airline: sch.airline,
      departureAirport: origin,
      arrivalAirport: destination,
      departureDate,
      departureTime: sch.depTime,
      arrivalDate,
      arrivalTime: arrTime,
      durationMinutes: flightDuration,
      stops: sch.stops,
      stopDetails,
      segments,
      aircraft: {
        model: sch.aircraft.model,
        code: sch.aircraft.code,
      },
      basePrices: {
        economy: ecoPrice,
        premium_economy: premEcoPrice,
        business: bizPrice,
        first: firstPrice,
      },
      availableSeats: {
        economy: sch.availableEco,
        premium_economy: Math.max(3, Math.round(sch.availableEco / 2)),
        business: sch.availableBiz,
        first: Math.max(1, Math.round(sch.availableBiz / 2)),
      },
      amenities: {
        wifi: true,
        powerOutlets: true,
        inFlightMeal: true,
        entertainmentScreen: true,
        usbPorts: true,
        lieFlatSeats: true, // In business/first
        liveTv: sch.airline.code === 'HW' || sch.airline.code === 'EK',
      },
      onTimePerformance: sch.onTime,
      co2EmissionsKg: co2Avg,
      co2DifferencePct: co2Pct,
    };
  });

  return flights;
}
