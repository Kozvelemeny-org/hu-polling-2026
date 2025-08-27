import type { AxisParams, DateRange, SeriesDaily } from "../../types";

export function axisFrom(
    dailyBySeries: Record<string, SeriesDaily[]>,
    dateRange: DateRange,
    yLimsOverride?: [number, number],
    hasAnnotations = false
): AxisParams {
    const millisPerDay = 1000 * 60 * 60 * 24;
    const dateDiff = (dateRange.end.getTime() - dateRange.start.getTime()) / millisPerDay;
    const xTickLevel = dateDiff > (3 * 365) ? "year" : dateDiff > (365 / 2) ? "quarter" : "month";

    const possibleYTicks = [0, .1, .2, .3, .4, .5, .6, .7, .8, .9];

    const values: number[] = [];
    for (const seriesId of Object.keys(dailyBySeries)) {
        for (const d of dailyBySeries[seriesId]) {
            if (typeof d.value === 'number') values.push(d.value);
        }
    }

    if (values.length === 0) {
        return { xTickLevel, yLims: [0, 1], ticks: possibleYTicks, dateRange };
    }

    const maxValue = Math.max(...values);
    const annotationPadding = hasAnnotations ? 0.1 : 0;

    const lowerLimit = yLimsOverride ? yLimsOverride[0] : 0;
    const upperLimit = yLimsOverride ? yLimsOverride[1] : ((possibleYTicks.find(curr => curr >= maxValue) ?? 0.95) + 0.05 + annotationPadding);

    const ticks = possibleYTicks.filter(tick => tick >= lowerLimit && tick <= upperLimit);

    return { xTickLevel, yLims: [+lowerLimit.toFixed(2), +upperLimit.toFixed(2)], ticks, dateRange };
}


