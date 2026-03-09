import * as d3 from "d3";
import type { PollData, DateRange, Party, AxisParams, PollsterGroup, SeriesDescriptor, SeriesDaily, SeriesPoint, ChartOptions, SmoothingMethod } from "../types";
import { buildSeriesData } from "./core/SeriesDataBuilder";
import { axisFrom } from "./core/AxisCalculator";
import { partyData } from "$stores/dataStore";
import { filterByDateRange, filterByPollsterGroup, applyPartyIntervalsFilter } from "./core/PollDataFilter";
import { needsVoxPopuliAdjustment, applyVoxPopuliAdjustment } from "../pollDataAdjustments";

export interface PartySeriesResult {
    data: PollData;
    pointsBySeries: Record<string, SeriesPoint[]>;
    dailyBySeries: Record<string, SeriesDaily[]>;
    axisParams: AxisParams;
    series: SeriesDescriptor[];
    dates: Date[];
    windowDays: number;
}

export function processPartySeries(
    pollData: PollData,
    dateRange: DateRange,
    partyIntervals: Record<Party, [Date, Date][]>,
    selectedParties: Party[],
    selectedPollsterGroup: PollsterGroup,
    options?: ChartOptions
): PartySeriesResult {
    const method: SmoothingMethod = options?.smoothing ?? 'weighted-ma';

    let data = filterByPollsterGroup(pollData, selectedPollsterGroup);
    if (needsVoxPopuliAdjustment(selectedPollsterGroup)) {
        data = applyVoxPopuliAdjustment(data);
    }
    data = filterByDateRange(data, dateRange);
    data = applyPartyIntervalsFilter(data, partyIntervals);

    const windowDays = getWindowDays(data);

    const series: SeriesDescriptor[] = selectedParties.map(p => ({
        id: p,
        label: partyData[p].name,
        color: partyData[p].color,
        kind: 'party',
    }));

    const getValueForSeries = (s: SeriesDescriptor, poll: any) => poll[s.id as Party] as number | undefined;
    const filterForSeries = (_s: SeriesDescriptor, _poll: any) => true;

    const { pointsBySeries, dailyBySeries, dates } = buildSeriesData(
        data,
        series,
        getValueForSeries,
        filterForSeries,
        method,
        windowDays
    );

    const axisParams = axisFrom(dailyBySeries, dateRange, options?.yLims, false);

    return { data, pointsBySeries, dailyBySeries, axisParams, series, dates, windowDays };
}

function getWindowDays(data: PollData): number {
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    const dateExtent = d3.extent(data, (d) => d.date) as [Date | undefined, Date | undefined];
    return (dateExtent[0] && dateExtent[1] && (dateExtent[1].getTime() - dateExtent[0].getTime()) < 2 * oneYear) ? 30 : 60;
}
