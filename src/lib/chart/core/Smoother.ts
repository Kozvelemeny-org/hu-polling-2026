import * as d3 from "d3";
import type { SeriesDaily, SeriesPoint, SmoothingMethod } from "../../types";

export type { SmoothingMethod };

const DAY_MS = 24 * 60 * 60 * 1000;
const TIME_DECAY_COEF = 1.216762;
const BASE_ERROR = (1.564002 + 2.667455 + 2.294555 + 2.354054) / 4;
const DEFAULT_ERROR_OFFSET = 0.3407105;
const KPM_ERROR_OFFSET = 0.6646872;

const POLLSTER_ERROR_OFFSET: Record<string, number> = {
    '21 Kutató': 0,
    'Medián': 0,
    'Závecz RI': 0.5082610,
    'Iránytű': 1.1661255,
    'Publicus': 1.8555404,
    'Republikon': 1.8320237,
    'IDEA': 0.7968068,
    'e-benchmark': KPM_ERROR_OFFSET,
    'Századvég': KPM_ERROR_OFFSET,
    'Nézőpont': KPM_ERROR_OFFSET,
    'Alapjogokért Központ': KPM_ERROR_OFFSET,
    'Real-PR 93': KPM_ERROR_OFFSET,
    'Társadalomkutató': KPM_ERROR_OFFSET,
};

export function smoothSeries(
    dates: Date[],
    points: SeriesPoint[],
    method: SmoothingMethod,
    windowDays: number
): SeriesDaily[] {
    if (method === 'weighted-ma') return weightedPollOfPolls(points, dates, windowDays);
    return movingAverage(points, dates, windowDays);
}

function movingAverage(points: SeriesPoint[], dates: Date[], windowDays: number): SeriesDaily[] {
    if (!points.length || !dates.length) return [];

    const data = points
        .map((p) => ({
            date: p.date,
            value: Number(p.value),
        }))
        .filter((p) => Number.isFinite(p.value));

    const result: SeriesDaily[] = [];

    for (const date of dates) {
        const windowStart = date.getTime() - windowDays * DAY_MS;
        const windowEnd = date.getTime();
        const within = data.filter(d => d.date.getTime() >= windowStart && d.date.getTime() <= windowEnd);
        const values = within.map(d => d.value);
        const avg = d3.mean(values);
        const hasCenter = avg !== undefined && within.length > 0 && avg !== 0;
        if (!hasCenter) {
            result.push({ date, value: undefined, lo: undefined, hi: undefined, sd: undefined });
            continue;
        }
        result.push({
            date,
            value: avg,
            lo: unweightedQuantile(values, 0.025),
            hi: unweightedQuantile(values, 0.975),
            sd: d3.deviation(values),
        });
    }

    return result;
}


function weightedPollOfPolls(points: SeriesPoint[], dates: Date[], windowDays: number): SeriesDaily[] {
    if (!points.length || !dates.length) return [];

    const lagMs = windowDays * DAY_MS;
    const data = points
        .map((p) => {
            const numericValue = Number(p.value);
            return {
                date: p.date,
                value: numericValue,
                pollster: p.pollster ?? "unknown",
            };
        })
        .filter((p) => Number.isFinite(p.value));

    const result: SeriesDaily[] = [];

    for (const date of dates) {
        const targetTime = date.getTime();
        const windowStart = targetTime - lagMs;
        const within = data.filter(p => p.date.getTime() > windowStart && p.date.getTime() <= targetTime);

        if (!within.length) {
            result.push({ date, value: undefined, lo: undefined, hi: undefined, sd: undefined });
            continue;
        }

        const rowsPerPoll = new Map<string, number>();
        const uniquePollKeysByPollster = new Map<string, Set<string>>();

        for (const point of within) {
            const pollDay = point.date.toISOString().slice(0, 10);
            const pollKey = `${point.pollster}__${pollDay}`;
            rowsPerPoll.set(pollKey, (rowsPerPoll.get(pollKey) ?? 0) + 1);

            const pollKeys = uniquePollKeysByPollster.get(point.pollster) ?? new Set<string>();
            pollKeys.add(pollKey);
            uniquePollKeysByPollster.set(point.pollster, pollKeys);
        }

        const rawWeights = within.map((point) => {
            const pollDay = point.date.toISOString().slice(0, 10);
            const pollKey = `${point.pollster}__${pollDay}`;
            const rowsInPoll = rowsPerPoll.get(pollKey) ?? 1;
            const uniquePollsByPollster = uniquePollKeysByPollster.get(point.pollster)?.size ?? 1;
            const frequencyPenalty = rowsInPoll * uniquePollsByPollster;
            const recencyDecay = TIME_DECAY_COEF * (targetTime - point.date.getTime()) / lagMs;
            const accuracyPenalty = BASE_ERROR + (POLLSTER_ERROR_OFFSET[point.pollster] ?? DEFAULT_ERROR_OFFSET);
            return 1 / ((recencyDecay + accuracyPenalty) * frequencyPenalty);
        });

        const meanRawWeight = d3.mean(rawWeights);
        if (meanRawWeight === undefined || meanRawWeight <= 0) {
            result.push({ date, value: undefined, lo: undefined, hi: undefined, sd: undefined });
            continue;
        }

        const normalizedWeights = rawWeights.map(w => w / meanRawWeight);
        const values = within.map(point => point.value);

        if (d3.mean(values) == 0) {
            result.push({ date, value: undefined, lo: undefined, hi: undefined, sd: undefined });
            continue;
        }

        const weightedValueSum = d3.sum(within, (point, i) => point.value * normalizedWeights[i]);
        const normalizedWeightSum = d3.sum(normalizedWeights);
        const weightedMean = normalizedWeightSum > 0 ? weightedValueSum / normalizedWeightSum : undefined;
        result.push({
            date,
            value: weightedMean,
            lo: weightedQuantile(values, normalizedWeights, 0.025),
            hi: weightedQuantile(values, normalizedWeights, 0.975),
            sd: weightedStandardDeviation(values, normalizedWeights),
        });
    }

    return result;
}

