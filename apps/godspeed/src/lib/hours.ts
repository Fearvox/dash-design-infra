/* hours.ts — "is godspeed open right now?" logic.
 *
 * single source of truth for hours is content/hours.json.
 * times are stored as 24h "HH:MM" strings; the timezone is fixed to
 * America/New_York (Columbia, SC) and DST is handled via Intl.DateTimeFormat.
 *
 * the only thing pages render directly from this module is getOpenStatus(now, hours)
 * which returns a small struct describing the current state and the next change.
 */

export type Day =
  | "sunday" | "monday" | "tuesday" | "wednesday"
  | "thursday" | "friday" | "saturday";

export const DAYS: readonly Day[] = [
  "sunday", "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday",
];

export interface HoursWindow {
  /** "HH:MM" 24h local time, e.g. "08:00" */
  open: string;
  /** "HH:MM" 24h local time, e.g. "15:00" */
  close: string;
}

export interface HoursConfig {
  /** IANA tz identifier, e.g. "America/New_York" */
  timezone: string;
  /** keyed by lowercase day name. null = closed all day. */
  schedule: Record<Day, HoursWindow | null>;
  /** ISO-date strings (YYYY-MM-DD in local tz) that override the regular schedule. */
  holidays?: Record<string, HoursWindow | null>;
}

export type OpenStatus =
  | { open: true; label: string; closesAt: string; window: HoursWindow }
  | { open: false; label: string; reason: "outside-hours" | "closed-today" | "holiday";
      next?: { day: Day; opensAt: string } };

/** Internal: format a Date as a "HH:MM" string in the configured tz. */
function timeInZone(d: Date, tz: string): string {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  // en-US 24h sometimes returns "24:05" for midnight; normalize that.
  const parts = fmt.formatToParts(d);
  const hourPart = parts.find(p => p.type === "hour")?.value ?? "00";
  const minutePart = parts.find(p => p.type === "minute")?.value ?? "00";
  const hh = hourPart === "24" ? "00" : hourPart;
  return `${hh}:${minutePart}`;
}

/** Internal: get the local-tz day-of-week (lowercase). */
function dayInZone(d: Date, tz: string): Day {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "long",
  });
  return fmt.format(d).toLowerCase() as Day;
}

/** Internal: get the local-tz date string YYYY-MM-DD. */
function dateInZone(d: Date, tz: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d);
}

/** "08:00" → 480 (minutes from midnight). */
export function hmToMinutes(hm: string): number {
  const parts = hm.split(":");
  if (parts.length !== 2) throw new Error(`bad time string: ${hm}`);
  const hh = parts[0]!;
  const mm = parts[1]!;
  const h = Number.parseInt(hh, 10);
  const m = Number.parseInt(mm, 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    throw new Error(`bad time string: ${hm}`);
  }
  return h * 60 + m;
}

/** "08:00" → "8a", "15:00" → "3p", "09:30" → "9:30a" */
export function prettyTime(hm: string): string {
  const mins = hmToMinutes(hm);
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h24 < 12 ? "a" : "p";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${m.toString().padStart(2, "0")}${ampm}`;
}

function nextDayIndex(idx: number): number {
  return (idx + 1) % 7;
}

/** Returns the next day (and its opening time) that has hours. Caps at 7 days. */
function findNextOpenDay(hours: HoursConfig, fromIdx: number): { day: Day; opensAt: string } | undefined {
  for (let step = 1; step <= 7; step += 1) {
    const idx = (fromIdx + step) % 7;
    const dayName = DAYS[idx]!;
    const win = hours.schedule[dayName];
    if (win) return { day: dayName, opensAt: win.open };
  }
  return undefined;
}

/**
 * Returns the current open status against the schedule.
 *
 * design: pure function. caller passes `now`; we never read Date.now() ourselves
 * so tests can drive arbitrary times.
 */
export function getOpenStatus(now: Date, hours: HoursConfig): OpenStatus {
  const tz = hours.timezone;
  const today = dayInZone(now, tz);
  const todayIdx = DAYS.indexOf(today);
  const dateKey = dateInZone(now, tz);
  const nowMin = hmToMinutes(timeInZone(now, tz));

  // holiday override takes precedence
  const holidayWin = hours.holidays?.[dateKey];
  if (holidayWin === null) {
    const next = findNextOpenDay(hours, todayIdx);
    return {
      open: false,
      reason: "holiday",
      label: next
        ? `closed today (holiday) · opens ${next.day} ${prettyTime(next.opensAt)}`
        : "closed today (holiday)",
      next,
    };
  }
  const win = holidayWin ?? hours.schedule[today];

  if (!win) {
    const next = findNextOpenDay(hours, todayIdx);
    return {
      open: false,
      reason: "closed-today",
      label: next
        ? `closed today · opens ${next.day} ${prettyTime(next.opensAt)}`
        : "closed today",
      next,
    };
  }

  const openMin = hmToMinutes(win.open);
  const closeMin = hmToMinutes(win.close);

  if (nowMin >= openMin && nowMin < closeMin) {
    return {
      open: true,
      label: `open now · closes ${prettyTime(win.close)}`,
      closesAt: win.close,
      window: win,
    };
  }

  if (nowMin < openMin) {
    return {
      open: false,
      reason: "outside-hours",
      label: `closed · opens ${prettyTime(win.open)} today`,
      next: { day: today, opensAt: win.open },
    };
  }

  // past close: find next open day
  const next = findNextOpenDay(hours, todayIdx);
  return {
    open: false,
    reason: "outside-hours",
    label: next
      ? `closed · opens ${next.day} ${prettyTime(next.opensAt)}`
      : "closed",
    next,
  };
}

/** Sanity-check a HoursConfig at build time. Throws on malformed data. */
export function validateHours(h: unknown): asserts h is HoursConfig {
  if (typeof h !== "object" || h === null) {
    throw new Error("hours.json: root must be an object");
  }
  const obj = h as Record<string, unknown>;
  if (typeof obj.timezone !== "string") {
    throw new Error("hours.json: timezone (string) required");
  }
  if (typeof obj.schedule !== "object" || obj.schedule === null) {
    throw new Error("hours.json: schedule (object) required");
  }
  const sched = obj.schedule as Record<string, unknown>;
  for (const d of DAYS) {
    if (!(d in sched)) {
      throw new Error(`hours.json: schedule.${d} missing (use null for closed)`);
    }
    const w = sched[d];
    if (w === null) continue;
    if (typeof w !== "object" || w === null) {
      throw new Error(`hours.json: schedule.${d} must be null or {open, close}`);
    }
    const win = w as Record<string, unknown>;
    if (typeof win.open !== "string" || typeof win.close !== "string") {
      throw new Error(`hours.json: schedule.${d}.open/close must be "HH:MM" strings`);
    }
    if (!/^\d{2}:\d{2}$/.test(win.open) || !/^\d{2}:\d{2}$/.test(win.close)) {
      throw new Error(`hours.json: schedule.${d} times must be "HH:MM" 24h format`);
    }
    if (hmToMinutes(win.open) >= hmToMinutes(win.close)) {
      throw new Error(`hours.json: schedule.${d} open must be before close`);
    }
  }
}
