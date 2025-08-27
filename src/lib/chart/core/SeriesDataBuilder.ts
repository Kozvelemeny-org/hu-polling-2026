import * as d3 from "d3";
import type { Poll, PollData, SeriesDaily, SeriesDescriptor, SeriesPoint } from "../../types";
import { smoothSeries, type SmoothingMethod } from "./Smoother";

export function buildSeriesData(
    pollData: PollData,
    series: SeriesDescriptor[],
    getValueForSeries: (series: SeriesDescriptor, poll: Poll) => number | undefined,
    filterForSeries: (series: SeriesDescriptor, poll: Poll) => boolean,
    method: SmoothingMethod,
    windowDays: number,
    dates?: Date[]
): {
    pointsBySeries: Record<string, SeriesPoint[]>;
    dailyBySeries: Record<string, SeriesDaily[]>;
    dates: Date[];
} {
    const pointsBySeries: Record<string, SeriesPoint[]> = {};
    for (const s of series) {
        const points: SeriesPoint[] = pollData
            .filter(p => filterForSeries(s, p))
            .map((p) => ({ date: p.date, value: getValueForSeries(s, p) }))
            .filter(p => p.value !== undefined);
        pointsBySeries[s.id] = points;
    }

    const dateExtent = d3.extent(pollData, (d) => d.date) as [Date, Date];
    const alignedDates = dates ?? d3.timeDay.range(dateExtent[0], dateExtent[1]);

    const dailyBySeries: Record<string, SeriesDaily[]> = {};
    for (const s of series) {
        dailyBySeries[s.id] = smoothSeries(alignedDates, pointsBySeries[s.id] || [], method, windowDays);
    }

    return { pointsBySeries, dailyBySeries, dates: alignedDates };
}


