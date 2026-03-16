<script lang="ts">
    import { page } from "$app/state";

    $: isEmbed = page.url.pathname.includes("/embed");
</script>

{#await import("$components/MainLayout.svelte")}
    <div></div>
{:then mod}
    <svelte:component this={mod.default} embed={isEmbed}>
        <slot />
    </svelte:component>
{/await}
