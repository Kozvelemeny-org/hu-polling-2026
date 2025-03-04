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
            const index = String(orderedData.findIndex((section) => section[0] === defaultIndex)) as keyof typeof oevkNameMap;
            currentOevkLabel =
                oevkNameMap[index] ||
                orderedData[Number(defaultIndex)][0];
        }
    }

    async function updateCursor(index: number, section: [keyof typeof oevkNameMap, number], sectionSize: number) {
        cursorLeft = index * sectionSize + sectionSize / 2;
        currentOevkLabel = oevkNameMap[section[0]] || section[0];
        dispatch("oevkHover", section[0]);
        
        await tick();

        // Correct text position if it goes out of bounds
        const labelWidth = document.getElementById("cursor-label")?.clientWidth || 0;
        const containerWidth = container.clientWidth;

        if (cursorLeft - labelWidth / 2 < 0) {
            labelLeftAdjustment = -cursorLeft + labelWidth / 2;
        } else if (cursorLeft + labelWidth / 2 > containerWidth) {
            labelLeftAdjustment = containerWidth - cursorLeft - labelWidth / 2;
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
            currentOevkLabel =
                oevkNameMap[orderedData[defaultIndex][0]] ||
                orderedData[defaultIndex][0];
            dispatch("oevkHover", null);
        }
    }

    $: updateCursorFromProp(highlightedOevk, sectionSize);
</script>

<article bind:this={container} on:mouseleave={resetCursor}>
    {#if orderedData && sectionSize}
        {#each Object.entries(orderedData) as [i, section]}
            <div
                role="tooltip"
                class="oevkSection"
                class:highlighted={highlightedOevk === section[0] || section[0] === defaultIndex}
                style="
                    width: {sectionSize}px;
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
            {currentOevkLabel}<br>
        </div>
    </div>
</article>

<style lang="scss">
    article {
        position: relative;
        display: flex;
        flex-wrap: nowrap;
        height: 20px;
        margin-bottom: 50px; /* extra space for the arrow and label */
    }
    .oevkSection {
        height: 100%;
        flex-shrink: 0;

        &.highlighted {
            transform: scale(1.5);
            border: 1px solid #333;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    }
    /* Cursor container positioned absolutely relative to the article */
    #cursor-container {
        position: absolute;
        top: 22px;
        transform: translateX(-50%);
        pointer-events: none;
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
