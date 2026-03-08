<script lang="ts">
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { pollData, simulationData, fetchData, mandateProjectionData } from "$stores/dataStore";
    import type { MandateProjectionData, PollData, PollsterGroup, Simulation } from "$lib/types";
    import PollsCardFromData from "$components/poll/PollsCardFromData.svelte";
    import GridItem from "$components/grid/GridItem.svelte";
    import PollsChartFromData from "$components/poll/PollsChartFromData.svelte";
    import OevkSectionCard from "$components/mandateProjection/OEVKSectionCard.svelte";
    import FideszTiszaBeeswarmCard from "$components/mandate/beeswarm/FideszTiszaBeeswarmCard.svelte";

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
    };

    onMount(() => {
        fetchData();
        // Add styles for embedded view
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.body.style.background = "transparent";
    });

    $: showOnlyChart = page.url.searchParams.get("chart_only") === "true";
    $: voterType = page.url.searchParams.get("voter_type") as "sure_voters" | "all_voters" | undefined;
    $: pollsterGroup = page.url.searchParams.get("pollster_group") as PollsterGroup | undefined;

    $: data = {
        sure_voters: $pollData.sure_voters,
        all_voters: $pollData.all_voters,
        simulationData: $simulationData,
        mandateProjectionData: $mandateProjectionData,
    }
</script>

<GridItem variant="full">
    <div class="embed-container">
        {#if chartType === 'map'}
            <OevkSectionCard
                data={data.simulationData[chartName || 'main']?.oevkDiffs}
                simulationName={data.simulationData[chartName || 'main']?.metadata.name}
                simulationKey={chartName || 'main'}
            />
        {:else if chartType === 'beeswarm'}
            <FideszTiszaBeeswarmCard simulationData={data.simulationData} selectedSimulation={chartName ?? 'main'} />
        {:else if chartType === 'poll' && chartName}
            {#if !showOnlyChart}
                <PollsCardFromData
                    {data}
                    chart_id={chartName}
                    showSource={!showOnlyChart}
                    featured={false}
                />
            {:else}
                <div class="embed-chart">
                    <PollsChartFromData
                        {data}
                        chart_id={chartName}
                        voterType={voterType}
                        pollsterGroup={pollsterGroup}
                    />
                    <div class="attribution">
                        <p>Ábra: Vox Populi</p>
                        <p><a target="_blank" href="https://valasztas-2026.kozvelemeny.org">valasztas-2026.kozvelemeny.org</a></p>
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</GridItem>

<style lang="scss">
    :global(#mainHeader, .menuStrip) {
        display: none !important;
    }

    :global(#appContainer) {
        padding: 0 !important;
    }

    .embed-container {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .embed-chart {
        margin-top: -1rem;
        .attribution {
            display: flex;
            justify-content: space-between;
            width: 100%;
            
            margin: 0;
            margin-top: -2rem;
            padding: 4px 12px;
            padding-top: 1rem;
            
            background-color: #f5f5f5;
            z-index: -1;

            p {
                margin: 0;
                color: #666;
            }

            a {
                color: #666;
                text-decoration: none;
            }
        }
    }

    :global(body) {
        overflow: hidden;
    }
</style>
