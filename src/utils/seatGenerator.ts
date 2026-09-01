import { CabinClass, Seat } from '../types';

export function generateSeatMap(cabinClass: CabinClass): Seat[] {
  const seats: Seat[] = [];

  if (cabinClass === 'first') {
    // 1-2-1 layout, rows 1 to 2
    const columns = ['A', 'E', 'F', 'K'];
    for (let r = 1; r <= 2; r++) {
      columns.forEach((col) => {
        const isOccupied = (r === 1 && col === 'A') || (r === 2 && col === 'E');
        seats.push({
          id: `seat_first_${r}${col}`,
          number: `${r}${col}`,
          row: r,
          column: col,
          cabinClass: 'first',
          type: col === 'A' || col === 'K' ? 'window' : 'aisle',
          isAvailable: !isOccupied,
          extraLegroom: true,
          price: 0, // Included in First
        });
      });
    }
  } else if (cabinClass === 'business') {
    // 1-2-1 direct aisle access, rows 1 to 6
    const columns = ['A', 'D', 'G', 'K'];
    for (let r = 1; r <= 6; r++) {
      columns.forEach((col) => {
        const isOccupied = (r === 2 && col === 'A') || (r === 4 && col === 'D') || (r === 5 && col === 'K');
        seats.push({
          id: `seat_biz_${r}${col}`,
          number: `${r}${col}`,
          row: r,
          column: col,
          cabinClass: 'business',
          type: col === 'A' || col === 'K' ? 'window' : 'aisle',
          isAvailable: !isOccupied,
          extraLegroom: true,
          price: 0, // Free selection for business
        });
      });
    }
  } else if (cabinClass === 'premium_economy') {
    // 2-3-2 layout, rows 10 to 14
    const columns = ['A', 'C', 'D', 'E', 'F', 'H', 'K'];
    for (let r = 10; r <= 14; r++) {
      columns.forEach((col) => {
        const isOccupied = Math.random() < 0.35;
        const isExit = r === 10;
        seats.push({
          id: `seat_prem_${r}${col}`,
          number: `${r}${col}`,
          row: r,
          column: col,
          cabinClass: 'premium_economy',
          type: col === 'A' || col === 'K' ? 'window' : col === 'E' ? 'middle' : 'aisle',
          isAvailable: !isOccupied,
          isExitRow: isExit,
          extraLegroom: isExit,
          price: isExit ? 25 : 0,
        });
      });
    }
  } else {
    // Economy 3-3-3 layout, rows 20 to 35
    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'J', 'K'];
    for (let r = 20; r <= 32; r++) {
      columns.forEach((col) => {
        const isOccupied = (r % 2 === 0 && col === 'B') || (r % 3 === 0 && col === 'A') || (r === 24 && col === 'E');
        const isExit = r === 25;
        const isFront = r <= 22;
        seats.push({
          id: `seat_eco_${r}${col}`,
          number: `${r}${col}`,
          row: r,
          column: col,
          cabinClass: 'economy',
          type: col === 'A' || col === 'K' ? 'window' : col === 'B' || col === 'E' || col === 'J' ? 'middle' : 'aisle',
          isAvailable: !isOccupied,
          isExitRow: isExit,
          extraLegroom: isExit || isFront,
          price: isExit ? 35 : isFront ? 20 : 0,
        });
      });
    }
  }

  return seats;
}
