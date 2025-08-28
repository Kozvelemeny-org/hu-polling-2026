import type { DateRange, Party, PollData, PollsterGroup } from "../../types";
import { pollsterData } from "$stores/dataStore";

export function filterByPollsterGroup(pollData: PollData, selectedPollsterGroup: PollsterGroup): PollData {
    if (selectedPollsterGroup === "összes") {
        return pollData;
    }

    const pollsters = Object.values(pollsterData)
        .filter((d) => d.group === selectedPollsterGroup)
        .map((d) => d.name);

    return pollData.filter((d) => pollsters.includes(d.pollster));
}

export function filterByDateRange(pollData: PollData, dateRange: DateRange): PollData {
    if (dateRange === null) {
        return pollData;
    }

    return pollData.filter((d) => d.date >= dateRange.start && d.date <= dateRange.end);
}

export function applyPartyIntervalsFilter(
    pollData: PollData,
    partyIntervals: Record<Party, [Date, Date][]>
): PollData {
    return pollData.map((poll) => {
        const copy = { ...poll };
        for (const party of Object.keys(partyIntervals) as Party[]) {
            const isInInterval = partyIntervals[party].some(([start, end]) => poll.date >= start && poll.date <= end);
            if (!isInInterval) {
                copy[party] = undefined;
            }
        }
        return copy;
    });
}