function unweightedQuantile(values: number[], p: number): number | undefined {
    if (!values.length) return undefined;
    const sorted = [...values].sort((a, b) => a - b);
    if (sorted.length === 1) return sorted[0];

    const h = (sorted.length - 1) * p + 1;
    const j = Math.floor(h);
    const g = h - j;
    if (j <= 1) return sorted[0];
    if (j >= sorted.length) return sorted[sorted.length - 1];
    const lower = sorted[j - 1];
    const upper = sorted[j];
    return (1 - g) * lower + g * upper;
}

function weightedQuantile(values: number[], weights: number[], p: number): number | undefined {
    if (!values.length || values.length !== weights.length) return undefined;
    if (!Number.isFinite(p)) return undefined;

    const entries = values
        .map((value, i) => ({ value, weight: weights[i] }))
        .filter(entry => Number.isFinite(entry.value) && Number.isFinite(entry.weight) && entry.weight > 0)
        .sort((a, b) => a.value - b.value);

    if (!entries.length) return undefined;
    if (entries.length === 1) return entries[0].value;

    const totalWeight = d3.sum(entries, e => e.weight);
    if (totalWeight <= 0) return undefined;
    if (p <= 0) return entries[0].value;
    if (p >= 1) return entries[entries.length - 1].value;

    const target = p * totalWeight;
    let cumulativeWeight = 0;
    let previousValue = entries[0].value;
    for (const entry of entries) {
        const nextCumulativeWeight = cumulativeWeight + entry.weight;
        if (target <= nextCumulativeWeight) {
            if (nextCumulativeWeight === cumulativeWeight) return entry.value;
            const fraction = (target - cumulativeWeight) / (nextCumulativeWeight - cumulativeWeight);
            return previousValue + fraction * (entry.value - previousValue);
        }
        cumulativeWeight = nextCumulativeWeight;
        previousValue = entry.value;
    }
    return entries[entries.length - 1].value;
}

function weightedStandardDeviation(values: number[], weights: number[]): number | undefined {
    if (!values.length || values.length !== weights.length) return undefined;

    const entries = values
        .map((value, i) => ({ value, weight: weights[i] }))
        .filter(entry => Number.isFinite(entry.value) && Number.isFinite(entry.weight) && entry.weight > 0);

    if (!entries.length) return undefined;
    if (entries.length === 1) return 0;
    const totalWeight = d3.sum(entries, e => e.weight);
    if (totalWeight <= 0) return undefined;

    const mean = d3.sum(entries, e => e.value * e.weight) / totalWeight;
    const squaredDeviationSum = d3.sum(entries, e => e.weight * Math.pow(e.value - mean, 2));
    const weightSquaresSum = d3.sum(entries, e => e.weight * e.weight);
    const varianceDenominator = totalWeight - (weightSquaresSum / totalWeight);
    if (!Number.isFinite(varianceDenominator) || varianceDenominator <= 0) return 0;
    return Math.sqrt(squaredDeviationSum / varianceDenominator);
}
