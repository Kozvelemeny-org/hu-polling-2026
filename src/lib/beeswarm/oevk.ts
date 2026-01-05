import type { Party, Simulation } from '$lib/types';
import { sampleFromDistribution } from '$lib/shared/sampling';
import type { BeeswarmData, BeeswarmPoint } from '../types';

/**
 * Transform a party's seat probability distribution into a beeswarm-ready data array.
 * - Samples `numDots` points i.i.d. from the distribution (with replacement)
 * - Deterministic given party + simulationKey + numDots
 */
export function buildBeeswarmData(params: {
    simulation: Simulation;
    party: Party;
    simulationKey: string;
    numDots: number;
}): BeeswarmData {
    const { simulation, party, simulationKey, numDots } = params;
    
    // Use shared sampling function
    const samples = sampleFromDistribution(simulation, party, simulationKey, numDots);
    
    const points: BeeswarmPoint[] = [];
    for (const seats of samples) {
        if (seats === 0) {
            continue;
        }
        points.push({ name: party, category: 'mandate', value: seats });
    }
    return {party, points, median: simulation.medians[party], histogram: simulation[party] ?? []};
}

/**
 * Utility to get X key used in the LayerCake example-compatible shape
 */
export const xKey = 'value';
export const zKey = 'category';
export const titleKey = 'name';


