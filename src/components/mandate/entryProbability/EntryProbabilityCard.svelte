<script lang="ts">
    import { calculateEntryProbability } from "$lib";
    import type { Party, Simulation } from "$lib/types";
    import { partyData } from "$stores/dataStore";

    export let parties: Party[];
    export let selectedSimulationData: Simulation;
    export let weekend: { name: string, date: Date };

    $: entryProbabilities = parties.reduce((acc, party) => {
        acc[party] = calculateEntryProbability(selectedSimulationData, party) * 100;
        return acc;
    }, {} as Record<Party, number>);
</script>

<article>
    <header>
        <div class="name">
            {weekend.name}
        </div>
        <div class="date">
            {weekend.date.toLocaleDateString("hu-HU", {
                month: "short",
                day: "numeric",
            })}
        </div>
    </header>
    {#if parties.length > 0}
    <section>
        {#each parties as party}
            <div
                class="valueBackground"
                style="width: {entryProbabilities[party]}%;"
            >
                <div 
                    class="result {party} small"
                    style="background-color: {partyData[party].color+'11'}; border: 1px solid {partyData[party].color+'22'};"
                >
                    <div class="value" style="color: {partyData[party].color};">
                        {entryProbabilities[party].toFixed(0)}%
                    </div>
                </div>
            </div>
        {/each}
    </section>
    {/if}
</article>

<style lang="scss">
    article {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        //border: 1px solid #eee;
        //padding: 6px;
    }

    header {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        .date, .name {
            font-size: 14px;
        }

        .date {
            color: #888;
        }
    }

    section {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 3px;
        padding-left: 30px;

        .valueBackground {
            background-color: #fff;
        }
        .result {
            position: relative;
            padding: 2px 0;
            text-align: right;
            color: white;
            flex-grow: 1;
            height: 23px;

            &.small {
                height: 15px;
            }

            .value {
                position: absolute;
                left: -30px;
                top: 50%;
                padding: 0;
                font-size: 12px;
                font-weight: 400;
                transform: translateY(-50%);
            }
        }
    }
</style>