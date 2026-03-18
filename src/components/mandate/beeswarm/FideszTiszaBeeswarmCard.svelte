<script lang="ts">
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import SimulationNameSpan from "$components/mandate/SimulationNameSpan.svelte";
    import MandateBeeswarm from "$components/mandate/beeswarm/MandateBeeswarm.svelte";
    import Paragraph from "$components/grid/Paragraph.svelte";
    import ChartCard from "$components/ui/ChartCard.svelte";
    import InlineChartLabel from "$components/ui/InlineChartLabel.svelte";
    import type { Party, Simulation } from "$lib/types";
    import BottomMenu from "$components/ui/bottom-menu/BottomMenu.svelte";
    import BottomMenuItem from "$components/ui/bottom-menu/BottomMenuItem.svelte";
    import { EXPLAINER_ARTICLE_LINK } from "$lib/charts";

    export let selectedSimulation: string;
    export let simulationData: Record<string, Simulation>;
    export let parties = ['fidesz', 'tisza'] as Party[];
    export let hideBottomMenu = false;

</script>

<SectionCard>
    <SectionTitle variant="featured">Mi a legvalószínűbb kimenetel?</SectionTitle>
    <Paragraph>
        Az alábbi ábrán az látható, hogy a <SimulationNameSpan>{simulationData[selectedSimulation]?.metadata.name}</SimulationNameSpan> kutatásainak valós hibahatárát figyelembe véve milyen mandátummegoszlások lehetségesek.
    </Paragraph>
    {#if simulationData[selectedSimulation]}
        <ChartCard>
            <InlineChartLabel>Tízezer választási eredményt szimuláltunk. A pöttyök az adott pártnak a szimulált választásokon elért eredményeit mandátumszámban mutatják. Az ábra felett százalékban mutatjuk három fejlemény valószínűségét, tehát hogy milyen gyakran állt elő a szimulációk során az, hogy a párt bejut a parlamentbe, hogy ott abszolút többséget (tehát legalább 100 mandátumot) szerez, és hogy kétharmados többséget (legalább 133 mandátumot) szerez.</InlineChartLabel>
            {#each parties as party}
                <MandateBeeswarm
                    party={party}
                    simulation={simulationData[selectedSimulation]}
                    simulationKey={selectedSimulation}
                    numDots={500}
                    height={200}
                    r={2.5}
                />
            {/each}
            <InlineChartLabel description>
                A szimulációk megoszlását 500 ponttal ábrázoljuk, az átlagos eredményt fekete vonal jelzi. A százalékok mutatják, hogy mekkora eséllyel ér el egy párt egy adott mandátumszámot.
            </InlineChartLabel>
        </ChartCard>
        <Paragraph>
            További részletek a pillanatnyilag várható szavazatarányok kiszámításáról és a mandátumbecslésünk módszertanáról ebben az <a href="{EXPLAINER_ARTICLE_LINK}" target="_blank">összefoglaló blogposztban</a> érhetőek el.
        </Paragraph>
    {/if}
    
    {#if !hideBottomMenu}
        <BottomMenu>
            <BottomMenuItem link={`/abra/b-${selectedSimulation}`}>Megosztás</BottomMenuItem>
            <BottomMenuItem link={`/abra/b-${selectedSimulation}`}>Beágyazás</BottomMenuItem>
        </BottomMenu>
    {/if}
</SectionCard>