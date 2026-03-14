<script lang="ts">
    import { page } from "$app/state";
    import { onMount, tick } from "svelte";
    import { pollData, simulationData, fetchData, mandateProjectionData, historicalSimulationData } from "$stores/dataStore";
    import type { HistoricalSimulationData, MandateProjectionData, PollData, PollsterGroup, Simulation } from "$lib/types";
    import GridItem from "$components/grid/GridItem.svelte";

    const chartId = page.params.chartId;

    let chartType = null as 'poll' | 'beeswarm' | 'map' | null;
    let chartName = chartId?.slice(2) || null;
    let showOnlyChart: boolean;
    let voterType: "sure_voters" | "all_voters" | undefined;
    let pollsterGroup: PollsterGroup | undefined;

    $: {
        if (chartId?.slice(0, 2) === 't-') {
            chartType = 'map';
        } else if (chartId?.slice(0, 2) === 'b-') {
            chartType = 'beeswarm';
        } else if (chartId?.slice(0, 2) === 'g-') {
            chartType = 'poll';
        } else {
            chartType = null;
        }
    }

    let data = {
        sure_voters: [] as PollData,
        all_voters: [] as PollData,
        simulationData: {} as Record<string, Simulation>,
        mandateProjectionData: [] as MandateProjectionData,
        historicalSimulationData: {} as HistoricalSimulationData,
    };

    $: showOnlyChart = page.url.searchParams.get("chart_only") === "true";
    $: voterType = page.url.searchParams.get("voter_type") as "sure_voters" | "all_voters" | undefined;
    $: pollsterGroup = page.url.searchParams.get("pollster_group") as PollsterGroup | undefined;

    $: data = {
        sure_voters: $pollData.sure_voters,
        all_voters: $pollData.all_voters,
        simulationData: $simulationData,
        mandateProjectionData: $mandateProjectionData,
        historicalSimulationData: $historicalSimulationData,
    };

    let embedContainer: HTMLDivElement | undefined;

    function sendResize() {
        if (!embedContainer || typeof window.parent === "undefined") return;
        const height = embedContainer.scrollHeight;
        const width = embedContainer.scrollWidth;
        window.parent.postMessage(
            { type: "vox-populi-embed-resize", height, width },
            "*"
        );
    }

    onMount(() => {
        fetchData();
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.body.style.background = "transparent";

        let teardown: (() => void) | void;
        tick().then(() => {
            if (!embedContainer) return;
            let debounceId: ReturnType<typeof setTimeout>;
            const ro = new ResizeObserver(() => {
                clearTimeout(debounceId);
                debounceId = setTimeout(sendResize, 100);
            });
            ro.observe(embedContainer);
            const initialId = setTimeout(sendResize, 300);
            teardown = () => {
                clearTimeout(debounceId);
                clearTimeout(initialId);
                ro.disconnect();
            };
        });
        return () => teardown?.();
    });
</script>

<GridItem variant="full">
    <div class="embed-container" bind:this={embedContainer}>
        {#if chartType === 'map'}
            {#await import('./EmbedMap.svelte')}
                <div></div>
            {:then mod}
                <mod.default
                    {data}
                    {chartName}
                    {showOnlyChart}
                />
            {/await}
        {:else if chartType === 'beeswarm'}
            {#await import('./EmbedBeeswarm.svelte')}
                <div></div>
            {:then mod}
                <mod.default
                    {data}
                    {chartName}
                    {showOnlyChart}
                />
            {/await}
        {:else if chartType === 'poll' && chartName}
            {#await import('./EmbedPoll.svelte')}
                <div></div>
            {:then mod}
                <mod.default
                    {data}
                    {chartName}
                    {showOnlyChart}
                    {voterType}
                    {pollsterGroup}
                />
            {/await}
        {/if}
    </div>
</GridItem>

<style lang="scss">
    .embed-container {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    :global(body) {
        overflow: hidden;
    }
</style>
