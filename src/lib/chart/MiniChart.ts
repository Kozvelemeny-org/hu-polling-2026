import type { Annotation, DateRange, Party, PollData, PollsterGroup } from "$lib/types";
import { Chart } from "./Chart";

export class MiniChart extends Chart {
    constructor(containerElement: HTMLElement, pollData: PollData, options: {
        selectedParties?: Party[],
        selectedPollsterGroup?: PollsterGroup,
        dateRange?: DateRange,
        partyIntervals?: Record<Party, [Date, Date][]>,
        annotations?: Annotation[],
        renderOptions?: Record<string, unknown> | undefined,
    } = {}) {
        super(containerElement, pollData, options);


    }
}