<script lang="ts">
    import type { Party, PollData } from "$lib/types";
    import { onMount } from "svelte";
    import { pollData, fetchPollData } from "../../stores/dataStore";
    import MiniMandateProjection from "../../components/MiniMandateProjection.svelte";

    let data: Record<'sure_voters' | 'all_voters', PollData> = {
        sure_voters: [],
        all_voters: [],
    };

    onMount(fetchPollData);

    $: data = $pollData;
</script>

<MiniMandateProjection />
<div id="all-parties">
    
</div>


<style lang="scss">
    .bodyContainer {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 700px;
        line-height: 1.4;
        border: 1px dashed blue;
        border-top: none;
    }

    article {
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
        padding: 8px 16px;
    }

    h1 {
        font-size: 1.8rem;
        font-weight: 500;
    }

    h2 {
        font-size: 22px;
        font-weight: 500;
        text-align: center;
    }

    p {
        font-size: 16px;
        margin-top: 12px;
    }

    #interactive-polls {
        grid-column: 1 / 5;
    }

    #all-parties {
        grid-column: 2 / 5;
    }
</style>
