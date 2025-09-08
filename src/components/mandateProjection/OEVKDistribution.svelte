<script lang="ts">
    import type { Simulation } from "$lib/types";
    import { createEventDispatcher, onMount, tick } from "svelte";
    import { oevkNameMap, partyData } from "../../stores/dataStore";

    export let data = {} as Simulation["oevkDiffs"];
    export let highlightedOevk: string | null;

    let orderedData = [] as [keyof typeof oevkNameMap, number][];
    let container: HTMLElement;
    let sectionSize: number;
    let mounted = false;
    let segments: { startIndex: number; endIndex: number; color: string; count: number; centerLeft: number; labelTop: number }[] = [];

    function calculateSectionHeightPercent(diff: number) {
        return 15 + 100 * Math.abs(diff * 1.5);
    }

    const dispatch = createEventDispatcher();

    // Cursor variables
    let cursorLeft: number = 0;
    let labelLeftAdjustment: number = 0;
    let currentOevkLabel: string = "";
    let defaultIndex: string = "101" as keyof typeof oevkNameMap;

    function calculateSectionSize(d: Simulation["oevkDiffs"]) {
        if (!container) return;
        const width = container.clientWidth;
        const oevkCount = Object.keys(d).length;
        return width / oevkCount;
    }

    function calculateColor(diff: number) {
        if (diff < -0.15) return colors[0];
        if (diff < -0.05) return colors[1];
        if (diff < 0.05) return colors[2];
        if (diff < 0.15) return colors[3];
        return colors[4];
    }

    const colors = [
        partyData["fidesz"].color,
        "#ffb985",
        "#f1f1f1",
        "#908dc7",
        partyData["tisza"].color,
    ];

    onMount(() => {
        mounted = true;

        window.addEventListener("resize", () => {
            sectionSize = calculateSectionSize(data) || 0;
            updateCursorFromProp(highlightedOevk, sectionSize);
        });
    });

    $: if (mounted) {
        sectionSize = calculateSectionSize(data) || 0;
        const dataArr = Object.entries(data);
        orderedData = dataArr.sort((a, b) => a[1] - b[1]) as [keyof typeof oevkNameMap, number][];

        // Set default cursor position to middle section
        if (orderedData.length > 0 && sectionSize) {
            defaultIndex = Math.floor(orderedData.length / 2).toFixed();
            cursorLeft = Number(defaultIndex) * sectionSize + sectionSize / 2;
            currentOevkLabel = '';
        }
    }

    // Group contiguous sections of the same color and compute their centers, counts, and label vertical offsets
    $: if (orderedData && orderedData.length && sectionSize && container) {
        const newSegments: { startIndex: number; endIndex: number; color: string; count: number; centerLeft: number; labelTop: number }[] = [];
        let currentColor: string | null = null;
        let startIndex = 0;

        orderedData.forEach(([, diff], index) => {
            const color = calculateColor(diff);
            if (currentColor === null) {
                currentColor = color;
                startIndex = index;
            } else if (color !== currentColor) {
                const endIndex = index - 1;
                const count = endIndex - startIndex + 1;
                const centerLeft = ((startIndex + endIndex + 1) / 2) * sectionSize;
                const midIndex = Math.floor((startIndex + endIndex) / 2);
                const midDiff = orderedData[midIndex][1];
                const heightPercent = calculateSectionHeightPercent(midDiff);
                const containerHeight = container?.clientHeight || 0;
                const heightPx = (heightPercent / 100) * containerHeight;
                const labelTop = (containerHeight - heightPx) / 2 - 18; // position above the bar's top
                const textColor = currentColor === '#f1f1f1' ? '#aaa' : currentColor;
                newSegments.push({ startIndex, endIndex, color: textColor, count, centerLeft, labelTop });
                currentColor = color;
                startIndex = index;
            }
            // If last item, close the segment
            if (index === orderedData.length - 1 && currentColor !== null) {
                const endIndex = index;
                const count = endIndex - startIndex + 1;
                const centerLeft = ((startIndex + endIndex + 1) / 2) * sectionSize;
                const midIndex = Math.floor((startIndex + endIndex) / 2);
                const midDiff = orderedData[midIndex][1];
                const heightPercent = calculateSectionHeightPercent(midDiff);
                const containerHeight = container?.clientHeight || 0;
                const heightPx = (heightPercent / 100) * containerHeight;
                const labelTop = (containerHeight - heightPx) / 2 - 18;
                const textColor = currentColor === '#f1f1f1' ? '#aaa' : currentColor;
                newSegments.push({ startIndex, endIndex, color: textColor, count, centerLeft, labelTop });
            }
        });
        segments = newSegments;
    }

    async function updateCursor(index: number, section: [keyof typeof oevkNameMap, number], sectionSize: number) {
        cursorLeft = index * sectionSize + sectionSize / 2;
        let leadColor = '#666';
        if (section[1] < -0.05) {
            leadColor = partyData['fidesz'].color;
        } else if (section[1] > 0.05) {
            leadColor = partyData['tisza'].color;
        }
        const leadText = Math.abs(section[1] * 100).toFixed(1) + '%';

        currentOevkLabel = `${oevkNameMap[section[0]]}<br><span style="color: ${leadColor};">+${leadText}</span>`;
        dispatch("oevkHover", section[0]);
        
        await tick();

        // Correct text position if it goes out of bounds
        const containerWidth = container.clientWidth;
        const cursorLabel = document.getElementById("cursor-label");
        if (!cursorLabel) return;

        const labelWidth = cursorLabel.clientWidth;

        if (cursorLeft - labelWidth / 2 < 0) {
            labelLeftAdjustment = -cursorLeft + labelWidth / 2;
            // text align left
            cursorLabel.style.cssText += "; text-align: left !important;";
        } else if (cursorLeft + labelWidth / 2 > containerWidth) {
            labelLeftAdjustment = containerWidth - cursorLeft - labelWidth / 2;
            // text align right
            cursorLabel.style.textAlign = "right";
        } else {
            labelLeftAdjustment = 0;
        }
    }

    function updateCursorFromProp(highlightedOevk: string | null, sectionSize: number) {
        if (highlightedOevk) {
            const index = orderedData.findIndex((section) => section[0] === highlightedOevk);
            
            if (index !== -1) {
                updateCursor(index, orderedData[index], sectionSize);
            } else {
                resetCursor();
            }
        }
    }

    function resetCursor() {
        if (orderedData.length > 0 && sectionSize) {
            const defaultIndex = Math.floor(orderedData.length / 2);
            cursorLeft = defaultIndex * sectionSize + sectionSize / 2;
            labelLeftAdjustment = 0;
            currentOevkLabel = '';
            dispatch("oevkHover", null);
        }
    }

    $: updateCursorFromProp(highlightedOevk, sectionSize);
