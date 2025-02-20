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

export type PollDataByPollster = Record<Pollster, Poll[]>;

export type Pollster = 'IDEA' | 'ZRI' | 'Medián' | 'Nézőpont' | 'Publicus' |
                        'Republikon' | 'Századvég' | 'Iránytű' | 'Real-PR 93' |
                        'Társadalomkutató' | '21 Kutató' | 'Civitas' | 'Alapjogokért Központ' |
                        'Psyma' | 'Ipsos' | 'e-benchmark' | 'Tárki';

export type PollsterGroup = 'összes' | 'független' | 'kormányközeli' | 'ellenzéki';

export type Poll = {
    date: Date;
    pollster: Pollster;
} & {
    [party in Party]?: number;
}

export type ChartData = {
    title: string;
    chartId?: string;
    dataSelects?: DataSelect[];
    description?: string;
    selectedParties?: Party[];
    dateRange?: DateRange;
    annotations?: Annotation[];
    renderOptions?: Record<string, any>;
    voterType?: 'all_voters' | 'sure_voters';
    pollsterGroup?: PollsterGroup;
    featured?: boolean;
    showSource?: boolean;
}

export type DateRange = { start: Date, end: Date };

export type Party = 'fidesz' | 'tisza' | 'dk_mszp_p' | 'mihazank' | 'mkkp' | 'momentum' | 'jobbik' | 'egyesult_ellenzek' | 'semleges' | 'unsure';

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

/* export interface CandidateData {
    candidate: string;
    [aggregator: Aggregator]: number;
} */