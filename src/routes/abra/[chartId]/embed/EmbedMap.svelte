<script lang="ts">
    import type { MandateProjectionData, PollData, Simulation } from "$lib/types";
    import OevkSectionCard from "$components/mandateProjection/OEVKSectionCard.svelte";
    import OevkMap from "$components/mandate/map/OEVKMap.svelte";
    import OevkDistribution from "$components/mandateProjection/OEVKDistribution.svelte";

    export let data: {
        sure_voters: PollData;
        all_voters: PollData;
        simulationData: Record<string, Simulation>;
        mandateProjectionData: MandateProjectionData;
    };
    export let chartName: string | null;
    export let showOnlyChart: boolean;

    let highlightedOevk: string | null = null;

    function handleOevkHover(event: CustomEvent<string>) {
        highlightedOevk = event.detail != null ? String(event.detail) : null;
    }
</script>

{#if !showOnlyChart}
    <OevkSectionCard
        data={data.simulationData[chartName || 'main']?.oevkDiffs}
        simulationName={data.simulationData[chartName || 'main']?.metadata.name}
        simulationKey={chartName || 'main'}
        hideBottomMenu={true}
    />
{:else}
    <div class="embed-chart">
        <OevkMap
            data={data.simulationData[chartName || 'main']?.oevkDiffs}
            {highlightedOevk}
            on:oevkHover={handleOevkHover}
            showInfoBar={false}
            disableZoomPan={true}
        />
        <OevkDistribution
            data={data.simulationData[chartName || 'main']?.oevkDiffs}
            {highlightedOevk}
            on:oevkHover={handleOevkHover}
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
