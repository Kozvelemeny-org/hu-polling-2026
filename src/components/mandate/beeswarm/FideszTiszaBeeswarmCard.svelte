<script lang="ts">
    import SectionCard from "$components/section/SectionCard.svelte";
    import SectionTitle from "$components/section/SectionTitle.svelte";
    import SimulationNameSpan from "$components/mandate/SimulationNameSpan.svelte";
    import MandateBeeswarm from "$components/mandate/beeswarm/MandateBeeswarm.svelte";
    import Paragraph from "$components/grid/Paragraph.svelte";
    import ChartCard from "$components/ui/ChartCard.svelte";
    import InlineChartLabel from "$components/ui/InlineChartLabel.svelte";
    import type { Party, Simulation } from "$lib/types";

    export let selectedSimulation: string;
    export let simulationData: Record<string, Simulation>;
    export let parties = ['fidesz', 'tisza'] as Party[];

</script>

<SectionCard>
    <SectionTitle variant="featured">Ki nyerne, ha ma lenne a választás?</SectionTitle>
    <Paragraph>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nesciunt voluptate expedita similique, eaque magni mollitia dicta aperiam pariatur et accusamus iste quidem eius delectus vitae modi fuga error voluptas nisi.
    </Paragraph>
    {#if simulationData[selectedSimulation]}
        <ChartCard>
            <InlineChartLabel>A pöttyök a <SimulationNameSpan>{simulationData[selectedSimulation]?.metadata.name}</SimulationNameSpan> alapján szimulált 10.000 választás eredményeit mutatják.</InlineChartLabel>
            {#each parties as party}
                <MandateBeeswarm
                    party={party}
                    simulation={simulationData[selectedSimulation]}
                    simulationKey={selectedSimulation}
                    numDots={1000}
                    height={190}
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
</SectionCard>