<script lang="ts">
    import MandateViolin from './MandateViolin.svelte';
    import PollsViolin from './PollsViolin.svelte';
    import { pollData, simulationData } from '$stores/dataStore';
    import type { Party } from '$lib/types';

    let selectedParty: Party = 'fidesz';
    let selectedSimulation = 'latest';
    let numDots = 100;
    let bandwidth = 0.3;
    let height = 260;
</script>

<div class="violin-demo">
    <h2>Violin Plot Demo</h2>
    
    <div class="controls">
        <label>
            Party:
            <select bind:value={selectedParty}>
                <option value="fidesz">Fidesz</option>
                <option value="tisza">Tisza</option>
                <option value="dk">DK</option>
                <option value="dk_mszp_p">DK-MSZP-P</option>
                <option value="mihazank">Mi Hazánk</option>
                <option value="mkkp">MKKP</option>
                <option value="momentum">Momentum</option>
            </select>
        </label>
        
        <label>
            Simulation:
            <select bind:value={selectedSimulation}>
                {#each Object.keys($simulationData) as simKey}
                    <option value={simKey}>{$simulationData[simKey].metadata.name}</option>
                {/each}
            </select>
        </label>
        
        <label>
            Number of dots: {numDots}
            <input type="range" bind:value={numDots} min="50" max="200" step="10" />
        </label>
        
        <label>
            Bandwidth: {bandwidth}
            <input type="range" bind:value={bandwidth} min="0.1" max="0.8" step="0.05" />
        </label>
        
        <label>
            Height: {height}px
            <input type="range" bind:value={height} min="200" max="400" step="20" />
        </label>
    </div>
    
    <div class="charts">
        <div class="chart-section">
            <h3>Mandate Violin Plot</h3>
            <MandateViolin
                party={selectedParty}
                simulation={$simulationData[selectedSimulation]}
                simulationKey={selectedSimulation}
                {numDots}
                {height}
                {bandwidth}
                hideZeros={true}
                xDomain={[0, 15]}
            />
        </div>
        
        <div class="chart-section">
            <h3>Polls Violin Plot</h3>
            <PollsViolin
                party={selectedParty}
                pollData={$pollData.all_voters}
                {numDots}
                {height}
                {bandwidth}
                xDomain={[0, 1]}
            />
        </div>
    </div>
</div>

<style>
    .violin-demo {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .controls {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 8px;
    }
    
    .controls label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .controls select,
    .controls input {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    
    .charts {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }
    
    .chart-section {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
    }
    
    .chart-section h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        text-align: center;
    }
    
    @media (max-width: 768px) {
        .charts {
            grid-template-columns: 1fr;
        }
    }
</style>
