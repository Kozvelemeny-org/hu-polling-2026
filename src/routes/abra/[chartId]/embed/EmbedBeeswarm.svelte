<script lang="ts">
    import type { MandateProjectionData, PollData, Simulation } from "$lib/types";
    import FideszTiszaBeeswarmCard from "$components/mandate/beeswarm/FideszTiszaBeeswarmCard.svelte";
    import MandateBeeswarm from "$components/mandate/beeswarm/MandateBeeswarm.svelte";
    import ChartCard from "$components/ui/ChartCard.svelte";

    export let data: {
        sure_voters: PollData;
        all_voters: PollData;
        simulationData: Record<string, Simulation>;
        mandateProjectionData: MandateProjectionData;
    };
    export let chartName: string | null;
    export let showOnlyChart: boolean;
</script>

{#if !showOnlyChart}
    <FideszTiszaBeeswarmCard
        simulationData={data.simulationData}
        selectedSimulation={chartName ?? 'main'}
        hideBottomMenu={true}
    />
{:else}
    <div class="embed-chart">
        {#if data.simulationData[chartName ?? 'main']}
            <ChartCard>
                <MandateBeeswarm
                    party="fidesz"
                    simulation={data.simulationData[chartName ?? 'main']}
                    simulationKey={chartName ?? 'main'}
                    numDots={500}
                    height={200}
                    r={2.5}
                />
                <MandateBeeswarm
                    party="tisza"
                    simulation={data.simulationData[chartName ?? 'main']}
                    simulationKey={chartName ?? 'main'}
                    numDots={500}
                    height={200}
                    r={2.5}
                />
            </ChartCard>
        {/if}
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
