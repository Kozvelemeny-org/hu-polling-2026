<script lang="ts">
    import type { PartyData } from "$lib/types";

    export let party: PartyData[keyof PartyData];
</script>

<div class="labelContainer">
    <div class="label">{party.name}</div>
</div>

<style lang="scss">
    .labelContainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .label {
            font-size: 12px;
            font-weight: 400;
        }
    }
</style>