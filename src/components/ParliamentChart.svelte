<script>
    import ParliamentChart from "$lib/parliament-chart/ParliamentChart";
    import { onMount } from "svelte";
    import { partyColors } from "../stores/dataStore";

    let chart;

    onMount(() => {
        chart = new ParliamentChart("#chart", {
            width: 600,
            height: 400,
            seatRadius: 8,
            seatPadding: 4,
            // You can adjust these as needed.
            margin: { top: 20, right: 20, bottom: 20, left: 20 },
        });
        chart.update([
            {name: "Tisza", color: partyColors["tisza"], seats: 101},
            {name: "Fidesz", color: partyColors["fidesz"], seats: 83}, 
            {name: "dk_mszp_p", color: partyColors["dk_mszp_p"], seats: 9}, 
            {name: "mihazank", color: partyColors["mihazank"], seats: 6}, 
        ]);
    });
</script>

<div id="chart"></div>
