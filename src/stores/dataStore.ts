import { get, writable } from 'svelte/store';
import { getPollData } from '../lib/dataUtils';
import type { Party, Poll, PollData, Pollster, PollsterGroup } from '../lib/types';

export const partyColors = {
    fidesz: "#fd8100",
    tisza: "#00359c",
    dk_mszp_p: "#007fff",
    mihazank: "#688d1b",
    mkkp: "#ff0000",
    momentum: "#8e6fcd",
    /////////////////////////////
    semleges: "#d3d3d3",
    unsure: "#a0f7",
    /////////////////////////////
    jobbik: "#425044",
    egyesult_ellenzek: "#20b2aa",
} as Record<Party, string>;

export const partyColorsLight = {
    fidesz: "#ffd6ab",
    tisza: "#b0c4de",
    /////////////////////////////
    semleges: "#d3d3d3",
} as Record<Party, string>;

export const partyDisplayNames = {
    fidesz: 'Fidesz',
    tisza: 'Tisza',
    dk_mszp_p: "DK-MSZP-P",
    mihazank: 'Mi Hazánk',
    mkkp: 'MKKP',
    momentum: 'Momentum',
    jobbik: 'Jobbik',
    egyesult_ellenzek: "Egyesült Ellenzék",
    unsure: "Bizonytalan",
} as Record<Party, string>;

export const govtPollsters = ['Nézőpont', 'Századvég', 'Társadalomkutató', 'TK'];
export const indPollsters = ['IDEA', 'ZRI', 'Medián', 'Real-PR 93', '21 Kutató',
                            'Iránytű', 'e-benchmark', 'Psyma', 'Civitas', 'Tárki'];
export const oppPollsters = ['Publicus', 'Republikon'];

export const pollsterNameMap = {
    'IDEA': 'IDEA',
    'ZRI': 'Závecz',
    'Medián': 'Medián',
    'Nézőpont': 'Nézőpont',
    'Publicus': 'Publicus',
    'Republikon': 'Republikon',
    'Századvég': 'Századvég',
    'Iránytű': 'Iránytű',
    'Real-PR 93': 'Real-PR',
    'Társadalomkutató': 'Társadalomkutató',
    'TK': 'Társadalomkutató',
    '21 Kutató': '21 Kutató',
    'Civitas': 'Civitas',
    'Alapjogokért Központ': 'Alapjogokért Központ',
    'Psyma': 'Psyma',
    'Ipsos': 'Ipsos',
    'e-benchmark': 'e-benchmark',
    'Tárki': 'Tárki',
}

export const pollsterGroups = [
    "összes",
    "kormányközeli",
    "független",
    "ellenzéki",
] as PollsterGroup[];

export const pollData = writable<Record<'sure_voters' | 'all_voters', PollData>>({
    sure_voters: [],
    all_voters: [],
});

export async function fetchPollData() {
    try {
        const data = await getPollData();
        if (!data) {
            throw new Error('Could not import data.');
        }

        console.log('Data fetched:', data);

        pollData.set(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
