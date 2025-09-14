import type { ChartData } from "./types";

export const charts: Record<string, ChartData> = {
    // Homepage
    'fidesz-tisza': {
        featured: true,
        title: "A Fidesz és a Tisza versenyfutása",
        selectedParties: ["tisza", "fidesz", "unsure"],
        dataSelects: ["pollster_group", "voter_type"],
        dateRange: { start: new Date(2023, 11, 1), end: new Date(2026, 3, 4) },
        annotations: [
            {
                id: "marc-15",
                text: "Március 15.",
                date: new Date(2024, 2, 15),
                lineType: "dotted",
            },
            {
                id: "ep-24",
                text: "EP-választás",
                date: new Date(2024, 5, 9),
                lineType: "dotted",
            },
            {
                id: "ogy-26",
                text: "2026-os választások",
                date: new Date(2026, 3, 1),
                lineType: "dotted",
            },
        ],
        renderOptions: { aspectRatio: 3 / 2 },
        description: `
            <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Corrupti aliquam, qui sint delectus quod, 
                culpa temporibus reiciendis, minima eveniet officia cupiditate iusto omnis ea provident quisquam
                ducimus dicta reprehenderit laudantium!
            </p>
        `
    },
    'mandate-projection': {
        title: "Egyes kutatásokon alapuló mandátumbecslések alakulása",
        dataSelects: ["pollster_group"],
        selectedParties: ["fidesz", "tisza"],
        dateRange: { start: new Date(2023, 11, 1), end: new Date(2026, 3, 4) },
        annotations: [
            {
                id: "ep-24",
                text: "EP-választás",
                date: new Date(2024, 5, 9),
                lineType: "dotted",
            },
        ],
        isMandateProjection: true,
        renderOptions: { aspectRatio: 3 / 2 },
    },
    'all-parties': {
        title: "Parlamentbe jutásra esélyes pártok támogatottsága",
        selectedParties: ["tisza", "fidesz", "dk", "mihazank", "mkkp", "momentum"],
        dataSelects: ["pollster_group", "voter_type"],
        dateRange: { start: new Date(2018, 0, 1), end: new Date(2026, 3, 4) },
        annotations: [
            {
                id: "ogy-18",
                text: "OGY. 2018",
                date: new Date(2018, 3, 8),
                lineType: "dotted",
            },
            {
                id: "ogy-22",
                text: "OGY. 2022",
                date: new Date(2022, 3, 3),
                lineType: "dotted",
            },
            {
                id: "ogy-26",
                text: "OGY. 2026",
                date: new Date(2026, 3, 4),
                lineType: "dotted",
            },
        ],
        renderOptions: { aspectRatio: 3 / 2, yLims: [0, 0.59] },
    },
    'kis-partok': {
        title: "A kis pártok támogatottsága",
        dataSelects: ["pollster_group"],
        selectedParties: ["mkkp", "mihazank", "dk"],
        dateRange: { start: new Date(2023, 11, 1), end: new Date() },
        annotations: [{
            id: "marc-15",
            text: "Március 15.",
            date: new Date(2024, 3, 15),
            lineType: "dotted",
        }],
        renderOptions: { aspectRatio: 2 / 1, yLims: [0, 0.23] },
    },
}