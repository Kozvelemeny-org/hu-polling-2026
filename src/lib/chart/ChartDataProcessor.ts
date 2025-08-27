import * as d3 from "d3";
import type { PollData, DateRange, Party, AxisParams, DayData, PollsterGroup } from "../types";
import { filterByDateRange, filterByPollsterGroup, applyPartyIntervalsFilter } from "./core/PollDataFilter";
import { smoothSeries, type SmoothingMethod } from "./core/Smoother";

export class ChartDataProcessor {
    private pollData: PollData;
    private dateRange: DateRange;
    private partyIntervals: Record<Party, [Date, Date][]>;
    private selectedParties: Party[];
    private selectedPollsterGroup: PollsterGroup;
    private renderOptions: Record<string, unknown> | undefined;

    constructor(
        pollData: PollData, 
        dateRange: DateRange, 
        partyIntervals: Record<Party, [Date, Date][]>, 
        selectedParties: Party[], 
        selectedPollsterGroup: PollsterGroup,
        renderOptions?: Record<string, unknown> | undefined
    ) {
        this.pollData = pollData;
        this.dateRange = dateRange;     
        this.partyIntervals = partyIntervals;
        this.selectedParties = selectedParties;
        this.selectedPollsterGroup = selectedPollsterGroup;
        this.renderOptions = renderOptions;
    }

    public getAxisParams(dailyData: DayData[], hasAnnotations = false): AxisParams {
        const millisPerDay = 1000 * 60 * 60 * 24;
        const dateDiff = (this.dateRange.end.getTime() - this.dateRange.start.getTime()) / millisPerDay;
    
        const xTickLevel = dateDiff > (3 * 365) ? "year" : dateDiff > (365 / 2) ? "quarter" : "month";
        const possibleYTicks = [0, .1, .2, .3, .4, .5, .6, .7, .8, .9];
        
        const allValues = dailyData.flatMap(d =>
            Object.values(d).filter(value => typeof value === "number") as number[]
        );
    
        if (allValues.length === 0) return { xTickLevel, yLims: [0, 1], ticks: possibleYTicks, dateRange: this.dateRange };
    
        const minValue = Math.min(...allValues);
        const maxValue = Math.max(...allValues);

        const annotationPadding = hasAnnotations ? 0.1 : 0;
    
        const lowerLimit = this.renderOptions?.yLims ? 
            (this.renderOptions['yLims'] as [number, number])[0] : 0;
        const upperLimit = this.renderOptions?.yLims ? 
            (this.renderOptions['yLims'] as [number, number])[1] :
            (possibleYTicks.find(curr => curr >= maxValue) ?? 0.95) + 0.05 + annotationPadding;
    
        const ticks = possibleYTicks.filter(tick => tick >= lowerLimit && tick <= upperLimit);
    
        return { xTickLevel, yLims: [+lowerLimit.toFixed(2), +upperLimit.toFixed(2)], ticks, dateRange: this.dateRange };
    }

    public processData(): [PollData, DayData[], number] {
        const method: SmoothingMethod = (this.renderOptions?.smoothing === "lowess") ? 'lowess' : 'ma';

        let data = filterByPollsterGroup(this.pollData, this.selectedPollsterGroup);
        data = filterByDateRange(data, this.dateRange);
        data = applyPartyIntervalsFilter(data, this.partyIntervals);

        const dateExtent = d3.extent(data, (d) => d.date) as [Date, Date];
        const windowDays = dateExtent[1].getTime() - dateExtent[0].getTime() < 2 * 365 * 24 * 60 * 60 * 1000 ? 30 : 90;
        const dates = d3.timeDay.range(dateExtent[0], dateExtent[1]);

        const daily: DayData[] = dates.map(date => ({ date }));

        for (const party of this.selectedParties) {
            const points = data
                .filter(d => d[party] !== undefined && d[party] !== null && d[party] > 0.01)
                .map(d => ({ date: d.date, value: d[party] as number }));

            const smoothed = smoothSeries(dates, points, method, windowDays);
            smoothed.forEach((s, i) => {
                daily[i][party] = s.value;
            });
        }

        return [data, daily, windowDays];
    }

}