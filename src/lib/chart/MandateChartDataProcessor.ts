import type {
    Annotation,
    ChartOptions,
    DateRange,
    MandateProjectionData,
    Party,
    PollData,
    PollsterGroup,
    SeriesDaily,
    SeriesDescriptor,
    SeriesPoint,
} from "../types";
import type { PartySeriesResult } from "./ChartDataProcessor";
import { axisFrom } from "./core/AxisCalculator";
import { filterByDateRange, filterByPollsterGroup } from "./core/PollDataFilter";
import { partyData } from "$stores/dataStore";
import type { HistoricalSimulationScenario } from "../types";

const VALID_PARTIES: Party[] = Object.keys(partyData) as Party[];

/** Throws only on invalid Party keys (e.g. typos in JSON). Parties in the data but not in selectedParties are simply not displayed. */
function assertValidPartyKeys(historicalSimulation: HistoricalSimulationScenario): void {
    const validSet = new Set(VALID_PARTIES);
    for (const dateStr of Object.keys(historicalSimulation)) {
        const byDate = historicalSimulation[dateStr];
        if (!byDate?.mean) continue;
        for (const key of Object.keys(byDate.mean)) {
            if (!validSet.has(key as Party)) {
                throw new Error(`MandateChartDataProcessor: invalid party key in simulation data: "${key}"`);
            }
        }
    }
}

export function processMandateProjectionSeries(
    historicalSimulation: HistoricalSimulationScenario,
    mandateProjectionData: MandateProjectionData,
    dateRange: DateRange,
    selectedParties: Party[],
    selectedPollsterGroup: PollsterGroup,
    renderOptions?: ChartOptions,
    annotations?: Annotation[]
): PartySeriesResult {
    assertValidPartyKeys(historicalSimulation);

    const series: SeriesDescriptor[] = selectedParties.map((p) => ({
        id: p,
        label: partyData[p].name,
        color: partyData[p].color,
        kind: "party",
    }));

    const dateStrs = Object.keys(historicalSimulation).filter((dateStr) => {
        const d = new Date(dateStr);
        return d >= dateRange.start && d <= dateRange.end;
    });
    dateStrs.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const dates = dateStrs.map((s) => new Date(s));

    const dailyBySeries: Record<string, SeriesDaily[]> = {};
    for (const party of selectedParties) {
        dailyBySeries[party] = dates.map((date) => {
            const dateStr = date.toISOString().slice(0, 10);
            const byDate = historicalSimulation[dateStr];
            const value = byDate?.mean?.[party] ?? undefined;
            return { date, value };
        });
    }

    let dotsData = filterByPollsterGroup(mandateProjectionData as unknown as PollData, selectedPollsterGroup);
    dotsData = filterByDateRange(dotsData, dateRange);

    const pointsBySeries: Record<string, SeriesPoint[]> = {};
    for (const party of selectedParties) {
        pointsBySeries[party] = dotsData
            .map((row: { date: Date; pollster: string; [k: string]: unknown }) => ({
                date: row.date,
                value: row[party] as number | undefined,
                pollster: row.pollster,
            }))
            .filter((p) => p.value !== undefined && p.value !== null);
    }

    const axisParams = axisFrom(
        dailyBySeries,
        dateRange,
        renderOptions?.yLims ?? [0, 199],
        !!annotations?.length
    );

    return {
        data: mandateProjectionData as unknown as PollData,
        pointsBySeries,
        dailyBySeries,
        axisParams,
        series,
        dates,
        windowDays: 0,
    };
}
