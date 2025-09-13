import { writable } from 'svelte/store';
import { getData } from '../lib/dataUtils';
import type { MandateProjectionData, PartyData, PollData, PollsterData, PollsterGroup, Simulation } from '../lib/types';

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
        color: '#1e73be',
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

export const oevkNameMap = { "101": "Budapest 01.", "102": "Budapest 02.", "103": "Budapest 03.", "104": "Budapest 04.", "105": "Budapest 05.",
    "106": "Budapest 06.", "107": "Budapest 07.", "108": "Budapest 08.", "109": "Budapest 09.", "110": "Budapest 10.", "111":
    "Budapest 11.", "112": "Budapest 12.", "113": "Budapest 13.", "114": "Budapest 14.", "115": "Budapest 15.", "116": "Budapest 16.",
    "201": "Baranya 01.", "202": "Baranya 02.", "203": "Baranya 03.", "204": "Baranya 04.", "301": "Bács-Kiskun 01.", "302":
    "Bács-Kiskun 02.", "303": "Bács-Kiskun 03.", "304": "Bács-Kiskun 04.", "305": "Bács-Kiskun 05.", "306": "Bács-Kiskun 06.",
    "401": "Békés 01.", "402": "Békés 02.", "403": "Békés 03.", "404": "Békés 04.", "501": "Borsod-Abaúj-Zemplén 01.", "502":
    "Borsod-Abaúj-Zemplén 02.", "503": "Borsod-Abaúj-Zemplén 03.", "504": "Borsod-Abaúj-Zemplén 04.", "505": "Borsod-Abaúj-Zemplén 05.",
    "506": "Borsod-Abaúj-Zemplén 06.", "507": "Borsod-Abaúj-Zemplén 07.", "601": "Csongrád-Csanád 01.", "602": "Csongrád-Csanád 02.",
    "603": "Csongrád-Csanád 03.", "604": "Csongrád-Csanád 04.", "701": "Fejér 01.", "702": "Fejér 02.", "703": "Fejér 03.", "704":
    "Fejér 04.", "705": "Fejér 05.", "801": "Győr-Moson-Sopron 01.", "802": "Győr-Moson-Sopron 02.", "803": "Győr-Moson-Sopron 03.",
    "804": "Győr-Moson-Sopron 04.", "805": "Győr-Moson-Sopron 05.", "901": "Hajdú-Bihar 01.", "902": "Hajdú-Bihar 02.", "903":
    "Hajdú-Bihar 03.", "904": "Hajdú-Bihar 04.", "905": "Hajdú-Bihar 05.", "906": "Hajdú-Bihar 06.", "1001": "Heves 01.", "1002":
    "Heves 02.", "1003": "Heves 03.", "1101": "Jász-Nagykun-Szolnok 01.", "1102": "Jász-Nagykun-Szolnok 02.", "1103":
    "Jász-Nagykun-Szolnok 03.", "1104": "Jász-Nagykun-Szolnok 04.", "1201": "Komárom-Esztergom 01.", "1202": "Komárom-Esztergom 02.",
    "1203": "Komárom-Esztergom 03.", "1301": "Nógrád 01.", "1302": "Nógrád 02.", "1401": "Pest 01.", "1402": "Pest 02.", "1403":
    "Pest 03.", "1404": "Pest 04.", "1405": "Pest 05.", "1406": "Pest 06.", "1407": "Pest 07.", "1408": "Pest 08.", "1409": "Pest 09.",
    "1410": "Pest 10.", "1411": "Pest 11.", "1412": "Pest 12.", "1413": "Pest 13.", "1414": "Pest 14.", "1501": "Somogy 01.", "1502":
    "Somogy 02.", "1503": "Somogy 03.", "1504": "Somogy 04.", "1601": "Szabolcs-Szatmár-Bereg 01.", "1602": "Szabolcs-Szatmár-Bereg 02.",
    "1603": "Szabolcs-Szatmár-Bereg 03.", "1604": "Szabolcs-Szatmár-Bereg 04.", "1605": "Szabolcs-Szatmár-Bereg 05.", "1606":
    "Szabolcs-Szatmár-Bereg 06.", "1701": "Tolna 01.", "1702": "Tolna 02.", "1703": "Tolna 03.", "1801": "Vas 01.", "1802": "Vas 02.",
    "1803": "Vas 03.", "1901": "Veszprém 01.", "1902": "Veszprém 02.", "1903": "Veszprém 03.", "1904": "Veszprém 04.", "2001": "Zala 01.",
    "2002": "Zala 02.", "2003": "Zala 03."
}

export const pollData = writable<Record<'sure_voters' | 'all_voters', PollData>>({
    sure_voters: [],
    all_voters: [],
});
export const simulationData = writable<Record<string, Simulation>>({});
export const mandateProjectionData = writable<MandateProjectionData>([]);

export async function fetchData() {
    try {
        const data = await getData();
        if (!data) {
            throw new Error('Could not import data.');
        }

        console.log('Data fetched:', data);

        pollData.set(data.pollData);
        simulationData.set(data.simulationData);
        mandateProjectionData.set(data.mandateProjectionData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
