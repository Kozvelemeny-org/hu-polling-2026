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

    export let selectedSimulation: string;
    export let simulationData: Record<string, Simulation>;
    export let parties = ['fidesz', 'tisza'] as Party[];

</script>

<SectionCard>
    <SectionTitle variant="featured">Mi a legvalószínűbb kimenetel?</SectionTitle>
    <Paragraph>
        Az alábbi ábrán az látható, hogy a <SimulationNameSpan>{simulationData[selectedSimulation]?.metadata.name}</SimulationNameSpan> kutatásainak valós hibahatárát figyelembe véve milyen különböző mandátummegoszlásokat tekintünk lehetségesnek.
    </Paragraph>
    {#if simulationData[selectedSimulation]}
        <ChartCard>
            <InlineChartLabel>A pöttyök 1000 szimulált választás eredményeit mutatják, a százalékok pedig azt, hogy egy párt milyen eséllyel kap többséget vagy kétharmadot.</InlineChartLabel>
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
                A 10.000 szimuláció megoszlását 1000 ponttal ábrázoljuk, a mediánt fekete vonal jelzi. A százalékok mutatják, hogy mekkora eséllyel ér el egy párt egy adott mandátumszámot.
            </InlineChartLabel>
        </ChartCard>
    {/if}
    <Paragraph>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nesciunt voluptate expedita similique, eaque magni mollitia dicta aperiam pariatur et accusamus iste quidem eius delectus vitae modi fuga error voluptas nisi. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Rem sunt, eos, eveniet necessitatibus aut doloremque perspiciatis totam adipisci repellat explicabo iusto, consequuntur ullam pariatur officiis nihil minima id natus enim!
    </Paragraph>
    <BottomMenu>
        <BottomMenuItem link={`/abra/b-${selectedSimulation}`}>Megosztás</BottomMenuItem>
        <BottomMenuItem link={`/abra/b-${selectedSimulation}`}>Beágyazás</BottomMenuItem>
    </BottomMenu>
</SectionCard>