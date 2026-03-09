<script lang="ts">
    import { charts } from "$lib/charts";
    import type { HistoricalSimulationData, MandateProjectionData, PollData, PollsterGroup } from "$lib/types";
    import PollsChart from "./PollsChart.svelte";
    import MandateProjectionChart from "$components/mandate/MandateProjectionChart.svelte";

    export let data = {
        sure_voters: [] as PollData,
        all_voters: [] as PollData,
        mandateProjectionData: [] as MandateProjectionData,
        historicalSimulationData: {} as HistoricalSimulationData,
    };
    export let chart_id: string;
    export let voterType = undefined as "sure_voters" | "all_voters" | undefined;
    export let pollsterGroup = undefined as string | undefined;
    /** For mandate chart: which historical simulation scenario to use for the line (e.g. "main", "kormanyfuggetlen", "kormanykozeli"). */
    export let scenarioKey = undefined as string | undefined;

    const chartData = charts.hasOwnProperty(chart_id) ? charts[chart_id] : null;

    $: effectiveVoterType = voterType || (chartData?.voterType || "sure_voters");
    $: effectivePollsterGroup = pollsterGroup || (chartData?.pollsterGroup || "kormányfüggetlen");
    $: series = chartData?.isMandateProjection ? data.mandateProjectionData : data[effectiveVoterType];
</script>

{#if chartData}
    {#if chartData.isMandateProjection}
        <MandateProjectionChart
            id={chart_id}
            historicalSimulationData={data.historicalSimulationData}
            mandateProjectionData={data.mandateProjectionData}
            scenarioKey={scenarioKey ?? "main"}
            selectedParties={chartData.selectedParties}
            dateRange={chartData.dateRange}
            annotations={chartData.annotations}
            renderOptions={chartData.renderOptions}
            selectedPollsterGroup={effectivePollsterGroup as PollsterGroup}
        />
    {:else}
        <PollsChart
            id={chart_id}
            pollData={series}
            selectedParties={chartData.selectedParties}
            dateRange={chartData.dateRange}
            annotations={chartData.annotations}
            renderOptions={chartData.renderOptions}
            selectedPollsterGroup={effectivePollsterGroup as PollsterGroup}
        />
    {/if}
{/if}
