<script lang="ts">
    import Paragraph from "$components/grid/Paragraph.svelte";
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import BottomMenu from "$components/ui/bottom-menu/BottomMenu.svelte";
    import BottomMenuItem from "$components/ui/bottom-menu/BottomMenuItem.svelte";
    import type { MandateProjectionData, Party } from "$lib/types";
    import { partyData } from "$stores/dataStore";
    import RecentPollCard from "../poll/RecentPollCard.svelte";
    import RecentMandateProjectionCard from "./RecentMandateProjectionCard.svelte";

    export let mandateProjectionData = [] as MandateProjectionData;
    export let selectedGroup = "big_parties" as "big_parties" | "small_parties";
    export let nItems = 5;

    let selectedPartiesMap = {
        big_parties: ["fidesz", "tisza"],
        small_parties: ["dk", "mihazank", "mkkp"],
    } as Record<"big_parties" | "small_parties", Party[]>;

    $: selectedParties = selectedPartiesMap[selectedGroup];
</script>

<SectionCard id="recent-polls">
    <SectionTitle variant="tiny" centered>A legfrissebb becslések</SectionTitle>
    <div class="legend-container">
        <div class="color-legend">
            {#each selectedParties as party}
                <div class="color-legend-item">
                    <div
                        class="dot"
                        style="border-color: {partyData[party]
                            .color};background-color: {partyData[party]
                            .color}11;"
                    ></div>
                    <span style="color: {partyData[party].color};"
                        >{partyData[party].name}</span
                    >
                </div>
            {/each}
        </div>
    </div>
    <section class="pollsContainer">
        {#each mandateProjectionData.slice(0, nItems) as mandateProjection}
            <RecentMandateProjectionCard poll={mandateProjection} {selectedParties} />
        {/each}
    </section>
    <!-- <Paragraph>
        A <a href="//kozvelemeny.org" target="_blank"
            >blogunkon</a
        > megtalálható az összes 2018-óta végzett közvélemény-kutatás eredménye.
    </Paragraph> -->
    <BottomMenu noMargin>
        <BottomMenuItem link="/kutatasok">Az összes kutatás</BottomMenuItem>
    </BottomMenu>
</SectionCard>

<style lang="scss">
    .pollsContainer {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 6px;
        margin-bottom: 12px;
        border-top: 2px solid #f5f5f5;
        border-bottom: 2px solid #f5f5f5;
        padding: 1rem 0;
    }

    .legend-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        border-top: 2px solid #f5f5f5;
        padding-top: 12px;
    }

    .color-legend {
        display: flex;
        flex-direction: row;
        margin: 0 auto;
        gap: 12px;

        .color-legend-item {
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
