import { filterByPollsterGroup } from '$lib/chart/core/PollDataFilter';
import type { PollData, Party, PollsterGroup, BeeswarmData, BeeswarmPoint } from '$lib/types';

/**
 * Calculate possible "real support" probabilities based on polling data.
 * Generates a realistic distribution around the average polling result.
 */
export function calculateRealSupportProbabilities(params: {
    pollData: PollData;
    pollsterGroup: PollsterGroup;
    party: Party;
    numDots: number;
}): BeeswarmData {
    const { pollData, pollsterGroup, party, numDots } = params;
    
    const filteredPollData = filterByPollsterGroup(pollData, pollsterGroup);

    const windowDays = pollsterGroup === 'összes' ? 60 : 90;
    
    // Calculate date windowDays days ago
    const windowDaysAgo = new Date();
    windowDaysAgo.setDate(windowDaysAgo.getDate() - windowDays);

    // Filter polls that have valid numeric data for this party AND are from the last windowDays days
    const relevantPolls = filteredPollData.filter(poll => {
        // Check if poll is within last windowDays days
        const pollDate = new Date(poll.date);
        if (pollDate < windowDaysAgo) {
            return false;
        }
        
        // Check if poll has valid numeric data for this party
        const value = poll[party];
        if (value === undefined || value === null) {
            return false;
        }
        if (typeof value === 'string' && value === '') {
            return false;
        }
        const numValue = Number(value);
        return !isNaN(numValue) && isFinite(numValue);
    });
    
    if (relevantPolls.length === 0) {
        console.warn('No valid polls found for party:', party);
        return {party, points: [], median: 0, histogram: []};
    }
    
    // Calculate average support using only valid numeric values
    const averageSupport = relevantPolls.reduce((sum, poll) => sum + Number(poll[party]), 0) / relevantPolls.length;
    
    // Calculate standard deviation for realistic spread
    const variance = relevantPolls.reduce((sum, poll) => {
        const diff = Number(poll[party]) - averageSupport;
        return sum + diff * diff;
    }, 0) / relevantPolls.length;
    const standardDeviation = Math.sqrt(variance) * 2;
        
    // Ensure we have valid values
    if (isNaN(averageSupport) || isNaN(standardDeviation) || !isFinite(averageSupport) || !isFinite(standardDeviation)) {
        console.warn('Invalid polling data for party:', party, 'averageSupport:', averageSupport, 'standardDeviation:', standardDeviation);
        return {party, points: [], median: 0, histogram: []};
    }
    
    // Generate realistic distribution using normal distribution approximation
    const points: BeeswarmPoint[] = [];
    
    // Use a simpler approach to avoid NaN issues
    for (let i = 0; i < numDots; i++) {
        // Simple normal distribution approximation using central limit theorem
        let sum = 0;
        for (let j = 0; j < 12; j++) {
            sum += Math.random();
        }
        const z0 = (sum - 6) / 2; // Normalize to roughly N(0,1)
        
        // Scale and shift to match our distribution
        let support = averageSupport + z0 * standardDeviation;
        
        // Clamp to realistic bounds (0-1) - data is already in decimal format
        support = Math.max(0, Math.min(1, support));
        
        // Round to 3 decimal places for cleaner display
        support = Math.round(support * 1000) / 1000;
        
        // Final validation - this should never be needed with the simpler approach
        if (isNaN(support) || !isFinite(support) || support < 0 || support > 1) {
            console.error('Final support value is invalid:', support, 'party:', party);
            support = averageSupport; // Fallback to average (already in 0-1 range)
        }
        
        points.push({
            name: party,
            category: 'poll',
            value: support
        });
    }

    return {party, points, median: averageSupport, histogram: []};
}
