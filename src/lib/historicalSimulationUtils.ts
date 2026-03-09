import type { HistoricalSimulationScenario } from "./types";

/** Format a date as YYYY-MM-DD (local time) to match keys in historicalSimulationData.json */
export function dateToKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/** Add days to a date without mutating; returns a new Date. */
export function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

/** Get the Sunday on or before the given date (local time). */
function getSundayOnOrBefore(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    if (day !== 0) d.setDate(d.getDate() - day);
    return d;
}

/** Get the next Sunday, or the same day if it is already Sunday. */
export function getNextOrTodaySunday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    if (day === 0) return d;
    d.setDate(d.getDate() + (7 - day));
    return d;
}

/**
 * Find the most recent Sunday that has projection data on or before the given date.
 * If the Sunday for the given date has no data (no new polls that week), walks back
 * week by week until it finds a date that exists as a key in the scenario data.
 */
export function findPreviousSundayWithData(
    date: Date,
    scenarioData: HistoricalSimulationScenario
): Date {
    let sunday = getSundayOnOrBefore(new Date(date));
    const maxWeeks = 104;
    for (let i = 0; i < maxWeeks; i++) {
        if (dateToKey(sunday) in scenarioData) return new Date(sunday);
        sunday.setDate(sunday.getDate() - 7);
    }
    return new Date(sunday);
}