</script>

<section>
    <img src="/images/party-logo/fidesz.png" alt="Fidesz" class="fidesz" />
    <article bind:this={container} on:mouseleave={resetCursor}>
        {#if orderedData && sectionSize}
            {#if segments && segments.length}
                {#each segments as seg}
                    <div class="segment-label" style="left: {seg.centerLeft}px; top: {seg.labelTop}px; color: {seg.color};">
                        {seg.count}
                    </div>
                {/each}
            {/if}
            {#each Object.entries(orderedData) as [i, section]}
                <div
                    role="tooltip"
                    class="oevkSection"
                    class:highlighted={highlightedOevk === section[0] || section[0] === defaultIndex}
                    style="
                        width: {sectionSize}px;
                        height: {15 + 100 * Math.abs(section[1] * 1.5)}%;
                        background-color: {calculateColor(section[1],)}
                    "
                    on:mouseenter={e => {
                        updateCursor(parseInt(i), section, sectionSize)
                    }}
                ></div>
            {/each}
        {/if}
        <!-- Cursor container with arrow and label -->
        <div id="cursor-container" style="left: {cursorLeft}px;">
            <!-- <div id="cursor-arrow"></div> -->
            <div id="cursor-label" style="transform: translateX({labelLeftAdjustment}px);">
                {@html currentOevkLabel}<br>
            </div>
        </div>
    </article>
    <img src="/images/party-logo/tisza.png" alt="Tisza" class="tisza" />
</section>

<style lang="scss">
    section {
        display: grid;
        grid-template-columns: 36px 1fr 36px;
        gap: 10px;
        height: 100px;
        align-items: center;
        margin-bottom: 50px; /* extra space for the arrow and label */

        & > img {
            width: 100%;
            aspect-ratio: 1/1;
            border-radius: 50%;
            object-fit: contain;

            /* &.tisza {
                background-color: #00359c66;
            }
            &.fidesz {
                background-color: #fd810066;
            } */
        }
    }
    article {
        position: relative;
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        height: 100px;
        overflow: visible;
    }
    .oevkSection {
        height: 100%;
        flex-shrink: 0;
        opacity: 0.6;

        &.highlighted {
            transform: scale(1.5);
            border: 1px solid #333;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    }
    /* Cursor container positioned absolutely relative to the article */
    #cursor-container {
        position: absolute;
        top: 102px;
        transform: translateX(-50%);
        pointer-events: none;
    }
    /* Labels above each contiguous same-color segment */
    .segment-label {
        position: absolute;
        top: -18px;
        transform: translateX(-50%);
        font-size: 12px;
        line-height: 1;
        color: #333;
        font-size: 12px;
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
    }
    /* The upward-pointing arrow */
    #cursor-arrow {
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-bottom: 10px solid #333;
        margin: 0 auto;
    }
    /* The label below the arrow with ellipsis for long names */
    #cursor-label{
        margin-top: 2px;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-align: center;
    }
</style>
