<script lang="ts">
    import { page } from "$app/state";
    import MainLayout from "$components/MainLayout.svelte";

    $: isEmbed = page.url.pathname.includes("/embed");

    const websiteJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Vox Populi: 2026 - Közvélemény-kutatások és mandátumbecslés",
        url: "https://2026.kozvelemeny.org/",
        inLanguage: "hu-HU"
    };

    const organizationJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Vox Populi",
        url: "https://2026.kozvelemeny.org/",
        email: "mailto:hidegmisi@gmail.com"
    };

    const websiteJsonLdScript = `<script type="application/ld+json">${JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c")}<\/script>`;
    const organizationJsonLdScript = `<script type="application/ld+json">${JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c")}<\/script>`;
</script>

<svelte:head>
    {@html websiteJsonLdScript}
    {@html organizationJsonLdScript}
</svelte:head>

<MainLayout embed={isEmbed}>
    <slot />
</MainLayout>
