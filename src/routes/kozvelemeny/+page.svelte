<script lang="ts">
    import type { Party, PollData } from "$lib/types";
    import { onMount } from "svelte";
    import { pollData, fetchPollData } from "../../stores/dataStore";
    import PollsChart from "../../components/PollsChart.svelte";
    import MenuStrip from "../../components/MenuStrip.svelte";
    import PollsCard from "../../components/PollsCard.svelte";
    import InteractivePollsCard from "../../components/InteractivePollsCard.svelte";
    import RecentPollCard from "../../components/RecentPollCard.svelte";
    import RecentPollsAside from "../../components/RecentPollsAside.svelte";

    let data: Record<'sure_voters' | 'all_voters', PollData> = {
        sure_voters: [],
        all_voters: [],
    };

    let articleMap = {
        0: "az",
        1: "a\xa0",
        2: "a\xa0",
        3: "az",
    }

    onMount(fetchPollData);

    $: data = $pollData;
</script>

<div id="interactive-polls">
    <InteractivePollsCard
        {data}
        description="A közvélemény-kutatások eredményei alapján a következő mandátumokat kapnák a pártok az Országgyűlésben."
        selectedParties={["fidesz", "tisza"]}
        dateRange={undefined}
        annotations={[]}
        voterType="sure_voters"
        pollsterGroup="összes"
        featured
    />
</div>
<RecentPollsAside {data} />
<div id="all-parties">
    <PollsCard
        {data}
        title="Parlamentbe jutásra esélyes pártok támogatottsága"
        dataSelects={["pollster_group", "voter_type"]}
        description="90 napos mozgóátlag."
        dateRange={{ start: new Date(2018, 0, 1), end: new Date(2026, 4, 10) }}
        annotations={[
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
        ]}
        renderOptions={{ aspectRatio: 3 / 2, yLims: [0, 0.69] }}
    />
</div>
<PollsCard
    {data}
    title="Kiábrándult fideszesek nyomában"
    dataSelects={["pollster_group"]}
    description="A biztos szavazók körében, 30 napos mozgóátlag."
    selectedParties={["fidesz", "unsure"] as Party[]}
    voterType="all_voters"
    dateRange={{ start: new Date(2018, 0, 1), end: new Date() }}
    annotations={
        [{
            id: "ogy-22",
            text: "OGY. 2022 ",
            date: new Date(2022, 3, 3),
            lineType: "dotted",
        }]
    }
    renderOptions={{ aspectRatio: 3 / 2, yLims: [0, 0.65] }}
/>
<section id="polls-description" class="bodyContainer">
    <h2>Nem tudom, hogy mi lehet itten</h2>
</section>
<PollsCard
    {data}
    title="A Fideszen kívül a választások óta"
    dataSelects={["pollster_group"]}
    description="A biztos szavazók körében, 30 napos mozgóátlag."
    selectedParties={[
        "momentum",
        "mkkp",
        "mihazank",
        "dk_mszp_p",
        "tisza",
        "unsure",
    ] as Party[]}
    dateRange={{ start: new Date(2022, 0, 1), end: new Date() }}
    annotations={
        [{
            id: "ogy-22",
            text: "OGY. 2022 ",
            date: new Date(2022, 3, 3),
            lineType: "dotted",
        }]
    }
    renderOptions={{ aspectRatio: 3 / 2, yLims: [0, 0.55] }}
/>
<aside></aside>

<style lang="scss">
    .bodyContainer {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 700px;
        line-height: 1.4;
        border: 1px dashed blue;
        border-top: none;
    }

    article {
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
        padding: 8px 16px;
    }

    h1 {
        font-size: 1.8rem;
        font-weight: 500;
    }

    h2 {
        font-size: 22px;
        font-weight: 500;
        text-align: center;
    }

    p {
        font-size: 16px;
        margin-top: 12px;
    }

    @media (min-width: 600px) {
        .sectionTitle {
            grid-column: 1 / 3;
        }

        #interactive-polls {
            grid-column: 1 / 3;
        }

        #all-parties {
            grid-column: 2 / 3;
        }

        #polls-description {
            grid-column: 2 / 3;
            grid-row: span 2;
        }

        .poll-graph {
            grid-column: span 1;
            grid-row: span 1;
        }
    }

    @media (min-width: 800px) {
        .sectionTitle {
            grid-column: 1 / 5;
        }

        #interactive-polls {
            grid-column: 1 / 5;
        }

        #all-parties {
            grid-column: 2 / 5;
        }

        #polls-description {
            grid-column: 3 / 5;
            grid-row: span 2;
        }

        .poll-graph {
            grid-column: span 2;
            grid-row: span 1;
        }
    }
</style>
