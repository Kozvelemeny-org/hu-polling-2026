import { ChartRenderer } from "./ChartRenderer";
import { processPartySeries } from "./ChartDataProcessor";
import { axisFrom } from "./core/AxisCalculator";
import type { Annotation, ChartOptions, DateRange, Party, PollData, PollsterGroup, SeriesDaily, SeriesPoint, SeriesDescriptor } from "../types";
import { partyData } from "$stores/dataStore";

export class Chart {
    private containerElement: HTMLElement;
    private pollData: PollData;
    private selectedParties: Party[];
    private selectedPollsterGroup: PollsterGroup;
    private dateRange: DateRange;
    private partyIntervals: Record<Party, [Date, Date][]>;
    private annotations: Annotation[] = [];
    private renderOptions: ChartOptions | undefined;
    private renderer: ChartRenderer;
    private latestSeries: {
        data: PollData;
        pointsBySeries: Record<string, SeriesPoint[]>;
        dailyBySeries: Record<string, SeriesDaily[]>;
        series: SeriesDescriptor[];
        dates: Date[];
        windowDays: number;
    } | null = null;
    private resizeDebounce: number | null = null;

    public windowDays = 0;

    constructor(containerElement: HTMLElement, pollData: PollData, options: {
        selectedParties?: Party[],
        selectedPollsterGroup?: PollsterGroup,
        dateRange?: DateRange,
        partyIntervals?: Record<Party, [Date, Date][]>,
        annotations?: Annotation[],
        renderOptions?: ChartOptions,
    } = {}) {
        this.containerElement = containerElement;
        this.pollData = pollData;
        this.selectedParties = options.selectedParties ?? Object.keys(partyData) as Party[];
        this.selectedPollsterGroup = options.selectedPollsterGroup ?? "kormanyfuggetlen" as PollsterGroup;
        this.dateRange = options.dateRange ?? { start: new Date(2018, 0, 0), end: new Date() };
        this.partyIntervals = options.partyIntervals ?? this.getDefaultPartyIntervals();
        this.annotations = options.annotations ?? [];
        this.renderOptions = options.renderOptions;

        this.renderer = new ChartRenderer(this.containerElement);
        this.init();
    }

    private init() {
        window.addEventListener("resize", () => this.onResize());
        this.render();
    }

    private getDefaultPartyIntervals(): Record<Party, [Date, Date][]> {
        return Object.fromEntries(this.selectedParties.map(party => [
            party,
            [[new Date(2018, 0, 0), new Date()]],
        ])) as Record<Party, [Date, Date][]>;
    }

    private onResize() {
        if (this.resizeDebounce) {
            clearTimeout(this.resizeDebounce);
        }
        this.resizeDebounce = window.setTimeout(() => {
            this.render();
        }, 100);
    }

    public render() {
        this.renderer.render(this.selectedParties, this.annotations, this.renderOptions, this.dateRange);
    }

    public setOptions(updatedOptions: {
        pollData?: PollData;
        selectedParties?: Party[];
        selectedPollsterGroup?: PollsterGroup;
        dateRange?: DateRange;
        partyIntervals?: Record<Party, [Date, Date][]>;
        annotations?: Annotation[];
        renderOptions?: ChartOptions;
    }) {
        for (const key of Object.keys(updatedOptions) as (keyof typeof updatedOptions)[]) {
            if (updatedOptions[key] === undefined) continue;
            (this as any)[key] = updatedOptions[key];
        }
    
        if (
            updatedOptions.pollData !== undefined ||
            updatedOptions.selectedParties !== undefined ||
            updatedOptions.dateRange !== undefined ||
            updatedOptions.partyIntervals !== undefined
        ) {
            this.updateChartData();
        }
    
        if (updatedOptions.annotations !== undefined) {
            this.renderer.updateAnnotations(this.annotations);
        }

        if (updatedOptions.dateRange !== undefined) {
            this.updateAxis();
        }
    }
    
    private updateChartData() {
        const payload = processPartySeries(
            this.pollData,
            this.dateRange,
            this.partyIntervals,
            this.selectedParties,
            this.selectedPollsterGroup,
            this.renderOptions
        );

        this.latestSeries = payload;
        this.windowDays = payload.windowDays;

        this.renderer.updateAxisLimits(payload.axisParams);
        this.renderer.updateSeries(payload.pointsBySeries, payload.dailyBySeries, payload.series, payload.data, payload.dates);
    }
    
    private updateAxis() {
        if (!this.latestSeries) {
            this.updateChartData();
            if (!this.latestSeries) return;
        }
        const { dailyBySeries } = this.latestSeries;
        const axisParams = axisFrom(dailyBySeries, this.dateRange, this.renderOptions?.yLims, !!this.annotations.length);
        this.renderer.updateAxisLimits(axisParams);
    }
}
