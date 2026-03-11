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
    return {party, points, average: simulation.averages[party], histogram: simulation[party] ?? []};
}

/**
 * Build BeeswarmData from simulation.polls[party] (1k support values in [0, 1]).
 * Returns null when polls data is missing or empty so caller can fall back to mandate path.
 */
export function buildBeeswarmDataFromPolls(simulation: Simulation, party: Party): BeeswarmData | null {
    const values = simulation.polls?.[party];
    if (!values?.length) return null;

    const points: BeeswarmPoint[] = values.map((value) => ({
        name: party,
        category: 'poll',
        value,
    }));

    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;

    return {
        party,
        points,
        average,
        histogram: [],
    };
}

/**
 * Utility to get X key used in the LayerCake example-compatible shape
 */
export const xKey = 'value';
export const zKey = 'category';
export const titleKey = 'name';


