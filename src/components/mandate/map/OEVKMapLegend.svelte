<script lang="ts">
    export let segmentColors: string[] = [];
    export let position: number = 50;
    export let label: string = "Ki esélyes?";
</script>

<div class="colorbar-container">
    <div class="colorbar">
        {#each segmentColors as color, i}
            <div
                class="legend-segment"
                style="background: {color}; opacity: 0.6;"
            ></div>
        {/each}
    </div>
    <div class="colorbar-arrow" style="left: {position}%;"></div>
    <div class="colorbar-label" style="left: {position}%;">
        <svg>
            <text x="50%" y="50%">{label}</text>
        </svg>
    </div>
</div>

<style lang="scss">
    .colorbar-container {
        position: absolute;
        top: 20px;
        left: 40px;
        width: min(200px, 80%);
        z-index: 2;
        pointer-events: none;
        background-color: #fff;
        outline: 1px solid #fff;
        pointer-events: all;
    }
    .colorbar {
        display: flex;
        width: 100%;
        height: 8px;
    }
    .legend-segment {
        flex: 1;
    }
    .colorbar-arrow {
        position: absolute;
        top: 10px;
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-bottom: 7px solid #333;
        transform: translateX(-50%);
    }
    .colorbar-label {
        position: absolute;
        top: 10px;
        width: 80px;
        height: 24px;
        transform: translateX(-50%) translateY(50%);
        text-align: center;
        overflow: visible;

        svg {
            width: 100%;
            height: 100%;
            overflow: visible;

            text {
                font-size: 14px;
                fill: #333;
                text-anchor: middle;
                stroke: #fff;
                stroke-width: 4;
                paint-order: stroke;
            }
        }
    }
</style>
