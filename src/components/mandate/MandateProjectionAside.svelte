<script lang="ts">
    import type { Simulation } from "$lib/types";
    import { createEventDispatcher, onMount } from "svelte";
    import SimulationNameSpan from "./SimulationNameSpan.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import SectionCard from "$components/section/SectionCard.svelte";
    import Paragraph from "$components/grid/Paragraph.svelte";

    export let data = {} as Record<string, Simulation>;
    export let sticky = false;
    export let selectedSimulation = "main";

    const dispatch = createEventDispatcher();

    function selectSimulation(simulation: string) {
        selectedSimulation = simulation;
        dispatch("selectSimulation", simulation);
    }
</script>

{#if sticky}
    <div id="sticky-mandate-projection-header">
        <h2>Mandátumbecslés</h2>
        <div class="simulations">
            {#each Object.keys(data) as key}
                <button
                    type="button"
                    on:click={() => selectSimulation(key)}
                    class:selected={selectedSimulation === key}
                >
                    <SimulationNameSpan inactive={selectedSimulation !== key}>{data[key].metadata.name}</SimulationNameSpan>
                </button>
            {/each}
        </div>
    </div>
{:else}
    <SectionCard id="mandate-projection-aside">
        <SectionTitle centered variant="tiny">Becslések</SectionTitle>
        <div class="simulations">
            {#each Object.keys(data) as key}
                <button
                    type="button"
                    on:click={() => selectSimulation(key)}
                    class:selected={selectedSimulation === key}
                >
                    <!-- <SectionTitle variant="tiny">{data[key].metadata.name}</SectionTitle> -->
                    <h3>{data[key].metadata.name}</h3>
                    <Paragraph --margin="8px">{data[key].metadata.description}</Paragraph>
                    <Paragraph>
                        Frissítve: {data[key].metadata.updatedAt ? new Date(data[key].metadata.updatedAt).toLocaleDateString("hu-HU") : ''}
                    </Paragraph>
                </button>
            {/each}
        </div>
    </SectionCard>
{/if}

<style lang="scss">
    #sticky-mandate-projection-header {
        display: flex;
        padding: 8px 12px;
        background-color: #f2f2f2;
        gap: 1rem;

        h2 {
            font-size: 16px;
            font-weight: 400;
            margin-right: auto;
        }

        .simulations {
            display: flex;
            gap: 1rem;
            margin-top: 0;
        }

        button {
            all: unset;
            cursor: pointer;
        }
    }

    .simulations {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-top: 8px;

        button {
            text-align: left;
            padding: 8px 6px;
            border: 1px solid #eee;
            border-radius: 4px;
            background-color: #f9f9f9;
            cursor: pointer;

            &.selected {
                padding: 7px 5px;
                border-width: 2px;
                border-color: #6de635;
                
                h3 {
                    font-weight: 400;
                }
            }

            h3 {
                margin: 0;
                font-weight: 300;
                font-size: 1rem;
            }

            p {
                margin-top: 3px;
            }
        }
    }
</style>
