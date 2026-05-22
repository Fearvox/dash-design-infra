/* hours.test.ts — open/closed logic, DST sanity, formatting.
 *
 * Run with `bun test apps/godspeed/src/lib/hours.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import {
  getOpenStatus,
  hmToMinutes,
  prettyTime,
  validateHours,
  type HoursConfig,
} from "./hours";

const HOURS: HoursConfig = {
  timezone: "America/New_York",
  schedule: {
    sunday:    { open: "09:00", close: "16:00" },
    monday:    null,
    tuesday:   null,
    wednesday: { open: "08:00", close: "15:00" },
    thursday:  { open: "08:00", close: "15:00" },
    friday:    { open: "08:00", close: "15:00" },
    saturday:  { open: "09:00", close: "16:00" },
  },
  holidays: {
    "2026-07-04": null,
    "2026-12-25": null,
  },
};

describe("hmToMinutes / prettyTime", () => {
  test("hmToMinutes basic", () => {
    expect(hmToMinutes("00:00")).toBe(0);
    expect(hmToMinutes("08:00")).toBe(480);
    expect(hmToMinutes("15:30")).toBe(930);
  });

  test("hmToMinutes rejects junk", () => {
    expect(() => hmToMinutes("nope")).toThrow();
    expect(() => hmToMinutes("8")).toThrow();
  });

  test("prettyTime formats lowercase, no leading zero", () => {
    expect(prettyTime("08:00")).toBe("8a");
    expect(prettyTime("15:00")).toBe("3p");
    expect(prettyTime("09:30")).toBe("9:30a");
    expect(prettyTime("12:00")).toBe("12p");
    expect(prettyTime("00:00")).toBe("12a");
  });
});

describe("getOpenStatus — regular schedule", () => {
  test("wed 10:00 ET → open", () => {
    // 2026-05-20 (Wed) 10:00 ET = 14:00 UTC (EDT, UTC-4)
    const now = new Date("2026-05-20T14:00:00Z");
    const r = getOpenStatus(now, HOURS);
    expect(r.open).toBe(true);
    if (r.open) {
      expect(r.label).toBe("open now · closes 3p");
      expect(r.closesAt).toBe("15:00");
    }
  });

  test("wed 07:00 ET → closed, opens 8a today", () => {
    const now = new Date("2026-05-20T11:00:00Z"); // 07:00 EDT
    const r = getOpenStatus(now, HOURS);
    expect(r.open).toBe(false);
    if (!r.open) {
      expect(r.label).toBe("closed · opens 8a today");
      expect(r.reason).toBe("outside-hours");
    }
  });

  test("wed 15:00 ET (right at close) → closed, opens next day", () => {
    const now = new Date("2026-05-20T19:00:00Z"); // 15:00 EDT
    const r = getOpenStatus(now, HOURS);
    expect(r.open).toBe(false);
    if (!r.open) {
      expect(r.label).toContain("opens thursday");
    }
  });

  test("mon 10:00 ET → closed all day, opens wednesday", () => {
    const now = new Date("2026-05-18T14:00:00Z"); // mon 10:00 EDT
    const r = getOpenStatus(now, HOURS);
    expect(r.open).toBe(false);
    if (!r.open) {
      expect(r.reason).toBe("closed-today");
      expect(r.label).toContain("opens wednesday");
    }
  });

  test("tue 10:00 ET → closed all day", () => {
    const now = new Date("2026-05-19T14:00:00Z"); // tue 10:00 EDT
    const r = getOpenStatus(now, HOURS);
    expect(r.open).toBe(false);
    if (!r.open) expect(r.reason).toBe("closed-today");
  });

  test("sat 11:00 ET → open until 4p", () => {
    const now = new Date("2026-05-23T15:00:00Z"); // sat 11:00 EDT
    const r = getOpenStatus(now, HOURS);
    expect(r.open).toBe(true);
    if (r.open) expect(r.label).toBe("open now · closes 4p");
  });

  test("sun 16:00 ET (close moment) → closed, opens next day", () => {
    const now = new Date("2026-05-24T20:00:00Z"); // sun 16:00 EDT
    const r = getOpenStatus(now, HOURS);
    expect(r.open).toBe(false);
  });
});

describe("getOpenStatus — DST transitions", () => {
  // DST in US 2026: starts Sun Mar 8, ends Sun Nov 1.

  test("Sat Mar 7 2026 10:00 EST → open (before DST starts)", () => {
    // 10:00 EST = 15:00 UTC (UTC-5)
    const now = new Date("2026-03-07T15:00:00Z");
    const r = getOpenStatus(now, HOURS);
    expect(r.open).toBe(true);
  });

  test("Sun Mar 8 2026 10:00 EDT → open (DST day, post-shift)", () => {
    // post-shift the local clock skipped 02:00→03:00 EDT. 10:00 EDT = 14:00 UTC.
    const now = new Date("2026-03-08T14:00:00Z");
    const r = getOpenStatus(now, HOURS);
    expect(r.open).toBe(true);
    if (r.open) expect(r.label).toContain("closes 4p");
  });

  test("Sat Oct 31 2026 10:00 EDT → open (last EDT day)", () => {
    // 10:00 EDT = 14:00 UTC
    const now = new Date("2026-10-31T14:00:00Z");
    const r = getOpenStatus(now, HOURS);
    expect(r.open).toBe(true);
  });

  test("Sun Nov 1 2026 10:00 EST → open (post fall-back)", () => {
    // fall-back: 02:00 EDT → 01:00 EST. So 10:00 EST = 15:00 UTC.
    const now = new Date("2026-11-01T15:00:00Z");
    const r = getOpenStatus(now, HOURS);
    expect(r.open).toBe(true);
  });
});

describe("getOpenStatus — holidays", () => {
  test("July 4 2026 (Saturday) → closed for holiday", () => {
    // 10:00 EDT = 14:00 UTC. Without override this would be open.
    const now = new Date("2026-07-04T14:00:00Z");
    const r = getOpenStatus(now, HOURS);
    expect(r.open).toBe(false);
    if (!r.open) {
      expect(r.reason).toBe("holiday");
      expect(r.label).toContain("holiday");
    }
  });

  test("Dec 25 2026 (Friday) → closed for holiday", () => {
    // 10:00 EST (post-Nov-1) = 15:00 UTC.
    const now = new Date("2026-12-25T15:00:00Z");
    const r = getOpenStatus(now, HOURS);
    expect(r.open).toBe(false);
    if (!r.open) expect(r.reason).toBe("holiday");
  });
});

describe("validateHours", () => {
  test("happy path", () => {
    expect(() => validateHours(HOURS)).not.toThrow();
  });

  test("missing day", () => {
    const bad = { timezone: "America/New_York", schedule: { sunday: null } };
    expect(() => validateHours(bad)).toThrow(/schedule\.monday missing/);
  });

  test("bad time string", () => {
    const bad: HoursConfig = {
      ...HOURS,
      schedule: { ...HOURS.schedule, wednesday: { open: "8am", close: "3pm" } } as HoursConfig["schedule"],
    };
    expect(() => validateHours(bad)).toThrow(/HH:MM/);
  });

  test("open after close", () => {
    const bad: HoursConfig = {
      ...HOURS,
      schedule: { ...HOURS.schedule, wednesday: { open: "15:00", close: "08:00" } },
    };
    expect(() => validateHours(bad)).toThrow(/before close/);
  });
});
