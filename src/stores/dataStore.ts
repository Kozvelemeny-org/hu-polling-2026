import { writable } from 'svelte/store';
import { getData } from '../lib/dataUtils';
import type { PartyData, PollData, PollsterData, PollsterGroup, Simulation } from '../lib/types';

export const partyData = {
    'fidesz': {
        name: 'Fidesz',
        color: '#fd8100',
    },
    'tisza': {
        name: 'Tisza',
        color: '#00359c',
    },
    'dk': {
        name: 'DK',
        color: '#007fff',
    },
    'dk_mszp_p': {
        name: 'DK-MSZP-P',
        color: '#007fff',
    },
    'mihazank': {
        name: 'Mi Hazánk',
        color: '#688d1b',
    },
    'mkkp': {
        name: 'MKKP',
        color: '#ff0000',
    },
    'momentum': {
        name: 'Momentum',
        color: '#8e6fcd',
    },
    'minority': {
        name: 'Nemzetiségi',
        color: '#d3d3d3',
    },
    'unsure': {
        name: 'Bizonytalan',
        color: '#a0f7',
    },
} as PartyData;

export const pollsterGroups = [
    "összes",
    "kormányközeli",
    "kormányfüggetlen",
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
    'Társadalomkutató': {
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
        group: 'kormányfüggetlen',
        color: '#4f94cd',
    },
    'Závecz RI': {
        name: 'Závecz',
        group: 'kormányfüggetlen',
        color: '#473c8b',
    },
    'Medián': {
        name: 'Medián',
        group: 'kormányfüggetlen',
        color: '#aa0099',
    },
    '21 Kutató': {
        name: '21 Kutató',
        group: 'kormányfüggetlen',
        color: '#663366',
    },
    'Iránytű': {
        name: 'Iránytű',
        group: 'kormányfüggetlen',
        color: '#116633',
    },
    'Tárki': {
        name: 'Tárki',
        group: 'kormányfüggetlen',
        color: '#ffcc00',
    },
    'Publicus': {
        name: 'Publicus',
        group: 'kormányfüggetlen',
        color: '#ee0000',
    },
    'Republikon': {
        name: 'Republikon',
        group: 'kormányfüggetlen',
        color: '#00cdaa',
    },
} as PollsterData;

export const pollData = writable<Record<'sure_voters' | 'all_voters', PollData>>({
    sure_voters: [],
    all_voters: [],
});
export const simulationData = writable<Record<string, Simulation>>({});

export async function fetchData() {
    try {
        const data = await getData();
        if (!data) {
            throw new Error('Could not import data.');
        }

        console.log('Data fetched:', data);

        pollData.set(data.pollData);
        simulationData.set(data.simulationData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
