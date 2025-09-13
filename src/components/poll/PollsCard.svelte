<script lang="ts">
    import type {
        Annotation,
        DataSelect,
        DateRange,
        Party,
        Poll,
        PollData,
        PollsterGroup,
        MandateProjectionData,
        MandateProjection,
    } from "$lib/types";
    import { onMount } from "svelte";
    import { pollsterGroups } from "$stores/dataStore";
    import PollsChart from "./PollsChart.svelte";
    import BottomMenu from "$components/ui/bottom-menu/BottomMenu.svelte";
    import BottomMenuItem from "$components/ui/bottom-menu/BottomMenuItem.svelte";

    export let data = {
        sure_voters: [] as PollData,
        all_voters: [] as PollData,
        mandateProjectionData: [] as MandateProjectionData,
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
    export let pollsterGroup = "összes" as PollsterGroup;
    export let isMandateProjection = false;

    export let featured = false;
    export let showSource = false;

    let chartOptions = {
        data: [] as Poll[] | MandateProjection[],
        pollsterGroupIndex: (pollsterGroups.findIndex(
            (group) => group === pollsterGroup,
        ) || 0) as 0 | 1 | 2,
        smoothing: "movingAverage" as "movingAverage" | "lowess",
    };

    let articleMap = {
        0: "az",
        1: "a\xa0",
        2: "a\xa0",
        3: "az",
    };

    let windowDays = 0;

    onMount(() => {
        const loadingInterval = setInterval(() => {
            if (!chartOptions.data.length && data[voterType]?.length) {
                if (isMandateProjection) {
                    chartOptions.data = data.mandateProjectionData;
                } else {
                    chartOptions.data = data[voterType];
                }
                clearInterval(loadingInterval);
            }
        }, 10);
    });
</script>

<article class="pollGraph" class:featured>
    <h1>{title}</h1>
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
                        <option value={i}>{group}</option>
                    {/each}
                </select>
                közvélemény-kutató{!chartOptions.pollsterGroupIndex ? "" : "k"} adatai
                alapján,
            {/if}
            {windowDays} napos
            <select bind:value={chartOptions.smoothing}>
                <option value="movingAverage">mozgóátlag</option>
                <option value="lowess">LOWESS-regresszió</option>
            </select>
        </p>
    </div>
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
                <BottomMenuItem link={`/abra/${chartId}`}>Módszertan</BottomMenuItem>
                <BottomMenuItem link={`/abra/${chartId}`}>Megosztás</BottomMenuItem>
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

        &.featured {
            h1 {
                font-size: 26px;
                font-weight: 500;
            }
        }

        h1 {
            font-size: 22px;
            font-weight: 400;
        }

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
