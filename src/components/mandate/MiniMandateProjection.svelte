<script lang="ts">
    import type { Simulation } from "$lib/types";
    import MiniMandateProjectionWithBottomBar from "./MiniMandateProjectionWithBottomBar.svelte";

    export let data: Record<string, Simulation> = {};
    export let selectedSimulation = 'main';
    export let forceHorizontalMode = false; // New parameter for horizontal mobile mode
</script>

<MiniMandateProjectionWithBottomBar 
    {data} 
    {selectedSimulation} 
    {forceHorizontalMode}
/>