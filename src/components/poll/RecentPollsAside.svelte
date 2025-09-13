<script lang="ts">
    import Paragraph from "$components/grid/Paragraph.svelte";
    import SectionCard from "$components/section/SectionCard.svelte";
import SectionTitle from "$components/section/SectionTitle.svelte";
    import BottomMenu from "$components/ui/bottom-menu/BottomMenu.svelte";
    import BottomMenuItem from "$components/ui/bottom-menu/BottomMenuItem.svelte";
    import type { Party, PollData } from "$lib/types";
    import RecentPollCard from "./RecentPollCard.svelte";

    export let pollData = [] as PollData;
    export let selectedGroup = 'big_parties' as 'big_parties' | 'small_parties';
    export let nItems = 5;

    let selectedPartiesMap = {
        'big_parties': ['fidesz', 'tisza'],
        'small_parties': ['dk', 'mihazank', 'mkkp'],
    } as Record<'big_parties' | 'small_parties', Party[]>;

    $: selectedParties = selectedPartiesMap[selectedGroup];
</script>

<SectionCard id="recent-polls">
    <SectionTitle variant="tiny" centered>A legfrissebb adatok</SectionTitle>
    <section class="pollsContainer">
        {#each pollData.slice(0, nItems) as poll}
            <RecentPollCard {poll} {selectedParties} />
        {/each}
    </section>
    <!-- <Paragraph>
        A <a href="//kozvelemeny.org" target="_blank"
            >blogunkon</a
        > megtalálható az összes 2018-óta végzett közvélemény-kutatás eredménye.
    </Paragraph> -->
    <BottomMenu noMargin>
        <BottomMenuItem link="/polls">Az összes kutatás</BottomMenuItem>
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
button {
    width: fit-content;
}
</style>