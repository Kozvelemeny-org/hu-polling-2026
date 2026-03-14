import * as d3 from "d3";
import { PUBLIC_DATA_BASE_URL } from "$env/static/public";
import type { HistoricalSimulationData, MandateProjectionData, PollData, Simulation } from "./types";

const dataBaseUrl = (PUBLIC_DATA_BASE_URL ?? "").replace(/\/$/, "");

async function fetchPollData(): Promise<Record<string, PollData>> {
    let fetchedData: Record<string, PollData> = {};
    for (const tableName of ["sure_voters", "all_voters"]) {
        try {
            if (tableName === "all_voters") throw new Error("All voters data is not available");
            const response = await fetch(`${dataBaseUrl}/${tableName}.csv`);
            const csvText = await response.text();
            fetchedData[tableName] = d3.csvParse(csvText) as unknown as PollData;
        } catch (error) {
            fetchedData[tableName] = [] as PollData;
            console.error(`Error fetching ${tableName} data:`, error);
            continue;
        }
    }
    return fetchedData;
}

async function fetchMandateProjectionData(): Promise<MandateProjectionData | false> {
    let fetchedData: MandateProjectionData = [];
    const response = await fetch(`${dataBaseUrl}/mandate_projections.csv`);
    const csvText = await response.text();
    fetchedData = d3.csvParse(csvText) as unknown as MandateProjectionData;
    return fetchedData;
}

async function fetchSimulationData(): Promise<Record<string, Simulation> | false> {
    const response = await fetch(`${dataBaseUrl}/simulation_data.json`);
    if (!response.ok) return false;
    return await response.json();
}

async function fetchHistoricalSimulationData(): Promise<HistoricalSimulationData | false> {
    const response = await fetch(`${dataBaseUrl}/historical_simulation_data.json`);
    if (!response.ok) return false;
    return await response.json();
}

function isDataStale() {
    const tenMinutes = 1000 * 60 * 10;
    const now = new Date();
    const lastUpdated = new Date(sessionStorage.getItem("dataUpdated") || 0);
    const diff = now.getTime() - lastUpdated.getTime();

    return (
        sessionStorage.getItem("dataUpdated") == null ||
        sessionStorage.getItem("pollsData") == null ||
        sessionStorage.getItem("simulationData") == null ||
        sessionStorage.getItem("mandateProjectionData") == null ||
        sessionStorage.getItem("historicalSimulationData") == null ||
        diff >= tenMinutes
    );
}

async function getData() {
    let retrivedData = null;

    if (isDataStale()) {
        const pollData = await fetchPollData();
        if (!pollData) return false;

        const simulationData = await fetchSimulationData();
        if (!simulationData) return false;

        const mandateProjectionData = await fetchMandateProjectionData();
        if (!mandateProjectionData) return false;

        const historicalSimulationData = await fetchHistoricalSimulationData();
        if (!historicalSimulationData) return false;

        const now = new Date();
        sessionStorage.setItem("dataUpdated", now.toString());
        sessionStorage.setItem("pollsData", JSON.stringify(pollData));
        sessionStorage.setItem("simulationData", JSON.stringify(simulationData));
        sessionStorage.setItem("mandateProjectionData", JSON.stringify(mandateProjectionData));
        sessionStorage.setItem("historicalSimulationData", JSON.stringify(historicalSimulationData));
        retrivedData = { pollData, simulationData, mandateProjectionData, historicalSimulationData };
    } else {
        const storedData = {
            pollData: sessionStorage.getItem("pollsData"),
            simulationData: sessionStorage.getItem("simulationData"),
            mandateProjectionData: sessionStorage.getItem("mandateProjectionData"),
            historicalSimulationData: sessionStorage.getItem("historicalSimulationData"),
        };
        if (storedData.pollData === null || storedData.simulationData === null || storedData.mandateProjectionData === null || storedData.historicalSimulationData === null) return false;

        retrivedData = {
            pollData: JSON.parse(storedData.pollData) as Record<string, PollData>,
            simulationData: JSON.parse(storedData.simulationData) as Record<string, Simulation>,
            mandateProjectionData: JSON.parse(storedData.mandateProjectionData) as MandateProjectionData,
            historicalSimulationData: JSON.parse(storedData.historicalSimulationData) as HistoricalSimulationData,
        };
        if (retrivedData.mandateProjectionData === null) return false;
    }

    retrivedData.pollData.sure_voters.forEach((d) => {
        d.date = new Date(d.date);
    });
    retrivedData.pollData.all_voters.forEach((d) => {
        d.date = new Date(d.date);
    });
    retrivedData.mandateProjectionData.forEach((d) => {
        d.date = new Date(d.date);
    });
    Object.values(retrivedData.simulationData).forEach((s) => {
        if (s.metadata.updatedAt) {
            s.metadata.updatedAt = new Date(s.metadata.updatedAt);
        } else {
            s.metadata.updatedAt = undefined;
        }
    })
    return retrivedData;
}

export { getData };
