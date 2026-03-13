<script lang="ts">
    import { onMount } from "svelte";
    import {
        fetchData,
        mandateProjectionData,
        partyData,
        pollData,
        simulationData,
        historicalSimulationData,
    } from "$stores/dataStore";
    import type { HistoricalSimulationData, MandateProjectionData, Party, PollData, PollsterGroup, Simulation } from "$lib/types";
    import SimulationSelectorBlock from "../../components/mandate/SimulationSelectorBlock.svelte";
    import SectionCard from "../../components/section/SectionCard.svelte";
    import SectionTitle from "../../components/section/SectionTitle.svelte";
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
    import { EXPLAINER_ARTICLE_LINK } from "$lib/charts";

    let data = {
        sure_voters: [] as PollData,
        all_voters: [] as PollData,
        mandateProjectionData: [] as MandateProjectionData,
        simulationData: {} as Record<string, Simulation>,
        historicalSimulationData: {} as HistoricalSimulationData,
    };
    let selectedSimulation: string = "main";
    let orderedParties = [] as Party[];

    function getSelectedSimulationPollsterGroup(simulation: string): PollsterGroup | undefined {
        switch (simulation) {
            case "main":
                return "kormányfüggetlen";
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
        historicalSimulationData: $historicalSimulationData,
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

<SimulationSelectorBlock
    data={data.simulationData}
    bind:selectedSimulation
/>
<GridItem variant="main">
    <SectionCard>
        <SectionTitle variant="featured">Mandátumbecslések alakulása</SectionTitle>
        <Paragraph --margin="2px">
            a <SimulationNameSpan>{data.simulationData[selectedSimulation]?.metadata.name}</SimulationNameSpan>
            szimuláció alapján, 60 napos súlyozott mozgóátlag. 
        </Paragraph>
        <PollsChartFromData {data} pollsterGroup={selectedSimulationPollsterGroup} scenarioKey={selectedSimulation} chart_id="mandate-projection-chart" />
        <Paragraph noMargin>
            Ez az ábra az áttekintés oldalon látható szavazatarány-becsléseket fordítja át
            mandátumbecslésekké az <a href="${EXPLAINER_ARTICLE_LINK}" target="_blank">itt</a>
            részletesen leírt adatok és feltevések felhasználásával. További részletek a
            mandátumszámításaink eredményeiről (egyéni és listás mandátumok száma pártonként,
            győzteskompenzáció hatása, különböző parlamenti többségek valószínűsége, illetve
            minden szám statisztikai hibahatára) érhetők el
            <a href="${EXPLAINER_ARTICLE_LINK}" target="_blank">itt</a>,
            valamint a fenti menüben a “Részletes becslés” pontra ráklikkelve.
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
        <!-- <Paragraph noMargin>
            A jelenlegi magyar választási rendszerben az egyéni kerületi szavazatoknak sokkal
            nagyobb hatása van a mandátumok megoszlására, és ezáltal arra, hogy ki kormányozhat,
            mint a listás szavazatoknak.
        </Paragraph> -->
        <Paragraph noMargin>
            A jelenlegi magyar választási rendszerben az egyéni kerületi szavazatoknak sokkal
            nagyobb hatása van a mandátumok megoszlására, és ezáltal arra, hogy ki kormányozhat,
            mint a listás szavazatoknak. Akik csak az utóbbival rendelkeznek - tehát a levélben
            szavazó kisebbségi magyarok, akik nem rendelkeznek magyarországi lakcímmel -,
            azoknak a szava minimális mértékben változtatja meg a parlament összetételét, míg az
            egyéni kerületi szavazattal is rendelkező összes többi szavazók közül akár pár tucat
            vagy pár száz is átbillenthet majd egy-egy egyéni kerületet fideszesről tiszapártivá,
            vagy fordítva. A választókerületek határai azonban úgy vannak meghatározva, hogy a
            Fidesz kevesebb szavazatttal is megszerezheti ezek többéségét, mint a TISZA. Ha a Mi
            Hazánk is bejut a parlamentbe, akkor a TISZA Pártnak kb. 4-5-6 százalékkal több egyéni
            kerületi szavazatot kell szereznie az ország egészében, mint a Fidesznek, hogy a
            kormányváltást pártoló többség alakulhasson ki a parlamentben.
        </Paragraph>
    </SectionCard>
</GridItem>

<GridItem variant="full">
    <GridSectionTitle>A kis pártok esélyei</GridSectionTitle>
</GridItem>

<GridItem variant="aside">
    {#key selectedSimulation}
        <EntryProbabilityAside selectedSimulation={selectedSimulation} historicalSimulationData={data.historicalSimulationData} parties={orderedParties.slice(2, 5)} />
    {/key}
</GridItem>
<GridItem variant="main">
    <SectionCard>
        <SectionTitle variant="medium">Érdemes nem a Fideszre vagy a Tiszára szavazni?</SectionTitle>
        <Paragraph>
            Ha Fidesz és a TISZA egymáshoz nagyjából hasonló számú mandátumot nyernének - tehát ha a TISZA
            Párt csak pár százalékponntal kap több szaazatot, mint a Fidesz -, akkor befolyásolhatja a
            parlamenti többség összetételét és a kormányalakulást az, hogy hány és melyik kisebb párt jut
            az országgyűlésbe. A baloldalon megjelenő “Bejutás esélye” oszlopban láthatók a Vox Populi
            számításai arról, hogy a közvélemény-kutatások alapján mi a százalékos esélye egyes kisebb
            pártok mandátum-szerzésének. A kisebb pártoknak kb. 5,25%-nyi listás szavazatot kell szereznie
            ahhoz (a levélszavazatok nélküli szavazatok között) ahhoz, hogy átlépjék a mandátumszerzéshez
            szükséges 5%-os küszöböt, mivel levélszavazatokra csak elhanyagolható mértékben számíthatnak.
            Ha viszont olyan állampolgárok is szavaznak az ő egyéni kerületi jelöltjeikre, akik a TISZA
            Pártra szavaznának máskülönben, akkor a kis pártokra adott egyéni kerületi szavazatok sokkal
            több mandátumtól foszthatják meg a TISZA-t, mint ahány plusz listás mandátummal támogathatná
            a kormányalakítását a kis párt akkor, ha esetleg szerez pár listás mandátumot. Ugyanez igaz
            egyébként a Fideszre is, hiszen a Mi Hazánk jelöltjeire adott egyéni kerületi szavazatok
            nagyban csökkenthetik a Fidesz kormányalakításai esélyeit.
        </Paragraph>
        <!-- <SectionTitle variant="tiny" hasTopMargin>A kisebb pártok pillanatnyilag várható szavazataránya</SectionTitle> -->
        {#if data.simulationData[selectedSimulation]}
            <ChartCard>
                <InlineChartLabel>
                    A kisebb pártok pillanatnyilag várható szavazataránya (%)
                </InlineChartLabel>
                <div class="split">
                    {#each orderedParties.slice(2, 5) as party}
                        <article>
                            <PollsViolin
                                party={party}
                                simulation={data.simulationData[selectedSimulation]}
                                height={100}
                                xDomain={[0, 0.15]}
                                bandwidth={1}
                            />
                            <SmallPartyLabel party={partyData[party]} />
                        </article>
                    {/each}
                </div>
            </ChartCard>
            <Paragraph noMargin>
                A három “hegedű-ábra” a kisebb pártok aktuálisan várható szavazatarányának a Vox Populi
                által számította 60 napos súlyozott mozgóátlagát mutatja számmal is. A színes hegedűk
                azoknál a százalékos értékeknél válnak vastagabbá, amelyek a legvalószínűbbek a
                közvélemény-kutatások alapján.
            </Paragraph>
            <!-- <SectionTitle variant="tiny" hasTopMargin>A kisebb pártok pártok becsült mandátumszáma</SectionTitle> -->
            <ChartCard>
                <InlineChartLabel>
                    A kisebb pártok pártok becsült mandátumszáma
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
            Ezek az ábrák azt mutatják, hogy hány listás mandátumra számíthatnak a kisebb pártok a
            számításaink szerint, amelyek azt feltételezik, hogy az ilyen méretű pártok egyéni kerületi
            jelöltje nagyjából kétharmadannyi szavazatot kapnak, mint maga a pártlista. Ha a
            kétharmadnál kisebb lesz az arány, akkor persze előfordulhat, hogy csak 4 mandátumot szerez
            egy mondjuk 5,5%-os támogatottságú párt. Minél valószínűbb, hogy 5% alatt marad egy párt
            listás eredménye, annál valószínűbb, hogy nulla mandátumot fog szerezni.
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