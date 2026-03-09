<script lang="ts">
    import type {
        Annotation,
        DataSelect,
        DateRange,
        HistoricalSimulationData,
        Party,
        Poll,
        PollData,
        PollsterGroup,
        MandateProjectionData,
        MandateProjection,
        SmoothingMethod,
    } from "$lib/types";
    import { onMount } from "svelte";
    import { pollsterGroups } from "$stores/dataStore";
    import PollsChart from "./PollsChart.svelte";
    import MandateProjectionChart from "$components/mandate/MandateProjectionChart.svelte";
    import BottomMenu from "$components/ui/bottom-menu/BottomMenu.svelte";
    import BottomMenuItem from "$components/ui/bottom-menu/BottomMenuItem.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";

    export let data = {
        sure_voters: [] as PollData,
        all_voters: [] as PollData,
        mandateProjectionData: [] as MandateProjectionData,
        historicalSimulationData: {} as HistoricalSimulationData,
    };
    export let chartId = null as string | null;
    export let title: string;
    export let dataSelects = [] as DataSelect[];
    export let description = "";
    export let selectedParties = undefined as Party[] | undefined;
    export let dateRange = undefined as DateRange | undefined;
    export let annotations = [] as Annotation[];
    export let renderOptions = {} as Record<string, any> | undefined;
    export let voterType = "sure_voters" as "sure_voters" | "all_voters";
    export let pollsterGroup = "voxpopuli" as PollsterGroup;
    export let isMandateProjection = false;

    export let featured = false;
    export let showSource = false;

    let chartOptions = {
        data: [] as Poll[] | MandateProjection[],
        pollsterGroupIndex: Math.max(0, pollsterGroups.findIndex((group) => group === pollsterGroup)) as 0 | 1 | 2,
        smoothing: "weighted-ma" as SmoothingMethod,
    };

    let articleMap = {
        0: "a\xa0",
        1: "a\xa0",
        2: "a\xa0",
    };

    let windowDays = 0;

    onMount(() => {
        const loadingInterval = setInterval(() => {
            if (isMandateProjection) {
                if (data.mandateProjectionData?.length && data.historicalSimulationData?.main) {
                    chartOptions.data = data.mandateProjectionData;
                    clearInterval(loadingInterval);
                }
            } else if (!chartOptions.data.length && data[voterType]?.length) {
                chartOptions.data = data[voterType];
                clearInterval(loadingInterval);
            }
        }, 10);
    });
</script>

<article class="pollGraph" class:featured>
    <SectionTitle variant={featured ? "featured" : "medium"}>{title}</SectionTitle>
    <div class="description">
        <p>
            <!-- {#if dataSelects.includes("voter_type")}
                <select bind:value={chartOptions.data}>
                    <option value={data.sure_voters}>biztos szavazók</option>
                    <option value={data.all_voters}>választókorúak</option>
                </select>
            {/if} -->
            {#if dataSelects.includes("pollster_group")}
                {articleMap[chartOptions.pollsterGroupIndex]}
                <select bind:value={chartOptions.pollsterGroupIndex}>
                    {#each pollsterGroups as group, i}
                        <option value={i}>{group === "voxpopuli" ? "Vox Populi" : group}</option>
                    {/each}
                </select>
                {pollsterGroups[chartOptions.pollsterGroupIndex] === "voxpopuli" ? "módszertana" : "közvélemény-kutatók adatai"}
                alapján,
            {/if}
            {windowDays} napos
            <select bind:value={chartOptions.smoothing}>
                <option value="weighted-ma">súlyozott mozgóátlag</option>
                <option value="ma">mozgóátlag</option>
            </select>
        </p>
    </div>
    {#if isMandateProjection}
        <MandateProjectionChart
            id={"chart" + (Math.random() * 10000).toFixed(0)}
            historicalSimulationData={data.historicalSimulationData}
            mandateProjectionData={data.mandateProjectionData}
            {selectedParties}
            selectedPollsterGroup={pollsterGroups[chartOptions.pollsterGroupIndex]}
            {dateRange}
            {annotations}
            renderOptions={renderOptions}
            on:updateWindowDays={(e) => (windowDays = e.detail)}
        />
    {:else}
        <PollsChart
            id={"chart" + (Math.random() * 10000).toFixed(0)}
            pollData={chartOptions.data}
            {selectedParties}
            selectedPollsterGroup={pollsterGroups[chartOptions.pollsterGroupIndex]}
            {dateRange}
            {annotations}
            renderOptions={{ ...renderOptions, smoothing: chartOptions.smoothing }}
            on:updateWindowDays={(e) => (windowDays = e.detail)}
        />
    {/if}
    <div class="htmlContent">
        {@html description}
    </div>
    {#if showSource}
        <div class="source">
            <p>
                Választás 2026 – Vox Populi, https://valasztas-2026.kozvelemeny.org
            </p>
        </div>
    {:else}
        <BottomMenu>
            {#if chartId}
            <BottomMenuItem link={`/abra/g-${chartId}`}>Megosztás</BottomMenuItem>
            <BottomMenuItem link={`/abra/g-${chartId}`}>Beágyazás</BottomMenuItem>
            {/if}
        </BottomMenu>
    {/if}
</article>

<style lang="scss">
    .pollGraph {
        padding: 8px 1rem;
        width: 100%;
        margin: 0 auto;

        background-color: #fcfcfc;
        border: 1px solid #eee;

        .description {
            margin-top: 8px;
            margin-bottom: 1rem;
        }

        p select {
            padding: 2px;
            width: fit-content;
            min-width: unset;
        }

        :global(.htmlContent p) {
            margin-top: 12px;
        }
    }

    @media (min-width: 800px) {
        .pollGraph {
            grid-column: span 2;
            grid-row: span 1;
        }
    }
</style>
