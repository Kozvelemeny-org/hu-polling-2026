/**
 * OEVK map constants and helpers. Single source of truth for thresholds, labels, and legend state.
 */

export const HUNGARY_BOUNDS: [[number, number], [number, number]] = [
    [15.113, 45.737 - 0.1],
    [23.896, 48.585 + 0.3],
];

export const DIFF_THRESHOLDS = [-0.15, -0.05, 0.05, 0.15] as const;

export const CATEGORY_LABELS = [
    "Fidesz +15%",
    "Fidesz +5%",
    "Szoros",
    "Tisza +5%",
    "Tisza +15%",
] as const;

const LEGEND_POSITIONS = [10, 30, 50, 70, 90] as const;

export type LegendState = { position: number; category: string };

export const DEFAULT_LEGEND_STATE: LegendState = { position: 50, category: "Ki esélyes?" };

export function diffToLegendState(diff: number): LegendState {
    const v = parseFloat(String(diff));
    if (v < -0.15) return { position: LEGEND_POSITIONS[0], category: CATEGORY_LABELS[0] };
    if (v < -0.05) return { position: LEGEND_POSITIONS[1], category: CATEGORY_LABELS[1] };
    if (v < 0.05) return { position: LEGEND_POSITIONS[2], category: CATEGORY_LABELS[2] };
    if (v < 0.15) return { position: LEGEND_POSITIONS[3], category: CATEGORY_LABELS[3] };
    return { position: LEGEND_POSITIONS[4], category: CATEGORY_LABELS[4] };
}

export type PartyDataColors = {
    fidesz: { color: string };
    tisza: { color: string };
};

export function getOevkColors(partyData: PartyDataColors): string[] {
    return [
        partyData.fidesz.color,
        "#ffb985",
        "#f1f1f1",
        "#908dc7",
        partyData.tisza.color,
    ];
}

export async function loadOevkGeojson(staticBase: string): Promise<GeoJSON.FeatureCollection> {
    const response = await fetch(`${staticBase}/geo/oevks.geojson`);
    return response.json();
}
