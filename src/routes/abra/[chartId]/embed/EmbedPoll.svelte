<script lang="ts">
    import type { HistoricalSimulationData, MandateProjectionData, PollData, PollsterGroup, Simulation } from "$lib/types";
    import PollsCardFromData from "$components/poll/PollsCardFromData.svelte";
    import PollsChartFromData from "$components/poll/PollsChartFromData.svelte";

    export let data: {
        sure_voters: PollData;
        all_voters: PollData;
        simulationData: Record<string, Simulation>;
        mandateProjectionData: MandateProjectionData;
        historicalSimulationData: HistoricalSimulationData;
    };
    export let chartName: string | null;
    export let showOnlyChart: boolean;
    export let voterType: "sure_voters" | "all_voters" | undefined;
    export let pollsterGroup: PollsterGroup | undefined;
</script>

{#if !showOnlyChart}
    <PollsCardFromData
        {data}
        chart_id={chartName!}
        showSource={!showOnlyChart}
        featured={false}
        hideBottomMenu={true}
    />
{:else}
    <div class="embed-chart">
        <PollsChartFromData
            {data}
            chart_id={chartName!}
            {voterType}
            {pollsterGroup}
        />
        <div class="attribution">
            <p>Ábra: Vox Populi</p>
            <p><a target="_blank" href="https://2026.kozvelemeny.org">2026.kozvelemeny.org</a></p>
        </div>
    </div>
{/if}

<style lang="scss">
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
</style>
