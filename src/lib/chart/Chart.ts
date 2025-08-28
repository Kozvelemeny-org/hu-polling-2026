import { ChartRenderer } from "./ChartRenderer";
import { ChartDataProcessor } from "./ChartDataProcessor";
import { axisFrom } from "./core/AxisCalculator";
import type { Annotation, DateRange, Party, PollData, PollsterGroup, Pollster, SeriesDaily, SeriesPoint, SeriesDescriptor } from "../types";
import { partyData, pollsterData } from "$stores/dataStore";

export class Chart {
    private containerElement: HTMLElement;
    private pollData: PollData;
    private selectedParties: Party[];
    private selectedPollsterGroup: PollsterGroup;
    private dateRange: DateRange;
    private partyIntervals: Record<Party, [Date, Date][]>;
    private annotations: Annotation[] = [];
    private renderOptions: Record<string, unknown> | undefined;
    private renderer: ChartRenderer;
    private dataProcessor: ChartDataProcessor;
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
        renderOptions?: Record<string, unknown> | undefined,
    } = {}) {
        this.containerElement = containerElement;
        this.pollData = pollData;
        this.selectedParties = options.selectedParties ?? Object.keys(partyData) as Party[];
        this.selectedPollsterGroup = options.selectedPollsterGroup ?? "összes";
        this.dateRange = options.dateRange ?? { start: new Date(2018, 0, 0), end: new Date() };
        this.partyIntervals = options.partyIntervals ?? this.getDefaultPartyIntervals();
        this.annotations = options.annotations ?? [];
        this.renderOptions = options.renderOptions;
        
        this.dataProcessor = new ChartDataProcessor(
            this.pollData,
            this.dateRange,
            this.partyIntervals,
            this.selectedParties,
            this.selectedPollsterGroup,
            this.renderOptions,
        );
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
        renderOptions?: Record<string, unknown>;
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
        this.dataProcessor = new ChartDataProcessor(
            this.pollData, 
            this.dateRange, 
            this.partyIntervals, 
            this.selectedParties, 
            this.selectedPollsterGroup, 
            this.renderOptions
        );

        const mode = (this.renderOptions && (this.renderOptions as any)['seriesMode']) || 'party';
        let payload: any;
        if (mode === 'pollster') {
            const selectedParty = ((this.renderOptions as any)['selectedParty'] as Party) ?? this.selectedParties[0];
            const selectedPollsters = ((this.renderOptions as any)['selectedPollsters'] as Pollster[]) ?? (Object.keys(pollsterData) as unknown as Pollster[]);
            payload = this.dataProcessor.processPollsterSeries(selectedParty, selectedPollsters);
        } else {
            payload = this.dataProcessor.processPartySeries();
        }
        this.latestSeries = payload;
        this.windowDays = payload.windowDays;
        this.renderer.updateSeries(payload.pointsBySeries, payload.dailyBySeries, payload.series, payload.data, payload.dates);
    }
    
    private updateAxis() {
        if (!this.latestSeries) {
            this.updateChartData();
            if (!this.latestSeries) return;
        }
        const { dailyBySeries } = this.latestSeries;
        const axisParams = axisFrom(dailyBySeries, this.dateRange, (this.renderOptions as any)?.yLims, !!this.annotations.length);
        this.renderer.updateAxisLimits(axisParams);
    }
}