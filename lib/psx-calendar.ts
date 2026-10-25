/* PSX trading days for the order-ticket illustration. Pakistan has no daylight saving, so
   Karachi time is UTC+5 all year. Public holidays are not known here; the UI says so. */

const OPEN = 9 * 60 + 30; // 09:30 PKT
const CLOSE = 15 * 60 + 30; // 15:30 PKT

/** A calendar day in Karachi, as a UTC-midnight Date (use the UTC getters). */
type Day = Date;

const isWeekend = (d: Day) => d.getUTCDay() === 0 || d.getUTCDay() === 6;
const addDays = (d: Day, n: number) => new Date(d.getTime() + n * 86_400_000);
const nextWeekday = (d: Day) => {
  let n = addDays(d, 1);
  while (isWeekend(n)) n = addDays(n, 1);
  return n;
};

export type TradeDates = {
  /** The day the order would be matched. */
  trade: Day;
  /** T+1: the next working day after the trade. */
  settle: Day;
  /** PSX is open right now. */
  open: boolean;
};

export function tradeDates(now = new Date()): TradeDates {
  const pk = new Date(now.getTime() + 5 * 3_600_000);
  const today: Day = new Date(Date.UTC(pk.getUTCFullYear(), pk.getUTCMonth(), pk.getUTCDate()));
  const minutes = pk.getUTCHours() * 60 + pk.getUTCMinutes();
  const tradingToday = !isWeekend(today) && minutes < CLOSE;
  const trade = tradingToday ? today : nextWeekday(today);
  return { trade, settle: nextWeekday(trade), open: tradingToday && minutes >= OPEN };
}

/** "Mon 26 Oct" */
export const dayLabel = (d: Day) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
