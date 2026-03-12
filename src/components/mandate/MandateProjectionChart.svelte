<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { Chart } from "$lib/chart/Chart";
    import type { Annotation, DateRange, HistoricalSimulationData, MandateProjectionData, Party, PollsterGroup } from "$lib/types";

    export let id: string;
    export let historicalSimulationData: HistoricalSimulationData = {};
    export let mandateProjectionData: MandateProjectionData = [];
    export let selectedParties = undefined as Party[] | undefined;
    export let selectedPollsterGroup = "kormányfüggetlen" as PollsterGroup;
    export let dateRange = undefined as DateRange | undefined;
    export let annotations = [] as Annotation[];
    export let renderOptions = undefined as Record<string, any> | undefined;
    /** Scenario key for the line (e.g. "main", "kormanyfuggetlen", "kormanykozeli"). Default "main". */
    export let scenarioKey = "main";

    let chart = undefined as Chart | undefined;
    let containerElement: HTMLElement | null = null;
    const dispatch = createEventDispatcher();

    onMount(() => {
        containerElement = document.getElementById(id) ?? null;
    });

    $: simulation = historicalSimulationData[scenarioKey];
    $: if (containerElement && simulation != null && !chart) {
        chart = new Chart(containerElement, { historicalSimulation: simulation, mandateProjectionData }, {
            dateRange,
            selectedParties,
            selectedPollsterGroup,
            annotations,
            renderOptions,
        });
        dispatch("updateWindowDays", chart.windowDays);
    }
    $: if (chart && simulation != null) {
        chart.setOptions({
            historicalSimulation: simulation,
            mandateProjectionData,
            dateRange,
            selectedParties,
            selectedPollsterGroup,
            annotations,
            renderOptions,
        });
        dispatch("updateWindowDays", chart.windowDays);
    }

    onDestroy(() => {
        chart?.destroy();
    });
</script>

<article class="polls" id={id}></article>

<style lang="scss">
    .polls {
        margin: 1rem 0;
        overflow: hidden;
    }

    :global(.polls svg) {
        width: 100%;
        height: auto;
        overflow: visible;
        background-color: #f9f9f9;
        border: 2px solid #f5f5f5;
    }
</style>
