import { get, writable } from 'svelte/store';
import { getPollData } from '../lib/dataUtils';
import type { Party, PollData, PollsterData, PollsterGroup } from '../lib/types';

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

export const pollsterGroups = [
    "összes",
    "kormányközeli",
    "független",
] as PollsterGroup[];

export const pollsterData = {
    'Nézőpont': {
        name: 'Nézőpont',
        group: 'kormányközeli',
        color: '#eedc82',
    },
    'Századvég': {
        name: 'Századvég',
        group: 'kormányközeli',
        color: '#f4a460',
    },
    'TK': {
        name: 'Társadalomkutató',
        group: 'kormányközeli',
        color: '#eee8aa',
    },
    'Real-PR 93': {
        name: 'Real-PR',
        group: 'kormányközeli',
        color: '#ffa500',
    },
    'IDEA': {
        name: 'IDEA',
        group: 'független',
        color: '#4f94cd',
    },
    'ZRI': {
        name: 'Závecz',
        group: 'független',
        color: '#473c8b',
    },
    'Medián': {
        name: 'Medián',
        group: 'független',
        color: '#aa0099',
    },
    '21 Kutató': {
        name: '21 Kutató',
        group: 'független',
        color: '#663366',
    },
    'Iránytű': {
        name: 'Iránytű',
        group: 'független',
        color: '#116633',
    },
    'Tárki': {
        name: 'Tárki',
        group: 'független',
        color: '#ffcc00',
    },
    'Publicus': {
        name: 'Publicus',
        group: 'független',
        color: '#ee0000',
    },
    'Republikon': {
        name: 'Republikon',
        group: 'független',
        color: '#00cdaa',
    },
} as PollsterData;

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
