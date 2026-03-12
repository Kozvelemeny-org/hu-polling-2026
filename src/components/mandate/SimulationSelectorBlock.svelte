<script lang="ts">
    import type { Simulation } from "$lib/types";
    import MandateProjectionAside from "./MandateProjectionAside.svelte";
    import SimulationNameSpan from "./SimulationNameSpan.svelte";
    import StickyAside from "$components/grid/StickyAside.svelte";
    import BottomSheet from "$components/ui/BottomSheet.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";

    export let data: Record<string, Simulation> = {};
    export let selectedSimulation = "main";
    export let triggerLabel = "Válassz becslést";

    let showSheet = false;

    function selectSimulation(simulation: string) {
        selectedSimulation = simulation;
    }
</script>

<div class="triggerWrapper">
    <button type="button" class="trigger" on:click={() => (showSheet = true)}>
        <span class="triggerLabel">{triggerLabel}</span>
        {#if data[selectedSimulation]}
            <span class="triggerValue">
                <SimulationNameSpan>{data[selectedSimulation].metadata.name}</SimulationNameSpan>
            </span>
        {/if}
    </button>
</div>

<StickyAside let:sticky>
    <div class="desktopAside">
        <MandateProjectionAside
            {data}
            {sticky}
            {selectedSimulation}
            on:selectSimulation={(e) => selectSimulation(e.detail)}
        />
    </div>
</StickyAside>

<BottomSheet bind:open={showSheet} on:close={() => (showSheet = false)}>
    <MandateProjectionAside
        {data}
        sticky={false}
        {selectedSimulation}
        on:selectSimulation={(e) => {
            selectSimulation(e.detail);
            showSheet = false;
        }}
    />
</BottomSheet>

<style lang="scss">
    .triggerWrapper {
        position: fixed;
        inset-inline: 0;
        bottom: 0;
        margin: 0 auto;
        max-width: 720px;
        width: 100%;
        z-index: 35;
    }

    .trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 10px 16px max(env(safe-area-inset-bottom, 0px) + 6px, 12px);
        border: none;
        border-radius: 12px 12px 0 0;
        background-color: #ffffff;
        box-shadow: 0 -2px 18px rgba(0, 0, 0, 0.18);
        font-size: 0.95rem;
        cursor: pointer;
    }

    .triggerLabel {
        font-weight: 500;
    }

    .triggerValue {
        margin-left: auto;
        font-weight: 400;
        color: #333;
    }

    .desktopAside {
        display: none;
    }

    @media (min-width: 600px) {
        .triggerWrapper {
            position: static;
            display: none;
        }

        .desktopAside {
            display: block;
        }
    }
</style>
