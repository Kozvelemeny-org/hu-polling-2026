<script lang="ts">
    import { onMount } from "svelte";
    import {
        fetchData,
        mandateProjectionData,
        partyData,
        pollData,
        simulationData,
    } from "$stores/dataStore";
    import type { MandateProjectionData, Party, PollData, PollsterGroup, Simulation } from "$lib/types";
    import MandateProjectionAside from "../../components/mandate/MandateProjectionAside.svelte";
    import SectionCard from "../../components/section/SectionCard.svelte";
    import SectionTitle from "../../components/section/SectionTitle.svelte";
    import StickyAside from "../../components/grid/StickyAside.svelte";
    import GridItem from "../../components/grid/GridItem.svelte";
    import OevkSectionCard from "$components/mandateProjection/OEVKSectionCard.svelte";
    import GridSectionTitle from "$components/grid/GridSectionTitle.svelte";
    import Paragraph from "$components/grid/Paragraph.svelte";
    import { calculateEntryProbability } from "$lib";
    import PollsViolin from "$components/mandate/violin/PollsViolin.svelte";
    import MandateHistogram from "$components/mandate/histogram/MandateHistogram.svelte";
    import SimulationNameSpan from "$components/mandate/SimulationNameSpan.svelte";
    import PollsChartFromData from "$components/poll/PollsChartFromData.svelte";
    import InlineChartLabel from "$components/ui/InlineChartLabel.svelte";
    import BottomMenu from "$components/ui/bottom-menu/BottomMenu.svelte";
    import BottomMenuItem from "$components/ui/bottom-menu/BottomMenuItem.svelte";
    import EntryProbabilityAside from "$components/mandate/entryProbability/EntryProbabilityAside.svelte";
    import ChartCard from "$components/ui/ChartCard.svelte";
    import SmallPartyLabel from "$components/mandate/histogram/SmallPartyLabel.svelte";

    let data = {
        sure_voters: [] as PollData,
        all_voters: [] as PollData,
        mandateProjectionData: [] as MandateProjectionData,
        simulationData: {} as Record<string, Simulation>,
    };
    let selectedSimulation: string = "main";
    let orderedParties = [] as Party[];

    function selectSimulation(simulation: string) {
        selectedSimulation = simulation;
    }

    function getSelectedSimulationPollsterGroup(simulation: string): PollsterGroup | undefined {
        switch (simulation) {
            case "main":
                return "összes";
            case "kormanyfuggetlen":
                return "kormányfüggetlen";
            case "kormanykozeli":
                return "kormányközeli";
            default:
                return undefined;
        }
    }

    onMount(fetchData);

    $: data = {
        sure_voters: $pollData.sure_voters,
        all_voters: $pollData.all_voters,
        mandateProjectionData: $mandateProjectionData,
        simulationData: $simulationData,
    };
    $: orderedParties = (() => {
        if (!data.simulationData[selectedSimulation]) return [] as Party[];
        const orderedParties = ['fidesz', 'tisza', 'dk', 'mihazank', 'mkkp'] as Party[];
        return orderedParties.sort((a, b) => {
            return calculateEntryProbability(data.simulationData[selectedSimulation], b) -
            calculateEntryProbability(data.simulationData[selectedSimulation], a);
        });
    })();

    $: selectedSimulationPollsterGroup = getSelectedSimulationPollsterGroup(selectedSimulation);
</script>

<StickyAside let:sticky>
    <MandateProjectionAside
        data={data.simulationData}
        {sticky}
        on:selectSimulation={(e) => selectSimulation(e.detail)}
    />
</StickyAside>
<GridItem variant="main">
    <SectionCard>
        <SectionTitle variant="featured">Mandátumbecslések alakulása</SectionTitle>
        <Paragraph --margin="2px">
            a <SimulationNameSpan>{data.simulationData[selectedSimulation]?.metadata.name}</SimulationNameSpan>
            szimuláció alapján, 60 napos súlyozott mozgóátlag. 
        </Paragraph>
        <PollsChartFromData {data} pollsterGroup={selectedSimulationPollsterGroup} chart_id="mandate-projection-chart" />
        <Paragraph noMargin>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor voluptates, perspiciatis cum aliquam alias sapiente, rem hic deleniti laborum veniam rerum maiores doloremque repellendus asperiores iste non, accusamus veritatis tempore!
        </Paragraph>
        <BottomMenu>
            <BottomMenuItem link={`/abra/g-mandate-projection-chart`}>Megosztás</BottomMenuItem>
            <BottomMenuItem link={`/abra/g-mandate-projection-chart`}>Beágyazás</BottomMenuItem>
        </BottomMenu>
    </SectionCard>
