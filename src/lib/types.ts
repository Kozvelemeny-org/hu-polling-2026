export interface Segment {
    start: number;
    end: number;
    color: string;
    leadingParty: Party;
    probability: number;
}

export interface GaugeProps {
    value: number;
    minValue: number;
    maxValue: number;
    segments: Segment[];
    strokeWidth?: number;
    radius?: number;
    tickInterval?: number;
    majorTicks?: number[];
    needleColor?: string;
    centerColor?: string;
}

export type PollData = Poll[];

export type MandateProjectionData = MandateProjection[];

export type PollDataByPollster = Record<Pollster, Poll[]>;

export type Pollster = 'IDEA' | 'Závecz RI' | 'Medián' | 'Nézőpont' | 'Publicus' |
                        'Republikon' | 'Századvég' | 'Iránytű' | 'Real-PR 93' |
                        'Társadalomkutató' | '21 Kutató' | 'Civitas' | 'Alapjogokért Központ' |
                        'Psyma' | 'Ipsos' | 'e-benchmark' | 'Tárki';

export type PollsterGroup = 'összes' | 'voxpopuli' | 'kormányfüggetlen' | 'kormányközeli';

export type PollsterData = Record<Pollster, { name: string, group: PollsterGroup, color: string }>;

export type Poll = {
    date: Date;
    pollster: Pollster;
    url: string;
} & {
    [party in Party]?: number;
}

export type MandateProjection = Poll;

/** Per-date stats: mean seats, entry/majority/absolute-majority probabilities per party. */
export type HistoricalSimulationByDate = {
    mean: Record<Party, number>;
    entryProbability: Record<Party, number>;
    majorityProbability: Record<Party, number>;
    absoluteMajorityProbability: Record<Party, number>;
};
/** One scenario: date string (YYYY-MM-DD) → per-date stats. */
export type HistoricalSimulationScenario = Record<string, HistoricalSimulationByDate>;
/** Scenario key (e.g. "main") → HistoricalSimulationScenario */
export type HistoricalSimulationData = Record<string, HistoricalSimulationScenario>;

export type Simulation = {
    averages: Record<Party, number>;
    medians: Record<Party, number>;
    modes: Record<Party, number>;
    seats: Record<Party, number>;
    oevkDiffs: Record<string, number>;
    metadata: {
        name: string;
        polls?: Poll[];
        description?: string;
        updatedAt?: Date;
    }
} & {
    [party in Party]?: number[]; // prob of winning i seats, from 0 to 199
}

export type ChartData = {
    title: string;
    chartId?: string;
    dataSelects?: DataSelect[];
    description?: string;
    selectedParties?: Party[];
    dateRange?: DateRange;
    annotations?: Annotation[];
    renderOptions?: ChartOptions;
    voterType?: 'all_voters' | 'sure_voters';
    pollsterGroup?: PollsterGroup;
    featured?: boolean;
    showSource?: boolean;
    isMandateProjection?: boolean;
}

export type DateRange = { start: Date, end: Date };

export type Party = 'fidesz' | 'tisza' | 'dk' | 'mihazank' | 'mkkp' | 'momentum' | 'minority' | 'unsure';

export type PartyData = Record<Party, { name: string; color: string; }>;

export type DayData = {
    date: Date;
} & {
    [party in Party]?: number;
};

export type AxisParams = {
    xTickLevel: 'year' | 'quarter' | 'month',
    yLims: [number, number],
    ticks: number[],
    dateRange: DateRange,
}

export type Annotation = {
    id: string;
    date: Date;
    text: string;
    lineType: 'solid' | 'dashed' | 'dotted';
}

export type DataSelect = 'voter_type' | 'pollster_group';

export type SmoothingMethod = 'ma' | 'weighted-ma';

export interface ChartOptions {
    aspectRatio?: number;
    yLims?: [number, number];
    smoothing?: SmoothingMethod;
    showDots?: boolean;
    isInteractive?: boolean;
    showEntryTreshold?: boolean;
}

// Generic series abstractions for charts
export type SeriesId = string;
export type SeriesKind = 'party';

export type SeriesDescriptor = {
    id: SeriesId;
    label: string;
    color: string;
    kind: SeriesKind;
};

export type SeriesPoint = { date: Date; value?: number; pollster?: string };
export type SeriesDaily = { date: Date; value?: number };

export type BeeswarmPoint = {
    name: string; // party name for title
    category: string; // not used, kept to mirror example shape
    value: number; // the actual value (seats for mandates, percentage for polls)
};

export type BeeswarmData = {
    party: Party;
    points: BeeswarmPoint[];
    average: number;
    histogram: number[]; // seats -> probability
};
