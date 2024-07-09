<script>
	import Navbar from "./navbar.svelte";
	import "../app.pcss";
	import { register } from "swiper/element";
	import { onMount } from "svelte";
	import "swiper/css/bundle";
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import Loading from "$lib/loading.svelte";
	import { inject } from "@vercel/analytics";
	import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
	import Maintenance from "$lib/maintenance.svelte";

	$: route_loading = false;

	onMount(() => {
		register();
		if (process.env.NODE_ENV === "production") {
			inject();
			injectSpeedInsights();
		}
	});

	beforeNavigate(() => (route_loading = true));
	afterNavigate(() => (route_loading = false));
</script>

<div class="h-screen w-screen overflow-hidden">
	{#if route_loading}
		<Loading />
	{:else}
		<div class="flex h-[93svh]">
			<slot />
			<!-- <Maintenance /> -->
		</div>
	{/if}
	<div class="relative bottom-0">
		<Navbar />
	</div>
</div>
