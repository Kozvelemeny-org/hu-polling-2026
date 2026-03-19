import * as d3 from "d3";
import { PUBLIC_DATA_BASE_URL } from "$env/static/public";
import type {
	HistoricalSimulationData,
	MandateProjectionData,
	PollData,
	Simulation
} from "$lib/types";

export type SiteDataBundle = {
	pollData: Record<"sure_voters" | "all_voters", PollData>;
	simulationData: Record<string, Simulation>;
	mandateProjectionData: MandateProjectionData;
	historicalSimulationData: HistoricalSimulationData;
};

export type SiteDataProfile = {
	surePolls?: boolean;
	allPolls?: boolean;
	simulation?: boolean;
	mandateProjection?: boolean;
	historicalSimulation?: boolean;
};

const dataBaseUrl = (PUBLIC_DATA_BASE_URL ?? "").replace(/\/$/, "");
const cacheTtlMs = 60_000;

async function fetchCsv<T>(fetchFn: typeof fetch, path: string): Promise<T> {
	const response = await fetchFn(`${dataBaseUrl}/${path}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${path}: ${response.status}`);
	}
	const csvText = await response.text();
	return d3.csvParse(csvText) as unknown as T;
}

type ResourceCache<T> = {
	value: T | null;
	expiry: number;
	inFlight: Promise<T> | null;
};

type ResourceName =
	| "surePolls"
	| "allPolls"
	| "simulation"
	| "mandateProjection"
	| "historicalSimulation";

const resourceCaches: Record<ResourceName, ResourceCache<unknown>> = {
	surePolls: { value: null, expiry: 0, inFlight: null },
	allPolls: { value: null, expiry: 0, inFlight: null },
	simulation: { value: null, expiry: 0, inFlight: null },
	mandateProjection: { value: null, expiry: 0, inFlight: null },
	historicalSimulation: { value: null, expiry: 0, inFlight: null }
};

async function getCachedResource<T>(
	name: ResourceName,
	loader: () => Promise<T>,
	fallback: () => T
): Promise<T> {
	const cache = resourceCaches[name] as ResourceCache<T>;
	const now = Date.now();

	if (cache.value !== null && now < cache.expiry) {
		return cache.value;
	}

	if (!cache.inFlight) {
		cache.inFlight = loader()
			.then((value) => {
				cache.value = value;
				cache.expiry = Date.now() + cacheTtlMs;
				return value;
			})
			.catch((error) => {
				// Keep pages stable on transient upstream failures.
				if (cache.value !== null) {
					console.error(`[siteData] ${name} refresh failed, serving stale cache`, error);
					return cache.value;
				}
				console.error(`[siteData] ${name} load failed, serving fallback`, error);
				const fallbackValue = fallback();
				cache.value = fallbackValue;
				cache.expiry = Date.now() + cacheTtlMs;
				return fallbackValue;
			})
			.finally(() => {
				cache.inFlight = null;
			});
	}

	return cache.inFlight;
}

function normalizePollDates(polls: PollData) {
	polls.forEach((d) => {
		d.date = new Date(d.date);
	});
}

function normalizeMandateProjectionDates(data: MandateProjectionData) {
	data.forEach((d) => {
		d.date = new Date(d.date);
	});
}

function normalizeSimulationDates(data: Record<string, Simulation>) {
	Object.values(data).forEach((s) => {
		if (s.metadata.updatedAt) {
			s.metadata.updatedAt = new Date(s.metadata.updatedAt);
		} else {
			s.metadata.updatedAt = undefined;
		}
	});
}

async function loadSurePolls(fetchFn: typeof fetch): Promise<PollData> {
	const data = await fetchCsv<PollData>(fetchFn, "sure_voters.csv");
	normalizePollDates(data);
	return data;
}

async function loadAllPolls(fetchFn: typeof fetch): Promise<PollData> {
	const data = await fetchCsv<PollData>(fetchFn, "all_voters.csv").catch(() => [] as PollData);
	normalizePollDates(data);
	return data;
}

async function loadMandateProjection(fetchFn: typeof fetch): Promise<MandateProjectionData> {
	const data = await fetchCsv<MandateProjectionData>(fetchFn, "mandate_projections.csv");
	normalizeMandateProjectionDates(data);
	return data;
}

async function loadSimulation(fetchFn: typeof fetch): Promise<Record<string, Simulation>> {
	const response = await fetchFn(`${dataBaseUrl}/simulation_data.json`);
	if (!response.ok) {
		throw new Error(`Failed to fetch simulation_data.json: ${response.status}`);
	}
	const data = (await response.json()) as Record<string, Simulation>;
	normalizeSimulationDates(data);
	return data;
}

async function loadHistoricalSimulation(fetchFn: typeof fetch): Promise<HistoricalSimulationData> {
	const response = await fetchFn(`${dataBaseUrl}/historical_simulation_data.json`);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch historical_simulation_data.json: ${response.status}`
		);
	}
	return (await response.json()) as HistoricalSimulationData;
}

export async function getSiteData(
	fetchFn: typeof fetch,
	profile: SiteDataProfile
): Promise<SiteDataBundle> {
	const [
		surePolls,
		allPolls,
		simulationData,
		mandateProjectionData,
		historicalSimulationData
	] = await Promise.all([
		profile.surePolls
			? getCachedResource("surePolls", () => loadSurePolls(fetchFn), () => [] as PollData)
			: Promise.resolve([] as PollData),
		profile.allPolls
			? getCachedResource("allPolls", () => loadAllPolls(fetchFn), () => [] as PollData)
			: Promise.resolve([] as PollData),
		profile.simulation
			? getCachedResource("simulation", () => loadSimulation(fetchFn), () => ({} as Record<string, Simulation>))
			: Promise.resolve({} as Record<string, Simulation>),
		profile.mandateProjection
			? getCachedResource("mandateProjection", () => loadMandateProjection(fetchFn), () => [] as MandateProjectionData)
			: Promise.resolve([] as MandateProjectionData),
		profile.historicalSimulation
			? getCachedResource("historicalSimulation", () => loadHistoricalSimulation(fetchFn), () => ({} as HistoricalSimulationData))
			: Promise.resolve({} as HistoricalSimulationData)
	]);

	return {
		pollData: {
			sure_voters: surePolls,
			all_voters: allPolls
		},
		simulationData,
		mandateProjectionData,
		historicalSimulationData
	};
}
