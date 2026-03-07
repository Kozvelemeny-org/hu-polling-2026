<script lang="ts">
    import type { Party, Poll } from "$lib/types";
    import { pollsterData, partyData } from "$stores/dataStore";
    
    export let poll: Poll;
    export let selectedParties: Party[] = [];

    let pollData = {
        date: new Date(),
        dateDisplay: "",
        partyResults: [] as Array<{
            party: Party;
            value: number;
            displayValue: number;
            color: string;
            name: string;
        }>,
        leader: "",
    };

    $: {
        selectedParties.forEach(party => {
            poll[party] = poll[party] ?? 0;
        });

        // Create party results array sorted by value (highest first)
        const partyResults = selectedParties
            .map(party => ({
                party,
                value: poll[party] ?? 0,
                displayValue: Number(((poll[party] ?? 0) * 100).toFixed(0)),
                color: partyData[party].color,
                name: partyData[party].name,
            }))
            .sort((a, b) => b.value - a.value);

        pollData = {
            date: poll.date,
            dateDisplay: new Date(poll.date).toLocaleDateString("hu-HU", {
                month: "short",
                day: "numeric",
            }),
            partyResults,
            leader: partyResults[0]?.party ?? "",
        }
    }
</script>

<a href={poll.url} target="_blank"><article>
    <header>
        <div class="pollster">
            {pollsterData[poll.pollster]?.name ?? poll.pollster}
        </div>
        <div class="date">
            {pollData.dateDisplay} 
        </div>
    </header>
    {#if pollData.partyResults.length > 0}
    <section>
        {#each pollData.partyResults as result}
            <div
                class="valueBackground"
                style="width: {result.displayValue * (result.displayValue > 10 ? 1.5 : 1.5)}%;"
            >
                <div 
                    class="result {result.party}" 
                    class:small={result.displayValue < 10}
                    style="background-color: {result.color+'11'}; border: 1px solid {result.color+'22'};"
                >
                    <div class="value" class:inside={result.displayValue > 10} style="color: {result.displayValue < 10 ? result.color : result.color};">
                        {result.displayValue}<span>%</span>
                    </div>
                </div>
            </div>
        {/each}
    </section>
    {/if}
</article></a>

<style lang="scss">
    a {
        text-decoration: none;
        color: inherit;
    }
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
        
        .date, .pollster {
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
                font-size: 12px;
                font-weight: 400;
                padding: 0 4px;
                
                &:not(.inside) {
                    position: absolute;
                    left: -25px;
                    top: 50%;
                    transform: translateY(-50%);
                    padding: 0;
                }

                span {
                    margin-left: 0.3px;
                    color: inherit;
                }
            }
        }
    }

</style>