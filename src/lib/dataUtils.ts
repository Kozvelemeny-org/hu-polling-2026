import * as d3 from "d3";
import type { PollData, Pollster } from "./types";
import { pollsterNameMap } from "../stores/dataStore";

/* const aggregatorNameMap: { [key in keyof Omit<CandidateData, 'candidate' | 'date' | 'avg'>]: {abv: string, full: string, link: string} } = {
    fivethirtyeight: {abv: "538", full: "538 (ABC News)", link: "https://projects.fivethirtyeight.com/polls/president-general/2024/national/"},
    natesilver: {abv: "Nate Silver", full: "Silver Bulletin", link: "https://www.natesilver.net/p/we-removed-rfk-jr-from-our-model"},
    nyt: {abv: "NYT", full: "New York Times", link: "https://www.nytimes.com/interactive/2024/us/elections/polls-president.html"},
    realclearpolling: {abv: "RCP", full: "RealClear Politics", link: "https://www.realclearpolling.com/polls/president/general/2024/trump-vs-harris"},
    economist: {abv: "Economist", full: "The Economist", link: "https://www.economist.com/interactive/us-2024-election/trump-harris-polls"},
}; */

async function fetchPollData(): Promise<Record<string, PollData>> {
    const basePath = 'data/';
    let fetchedData: Record<string, PollData> = {};
    for (const tableName of ["sure_voters", "all_voters"]) {
        const response = await fetch(basePath + tableName + ".csv");
        const csvText = await response.text();
        fetchedData[tableName] = d3.csvParse(csvText) as unknown as PollData;
    }
    return fetchedData;
}

function isDataStale() {
    const oneHour = 1000 * 60 * 60;
    const now = new Date();
    const lastUpdated = new Date(sessionStorage.getItem("pollsDataUpdated") || 0);
    const diff = now.getTime() - lastUpdated.getTime();

    return (
        sessionStorage.getItem("pollsData") == null ||
        sessionStorage.getItem("pollsDataUpdated") == null ||
        diff >= oneHour
    );
}

async function getPollData(): Promise<Record<string, PollData> | false> {
    let retrivedData = null;

    if (isDataStale()) {
        const fetchedData = await fetchPollData();
        if (!fetchedData) return false;
        
        const now = new Date();
        sessionStorage.setItem("pollsData", JSON.stringify(fetchedData));
        sessionStorage.setItem("pollsDataUpdated", now.toString());
        retrivedData = fetchedData;
    } else {
        const storedData = sessionStorage.getItem("pollsData");
        if (storedData === null) return false;

        retrivedData = JSON.parse(storedData) as Record<string, PollData>;
    }

    retrivedData.sure_voters.forEach((d) => {
        d.date = new Date(d.date);
    });
    retrivedData.all_voters.forEach((d) => {
        d.date = new Date(d.date);
    });

    return retrivedData;
}

export { getPollData };
