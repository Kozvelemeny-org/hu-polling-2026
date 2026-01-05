import type { Party, Simulation } from '$lib/types';
import { calculateEntryProbability, calculateMajorityProbability, calculateAbsoluteMajorityProbability } from '$lib/shared/sampling';

export type CategoryData = {
    name: string;
    count: number;
    color: string;
    shape?: 'circle' | 'cross';
};

export function getPartyEntryProbability(simulation: Simulation, party: Party): number {
    return calculateEntryProbability(simulation, party);
}

export function getPartyMajorityProbability(simulation: Simulation, party: Party): number {
    return calculateMajorityProbability(simulation, party);
}

export function getPartyAbsoluteMajorityProbability(simulation: Simulation, party: Party): number {
    return calculateAbsoluteMajorityProbability(simulation, party);
}

export function getAllPartyProbabilities(simulation: Simulation, probabilityFunction: (simulation: Simulation, party: Party) => number): Record<Party, number> {
    const parties: Party[] = ['fidesz', 'tisza', 'dk', 'dk_mszp_p', 'mihazank', 'mkkp', 'momentum', 'minority'];
    const probabilities: Record<Party, number> = {} as Record<Party, number>;
    
    for (const party of parties) {
        probabilities[party] = probabilityFunction(simulation, party);
    }
    
    return probabilities;
}