import * as d3 from "d3";
import type { SeriesDaily, SeriesPoint } from "../../types";

export type SmoothingMethod = 'ma' | 'lowess';

export function smoothSeries(
    dates: Date[],
    points: SeriesPoint[],
    method: SmoothingMethod,
    windowDays: number
): SeriesDaily[] {
    if (method === 'lowess') return lowess(points, dates, windowDays);
    return movingAverage(points, dates, windowDays);
}

function movingAverage(points: SeriesPoint[], dates: Date[], windowDays: number): SeriesDaily[] {
    if (!points.length || !dates.length) return [];

    const data = points.map(p => ({ date: p.date, value: p.value }))
        .filter(p => p.value !== undefined && p.value !== null && (p.value as number) > 0.01);

    const result: SeriesDaily[] = [];

    for (const date of dates) {
        const windowStart = date.getTime() - windowDays * 24 * 60 * 60 * 1000;
        const windowEnd = date.getTime() + windowDays * 24 * 60 * 60 * 1000;
        const within = data.filter(d => d.date.getTime() >= windowStart && d.date.getTime() <= windowEnd);
        const avg = d3.mean(within, d => d.value as number);
        result.push({ date, value: (avg === 0 || within.length < 1) ? undefined : (avg as number) });
    }

    return result;
}

function lowess(points: SeriesPoint[], dates: Date[], windowDays: number): SeriesDaily[] {
    if (!points.length || !dates.length) return [];

    const data = points.map(p => ({ date: p.date, value: p.value }));

    const result: SeriesDaily[] = [];
    for (const date of dates) {
        const weights: number[] = [];
        const localValues: { date: Date; value?: number }[] = [];

        for (const pt of data) {
            const distance = Math.abs(pt.date.getTime() - date.getTime()) / (windowDays * 24 * 60 * 60 * 1000);
            const weight = Math.exp(-Math.pow(distance, 2));
            weights.push(weight);
            localValues.push({ date: pt.date, value: pt.value });
        }

        const weightedValues = localValues
            .map((point, i) => (point.value ? point.value * weights[i] : 0))
            .filter(v => v > 0);

        const weightSum = weights.reduce((a, b) => a + b, 0);
        const avg = weightedValues.length > 0 ? weightedValues.reduce((a, b) => a + b, 0) / weightSum : undefined;

        result.push({ date, value: avg });
    }
    return result;
}


