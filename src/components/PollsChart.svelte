<script lang="ts">
    import { onMount } from "svelte";
    import { Chart } from "$lib/chart/Chart";
    import type { Annotation, DateRange, Party, PollData, PollsterGroup } from "$lib/types";

    export let id: string;
    export let pollData: PollData;
    export let selectedParties = undefined as Party[] | undefined;
    export let selectedPollsterGroup = 'összes' as PollsterGroup;
    export let dateRange = undefined as DateRange | undefined;
    export let partyIntervals = undefined as Record<Party, [Date, Date][]> | undefined;
    export let annotations = [] as Annotation[]
    export let renderOptions = undefined as Record<string, any> | undefined;

    let chart = undefined as Chart | undefined;
    
    onMount(() => {
        const containerElement = document.getElementById(id);
        if (!containerElement) return;
        chart = new Chart(
            containerElement,
            pollData, {
                dateRange,
                selectedParties,
                selectedPollsterGroup,
                partyIntervals,
                annotations,
                renderOptions,
            }
        );
    });

    $: if (chart && pollData) {
        chart.setOptions({
            pollData,
            dateRange,
            selectedParties,
            selectedPollsterGroup,
            partyIntervals,
            annotations,
            renderOptions,
        });
    }

</script>

<article class="polls" id={id} ></article>

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