</GridItem>

<!-- <GridItem variant="main">
    <FideszTiszaBeeswarmCard simulationData={data.simulationData} {selectedSimulation} />
</GridItem> -->

<!-- <GridItem variant="aside">
    <SectionCard>
        <SectionTitle variant="small" centered>Támogatottság</SectionTitle>
        {#each orderedParties.slice(0, 2) as party}
            <InlineChartLabel description>{partyData[party].name}</InlineChartLabel>
            <PollsViolin
                party={party}
                pollData={data.sure_voters}
                pollsterGroup={selectedSimulationPollsterGroup ?? 'összes'}
                numDots={100}
                height={100}
                xDomain={[0.2, 0.6]}
            />
        {/each}
        <Paragraph>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nesciunt voluptate expedita similique, eaque magni mollitia dicta aperiam pariatur et accusamus iste quidem eius delectus vitae modi fuga error voluptas nisi. Lorem ipsum dolor sit amet consectetur.
        </Paragraph>
    </SectionCard>
</GridItem> -->

<!-- <GridItem variant="main">
    <SectionCard>
        <SectionTitle>Mandátumbecslés</SectionTitle>
        <Paragraph>
            A mandátumbecsléseink két adatforrásra építenek: 2024-es EP-választás választási földrajzára és a legfrissebb közvélemény-kutatásokra.
        </Paragraph>
        <div class="steps">
            <div class="step">1.</div>
            <article>
                <Paragraph>
                    Kiszámoljuk az elmúlt 30 napban végzett közvélemény-kutatások súlyozott átlagát és valós hibahatárát, majd ez alapján megbecsüljük a pártok támogatottságát.
                </Paragraph>
                <ChartCard>
                    <InlineChartLabel>A Fidesz becsült támogattsága</InlineChartLabel>
                    {#if data.simulationData[selectedSimulation]}
                        <PollsViolin
                            party={"fidesz"}
                            pollData={data.sure_voters}
                            pollsterGroup={selectedSimulationPollsterGroup ?? 'összes'}
                            numDots={20}
                            height={100}
                            xDomain={[0, 1]}
                        />
                    {/if}
                    <InlineChartLabel description>
                        A becsült támogatottság egy valószínűségi-eloszlás, az átlagát a
                        fekete vonal jelzi. A becslést {articleMap[selectedSimulationPollsterGroup ?? 'összes']}
                        {selectedSimulationPollsterGroup ?? 'összes'}
                        közvélemény-kutató{selectedSimulationPollsterGroup == "összes" ? "" : "k"}
                        adatai súlyozott átlaga alapján számoljuk.
                    </InlineChartLabel>
                </ChartCard>
            </article>
            <div class="step">2.</div> 
            <Paragraph>
                Megbecsüljük a pártok támogatottságát az egyéni választókerületekben,
                a 2019-es választás eredményébő és az országos támogatottságból kiindulva.
            </Paragraph>
            <div class="step">3.</div>
            <Paragraph>
                 A becsült támogatottság megoszlása alapján lefuttatunk
                10.000 szimulációt, amelyek különböző lehetséges támogatottsági értékeket
                vesznek figyelembe.
            </Paragraph>
        </div>
        <Paragraph>
            A mandátumbecslés részletes módszertanát a 
            <a href="#">blogunkon</a>
            találod meg.
        </Paragraph>
    </SectionCard>    
</GridItem> -->

<!-- <GridItem variant="main">
    <SectionCard id="parliament-chart">
        <SectionTitle>A legvalószínűbb parlament</SectionTitle>
        <p>
            Az alábbi ábrán a <SimulationNameSpan
                >{data.simulationData[selectedSimulation]?.metadata.name}</SimulationNameSpan
            >
            országos átlaga és az EP-választás választási földrajza alapján szimulált
            országgyűlési választás eredménye látható.
        </p>
        <ParliamentChart {data} {selectedSimulation} />
        <PartyMandateTable data={data.simulationData[selectedSimulation]?.seats} />
    </SectionCard>    
</GridItem> -->

<GridItem variant="full">
    <GridSectionTitle>Egyéni választókerületek</GridSectionTitle>
</GridItem>

<GridItem variant="left-main">
    <OevkSectionCard
        data={data.simulationData[selectedSimulation]?.oevkDiffs}
        simulationName={data.simulationData[selectedSimulation]?.metadata.name}
        simulationKey={selectedSimulation}
    />
</GridItem>
<GridItem variant="right-aside">
    <SectionCard>
        <SectionTitle variant="small">Az egyéni körzetek döntik el a választást</SectionTitle>
        <Paragraph noMargin>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos facilis omnis, repellendus, est quia doloremque rem consequuntur perferendis blanditiis pariatur iusto deleniti quibusdam vel libero voluptatum. Dicta eos eveniet maxime!</Paragraph>
        <Paragraph>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos facilis omnis, repellendus, est quia doloremque rem consequuntur perferendis blanditiis pariatur iusto deleniti quibusdam vel libero voluptatum. Dicta eos eveniet maxime!</Paragraph>
    </SectionCard>
</GridItem>

<GridItem variant="full">
    <GridSectionTitle>A kis pártok esélyei</GridSectionTitle>
</GridItem>

<GridItem variant="aside">
    <EntryProbabilityAside selectedSimulationData={data.simulationData[selectedSimulation]} parties={orderedParties.slice(2, 5)} />
</GridItem>
<GridItem variant="main">
    <SectionCard>
        <SectionTitle variant="medium">Érdemes nem a Fideszre vagy a Tiszára szavazni?</SectionTitle>
        <Paragraph>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quaerat cupiditate fuga vero eius optio voluptatum neque magnam, illum odio molestias voluptate vitae hic nihil perspiciatis, id eveniet accusantium expedita cumque?
        </Paragraph>
        <SectionTitle variant="tiny" hasTopMargin>A pártok feltételezett támogatottsága</SectionTitle>
        {#if data.simulationData[selectedSimulation]}
            <ChartCard>
                <InlineChartLabel>
                    A pártok feltételezett támogatottsága (%)
                </InlineChartLabel>
                <div class="split">
                    {#each orderedParties.slice(2, 5) as party}
                        <article>
                            {#if selectedSimulationPollsterGroup}
                                <PollsViolin
                                    party={party}
                                    pollData={data.sure_voters}
                                    pollsterGroup={selectedSimulationPollsterGroup}
                                    numDots={100}
                                    height={100}
                                    xDomain={[0, .1]}
                                    bandwidth={0.4}
                                />
                                <SmallPartyLabel party={partyData[party]} />
                            {/if}
                        </article>
                    {/each}
                </div>
            </ChartCard>
            <Paragraph noMargin>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam dolores vel esse. Temporibus sequi aliquid laudantium officia dolorum voluptate illo laboriosam sed facilis molestiae, adipisci minima aut quia provident architecto.
            </Paragraph>
            <SectionTitle variant="tiny" hasTopMargin>A pártok becsült mandátumszáma</SectionTitle>
            <ChartCard>
                <InlineChartLabel>
                    A pártok becsült mandátumszáma
                </InlineChartLabel>
                <div class="split">
                    {#each orderedParties.slice(2, 5) as party}
                        <article>
                            <div class="mandateHistogramContainer">
                                <MandateHistogram
                                    simulationData={data.simulationData}
                                    simulationKey={selectedSimulation}
                                    {party}
                                    range={[0, 10]}
                                    height={100}
                                    xTicks={[0, 5, 6, 7, 8, 9, 10]}
                                />
                                <SmallPartyLabel party={partyData[party]} />
                            </div>
                        </article>
                    {/each}
                </div>
            </ChartCard>
        {/if}
        <Paragraph noMargin>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quaerat cupiditate fuga vero eius optio voluptatum neque magnam, illum odio molestias voluptate vitae hic nihil perspiciatis, id eveniet accusantium expedita cumque?
        </Paragraph>
    </SectionCard>
</GridItem>
<!-- <GridItem variant="left-main">
    <SectionCard>
        <SectionTitle variant="medium">Bejutási esélyek alakulása</SectionTitle>
        <PollsChartFromData {data} chart_id="kis-partok" />
    </SectionCard>
</GridItem>
<RecentPollsAside pollData={data.sure_voters} selectedGroup="small_parties" nItems={6} /> -->

<!-- <GridItem variant="main">
    <PartyProjectionsSection data={data.simulationData} {selectedSimulation} />
</GridItem> -->

<!-- <GridItem variant="main">
    <SectionCard id="parliament-chart">
        <SectionTitle>A legvalószínűbb parlament</SectionTitle>
        <p>
            Az alábbi ábrán a <SimulationNameSpan
                >{data.simulationData[selectedSimulation]?.metadata.name}</SimulationNameSpan
            >
            országos átlaga és az EP-választás választási földrajza alapján szimulált
            országgyűlési választás eredménye látható.
        </p>
        <ParliamentChart {data} {selectedSimulation} />
        <PartyMandateTable data={data.simulationData[selectedSimulation]?.seats} />
    </SectionCard>    
</GridItem> -->

<style lang="scss">
    .split {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
    }
</style>