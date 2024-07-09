<script lang="ts">
	import { Button, Hr, Spinner } from "flowbite-svelte";
	import EpsCard from "./eps-card.svelte";
	import type { IAnimeResult, ISearch } from "@consumet/extensions";
	import type { Writable } from "svelte/store";
	import { handleUpdate } from "../utils/data.update";
	import { onMount } from "svelte";
	import Swiper from "swiper";
	import Reels from "$lib/reels.svelte";
	import { HORIZONTAL_CONFIG, swiperClass } from "$lib/swiper.config";

	export let recent: Writable<ISearch<IAnimeResult>>;
	export let recent_page: Writable<number>;

	$: loading = false;

	const slideToReset = () => {
		if (document) {
			((document.querySelector("." + swiperClass.RECENT) as any)?.swiper as Swiper).slideTo(0);
		}
	};

	const handleNextRecent = async () => {
		loading = true;
		recent_page.update((val) => val + 1);
		await handleUpdate({ data_var: recent, page_var: recent_page, url: "?/recent" });
		loading = false;

		slideToReset();
	};
	const handlePrevRecent = async () => {
		loading = true;
		recent_page.update((val) => (val > 1 ? val - 1 : 1));
		await handleUpdate({ data_var: recent, page_var: recent_page, url: "?/recent" });
		loading = false;

		slideToReset();
	};

	onMount(() => {
		var horizontal_swiper = new Swiper("." + swiperClass.RECENT, HORIZONTAL_CONFIG);
	});
</script>

<div class="flex h-full flex-col justify-between">
	<div class="flex flex-col">
		<h2 class="mx-8 mb-4 mt-8 text-4xl font-bold text-red-700">Recent Animes</h2>

		<Hr hrClass="w-[97%] h-1 bg-orange-800" />
	</div>

	<div class="relative flex h-fit flex-col justify-center align-middle">
		<Reels />
		<div class={swiperClass.RECENT}>
			<div class="swiper-wrapper">
				{#each $recent.results as anime}
					<div
						class="swiper-slide"
						style="display: flex; width: 100%; justify-content: center; align-items: center;"
					>
						<EpsCard {anime} />
					</div>
				{/each}
			</div>
			<div class="swiper-pagination"></div>
		</div>
		<Reels />
	</div>
	<div
		class="relative bottom-8 flex w-screen justify-center gap-2 text-nowrap"
		data-sveltekit-preload-code="eager"
	>
		<Button disabled={$recent_page > 1 ? false : true} on:click={() => handlePrevRecent()}>
			{#if loading}
				<Spinner class="me-3 w-12" size="5" color="white">Loading...</Spinner>
			{:else}
				Prev Page
			{/if}
		</Button>
		<Button disabled={$recent.hasNextPage ? false : true} on:click={() => handleNextRecent()}>
			{#if loading}
				<Spinner class="me-3 w-12" size="5" color="white">Loading...</Spinner>
			{:else}
				Next Page
			{/if}</Button
		>
	</div>
</div>
