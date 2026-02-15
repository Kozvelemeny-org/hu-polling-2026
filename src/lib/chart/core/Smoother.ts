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

    const data = points.map(p => ({ date: p.date, value: p.value }))
        .filter(p => p.value !== undefined && p.value !== null);

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
            result.push({ date, value: undefined });
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
            result.push({ date, value: undefined });
            continue;
        }

        const normalizedWeights = rawWeights.map(w => w / meanRawWeight);
        const weightedValueSum = d3.sum(within, (point, i) => point.value * normalizedWeights[i]);
        const normalizedWeightSum = d3.sum(normalizedWeights);
        result.push({
            date,
            value: normalizedWeightSum > 0 ? weightedValueSum / normalizedWeightSum : undefined,
        });
    }

    return result;
}
