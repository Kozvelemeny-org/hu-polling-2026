<script lang="ts">
    import type { Party } from "$lib/types";
    import { partyData } from "$stores/dataStore";

    export let parties: Party[] = [];
</script>

<div class="legendContainer">
    <div class="colorLegend">
        {#each parties as party}
            <div class="colorLegendItem">
                <div
                    class="dot"
                    style="border-color: {partyData[party]
                        .color};background-color: {partyData[party]
                        .color}11;"
                ></div>
                <span style="color: {partyData[party].color};">{partyData[party].name}</span>
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
    .legendContainer {
        display: flex;
        flex-direction: column;
        width: 100%;
        border-top: 2px solid #f5f5f5;
        padding-top: 12px;
    }

    .colorLegend {
        display: flex;
        flex-direction: row;
        margin: 0 auto;
        gap: 12px;

        .colorLegendItem {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 2px;

            .dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                border: 1px solid #eee;
            }

            span {
                font-size: 12px;
            }
        }
    }
</style>