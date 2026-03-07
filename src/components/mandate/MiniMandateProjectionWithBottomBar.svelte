<script lang="ts">
    import type { Simulation } from "$lib/types";
    import MiniMandateProjectionCore from "./MiniMandateProjectionCore.svelte";

    export let data: Record<string, Simulation> = {};
    export let selectedSimulation = 'main';
    export let forceHorizontalMode = false;

    let leaderText = '';

    function getLeaderText(simulationData: Simulation) {
        if (simulationData.medians.tisza > 133) {
            return 'Tisza kétharmad';
        } else if (simulationData.medians.tisza > 100) {
            return 'Tisza többség';
        } else if (simulationData.medians.fidesz > 133) {
            return 'Fidesz kétharmad';
        } else if (simulationData.medians.fidesz > 100) {
            return 'Fidesz többség';
        }
        return 'Nincs többség';
    }

    $: if (data && selectedSimulation && data[selectedSimulation]) {
        leaderText = getLeaderText(data[selectedSimulation]);
    }
</script>

<div class="mandate-projection-container">
    <MiniMandateProjectionCore 
        {data} 
        {selectedSimulation} 
        {forceHorizontalMode}
    />
    <div class="chartInfos">
        <img src="/images/candidate/fidesz.png" alt="Fidesz" class="fidesz" />
        <div class="textContainer">
            <h2 id="leaderText">Prognózis:</h2>
            <div class="standing">
                {leaderText}
            </div>
        </div>
        <img src="/images/candidate/tisza.png" alt="Tisza" class="tisza" />
    </div>
</div>

<style lang="scss">
.mandate-projection-container {
    position: relative;
}

.chartInfos {
    position: relative;
    max-width: 250px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: -32px;
    padding: 6px;
    border-radius: 120px;
    background-color: #f5f5f5;
    border: 1px solid #eee;
    z-index: 2;

    img {
        width: 36px;
        height: 36px;
        border-radius: 50%;

        &.tisza {
            background-color: #00359c66;
        }
        &.fidesz {
            background-color: #fd810066;
        }
    }

    .textContainer {
        align-items: center;
        padding: 0 8px;
        
        h2#leaderText {
            font-size: 14px;
            font-weight: 600;
            padding: 2px 3px;
            padding-bottom: 0;
        }
        .standing {
            font-size: 12px;
            text-align: center;
        }
    }
}

@media (max-width: 600px) {
    .chartInfos {
        max-width: 330px;
        margin-top: -36px;
    }
}
</style>
