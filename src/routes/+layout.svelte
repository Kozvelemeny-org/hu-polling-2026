<script lang="ts">
    import { page } from "$app/state";
    import MainLayout from "$components/MainLayout.svelte";

    $: isEmbed = page.url.pathname.includes("/embed");
</script>

<MainLayout embed={isEmbed}>
    <slot />
</MainLayout>
