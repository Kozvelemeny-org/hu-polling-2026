import type { Party, Simulation } from '$lib/types';

// Simple seeded RNG (Mulberry32)
function mulberry32(seed: number) {
    let t = seed >>> 0;
    return function random() {
        t += 0x6D2B79F5;
        let x = Math.imul(t ^ (t >>> 15), 1 | t);
        x ^= x + Math.imul(x ^ (x >>> 7), 61 | t);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
}

function stringToSeed(str: string): number {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return h >>> 0;
}

// Build a cumulative distribution function array from a PMF
function buildCdf(probabilities: number[]): number[] {
    const cdf: number[] = new Array(probabilities.length);
    let sum = 0;
    for (let i = 0; i < probabilities.length; i++) {
        sum += probabilities[i] || 0;
        cdf[i] = sum;
    }
    // Normalize in case of rounding issues
    if (sum > 0) {
        for (let i = 0; i < cdf.length; i++) cdf[i] /= sum;
    }
    return cdf;
}

function sampleFromCdf(cdf: number[], rnd: () => number): number {
    const u = rnd();
    // Binary search
    let lo = 0;
    let hi = cdf.length - 1;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (u <= cdf[mid]) hi = mid; else lo = mid + 1;
    }
    return lo;
}

export function sampleFromDistribution(
    simulation: Simulation,
    party: Party,
    simulationKey: string,
    numSamples: number
): number[] {
    const distribution = simulation[party] as number[] | undefined;
    if (!distribution || distribution.length === 0) return [];

    const cdf = buildCdf(distribution);
    const seed = stringToSeed(`${party}|${simulationKey}|${numSamples}`);
    const rnd = mulberry32(seed);

    const samples: number[] = [];
    for (let i = 0; i < numSamples; i++) {
        const seats = sampleFromCdf(cdf, rnd);
        samples.push(seats);
    }
    return samples;
}

export function calculateEntryProbability(simulation: Simulation, party: Party): number {
    const distribution = simulation[party] as number[] | undefined;
    if (!distribution || distribution.length === 0) return 0;

    // Probability of getting 0 mandates is distribution[0]
    // Probability of getting >0 mandates is 1 - distribution[0]
    return Number((1 - (distribution[0] || 0)).toFixed(2));
}

export function calculateMajorityProbability(simulation: Simulation, party: Party): number {
    const distribution = simulation[party] as number[] | undefined;
    if (!distribution || distribution.length === 0) return 0;

    // Probability of getting more than 99 seats (majority in 199-seat parliament)
    let probability = 0;
    for (let i = 100; i < distribution.length; i++) {
        probability += distribution[i] || 0;
    }
    return probability;
}

export function calculateAbsoluteMajorityProbability(simulation: Simulation, party: Party): number {
    const distribution = simulation[party] as number[] | undefined;
    if (!distribution || distribution.length === 0) return 0;

    // Probability of getting more than 132 seats (2/3 majority in 199-seat parliament)
    let probability = 0;
    for (let i = 133; i < distribution.length; i++) {
        probability += distribution[i] || 0;
    }
    return probability;
}
