import type { Party, Poll, PollData, PollsterGroup } from "./types";

/** Vox Populi adjustment applies from this date (inclusive). Polls before this are unchanged. */
const VOXPOPULI_EFFECTIVE_DATE = new Date("2024-12-01");
VOXPOPULI_EFFECTIVE_DATE.setHours(0, 0, 0, 0);

/** Deltas in decimal share (e.g. 0.025 = 2.5pp). Fidesz +2.5pp, Tisza -2pp, DK -0.25pp, MKKP -0.25pp. */
const VOXPOPULI_DELTAS = {
    fidesz: 0.015,
    tisza: 0.01,
    mihazank: 0,
    dk: -0.0125,
    mkkp: -0.0125,
} as const;

export function needsVoxPopuliAdjustment(group: PollsterGroup): boolean {
    return group === "voxpopuli";
}

/**
 * Applies the Vox Populi adjustment to poll data: same polls as kormányfüggetlen, but
 * for polls on or after 2024-12-01: Fidesz +2.5pp, Tisza -2pp, DK -0.25pp, MKKP -0.25pp.
 * Values are clamped to [0, 1]. Polls before the effective date are returned unchanged.
 *
 * Only for support-share poll data (party values in 0–1). Must not be used for mandate
 * projection data (seat counts 0–199); the [0, 1] clamp would destroy mandate values.
 * If any party value is > 1.5, the data is treated as mandate-like and returned unchanged.
 */
export function applyVoxPopuliAdjustment(pollData: PollData): PollData {
    const partyKeys = Object.keys(VOXPOPULI_DELTAS) as Party[];
    const looksLikeMandateData = pollData.some((poll) =>
        partyKeys.some((key) => {
            const raw = poll[key];
            if (raw == null || (typeof raw === "string" && raw === "")) return false;
            const n = typeof raw === "number" ? raw : Number(raw);
            return !isNaN(n) && isFinite(n) && n > 1.5;
        })
    );
    if (looksLikeMandateData) return pollData;

    return pollData.map((poll) => {
        const pollDate = new Date(poll.date);
        pollDate.setHours(0, 0, 0, 0);
        if (pollDate < VOXPOPULI_EFFECTIVE_DATE) {
            return poll;
        }
        const copy = { ...poll } as Poll;
        for (const [party, delta] of Object.entries(VOXPOPULI_DELTAS)) {
            const key = party as Party;
            const raw = copy[key];
            const current = typeof raw === "number" ? raw : Number(raw);
            if (raw != null && (typeof raw !== "string" || raw !== "") && !isNaN(current) && isFinite(current)) {
                const next = Math.max(0, Math.min(1, current + delta));
                copy[key] = next;
            }
        }
        return copy;
    });
}
