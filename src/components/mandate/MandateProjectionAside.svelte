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

    export let stickyHeaderStyle: { left: number; width: number; top: number; opacity: number } = {
        left: 0,
        width: 0,
        top: 0,
        opacity: 0
    };

    const dispatch = createEventDispatcher();

    function selectSimulation(simulation: string) {
        selectedSimulation = simulation;
        dispatch("selectSimulation", simulation);
    }
</script>

<div
    id="sticky-mandate-projection-header"
    class:visible={sticky}
    style="position: fixed; left: {stickyHeaderStyle.left}px; width: {stickyHeaderStyle.width}px; top: {stickyHeaderStyle.top}px; opacity: {stickyHeaderStyle.opacity};"
>
        <h2>Mandátumbecslés</h2>
        <div class="simulations simulations--compact">
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

<div id="mandate-projection-aside" class:collapsed={sticky}>
    <SectionCard>
    <SectionTitle centered variant="tiny">Válassz becslést</SectionTitle>
    <div class="simulations">
        {#each Object.keys(data) as key}
            <button
                type="button"
                on:click={() => selectSimulation(key)}
                class:selected={selectedSimulation === key}
            >
                <h3>{data[key].metadata.name}</h3>
                <Paragraph --margin="8px">{data[key].metadata.description}</Paragraph>
                <Paragraph>
                    Frissítve: {data[key].metadata.updatedAt
                        ? new Date(data[key].metadata.updatedAt).toLocaleDateString("hu-HU")
                        : ""}
                </Paragraph>
            </button>
        {/each}
    </div>
    </SectionCard>
</div>

<style lang="scss">
    #sticky-mandate-projection-header {
        z-index: 3;
        display: flex;
        padding: 8px 12px;
        background-color: #fcfcfc;
        border-bottom: 2px solid #6de635;
        gap: 1rem;
        pointer-events: none;
        transform: translateY(-100%);
        transition:
            transform 220ms ease-out,
            opacity 220ms ease-out;

        &.visible {
            transform: translateY(0);
            pointer-events: auto;
        }

        h2 {
            font-size: 16px;
            font-weight: 400;
            margin-right: auto;
        }

        .simulations {
            display: flex;
            gap: 1rem;
            margin-top: 0;
            padding: 1px 0;
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
    }

    .simulations button {
        text-align: left;
        padding: 8px 6px;
        border: 1px solid #eee;
        border-radius: 4px;
        background-color: #f9f9f9;
        cursor: pointer;
    }

    .simulations button.selected {
        padding: 7px 5px;
        border-width: 2px;
        border-color: #6de635;
    }

    .simulations button.selected h3 {
        font-weight: 400;
    }

    .simulations h3 {
        margin: 0;
        font-weight: 300;
        font-size: 1rem;
    }

    .simulations--compact {
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        padding-bottom: 4px;

        button {
            border: none;
            background: transparent;
            padding: 0;
        }
    }

    #mandate-projection-aside {
        position: relative;
        overflow: hidden;
        max-height: 1200px;
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
        transition:
            max-height 440ms ease-out,
            opacity 440ms ease-out,
            transform 440ms ease-out;

        &.collapsed {
            max-height: 0;
            opacity: 0;
            transform: translateY(-12px);
            pointer-events: none;
            transition: none;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        #sticky-mandate-projection-header,
        #mandate-projection-aside {
            transition: none;
        }
    }
</style>
