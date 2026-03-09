import { ChartRenderer } from "./ChartRenderer";
import { processPartySeries } from "./ChartDataProcessor";
import { processMandateProjectionSeries } from "./MandateChartDataProcessor";
import { axisFrom } from "./core/AxisCalculator";
import type { Annotation, ChartOptions, DateRange, HistoricalSimulationByDate, MandateProjectionData, Party, PollData, PollsterGroup, SeriesDaily, SeriesPoint, SeriesDescriptor } from "../types";
import { partyData } from "$stores/dataStore";

export type MandateChartInput = {
    historicalSimulation: HistoricalSimulationByDate;
    mandateProjectionData: MandateProjectionData;
};

function isMandateInput(data: PollData | MandateChartInput): data is MandateChartInput {
    return typeof data === "object" && data !== null && "historicalSimulation" in data && "mandateProjectionData" in data;
}

export class Chart {
    private containerElement: HTMLElement;
    private mode: "poll" | "mandate";
    private pollData: PollData;
    private historicalSimulation: HistoricalSimulationByDate | undefined;
    private mandateProjectionData: MandateProjectionData | undefined;
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

    constructor(
        containerElement: HTMLElement,
        data: PollData | MandateChartInput,
        options: {
            selectedParties?: Party[];
            selectedPollsterGroup?: PollsterGroup;
            dateRange?: DateRange;
            partyIntervals?: Record<Party, [Date, Date][]>;
            annotations?: Annotation[];
            renderOptions?: ChartOptions;
        } = {}
    ) {
        this.containerElement = containerElement;
        this.mode = isMandateInput(data) ? "mandate" : "poll";
        this.pollData = this.mode === "poll" ? (data as PollData) : [];
        this.historicalSimulation = this.mode === "mandate" ? (data as MandateChartInput).historicalSimulation : undefined;
        this.mandateProjectionData = this.mode === "mandate" ? (data as MandateChartInput).mandateProjectionData : undefined;
        this.selectedParties = options.selectedParties ?? (Object.keys(partyData) as Party[]);
        this.selectedPollsterGroup = options.selectedPollsterGroup ?? ("voxpopuli" as PollsterGroup);
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
        historicalSimulation?: HistoricalSimulationByDate;
        mandateProjectionData?: MandateProjectionData;
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
            updatedOptions.historicalSimulation !== undefined ||
            updatedOptions.mandateProjectionData !== undefined ||
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
        let payload;
        if (this.mode === "mandate" && this.historicalSimulation != null && this.mandateProjectionData != null) {
            payload = processMandateProjectionSeries(
                this.historicalSimulation,
                this.mandateProjectionData,
                this.dateRange,
                this.selectedParties,
                this.selectedPollsterGroup,
                this.renderOptions,
                this.annotations
            );
        } else if (this.mode === "poll") {
            payload = processPartySeries(
                this.pollData,
                this.dateRange,
                this.partyIntervals,
                this.selectedParties,
                this.selectedPollsterGroup,
                this.renderOptions
            );
        } else {
            return;
        }

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
