<script lang="ts">
	import { Button, Hr, Spinner } from "flowbite-svelte";
	import AniCard from "./ani-card.svelte";
	import { handleUpdate } from "../utils/data.update";
	import type { IAnimeResult, ISearch } from "@consumet/extensions";
	import type { Writable } from "svelte/store";
	import { onMount } from "svelte";
	import Swiper from "swiper";
	import Reels from "$lib/reels.svelte";
	import { HORIZONTAL_CONFIG, swiperClass } from "$lib/swiper.config";

	export let top: Writable<ISearch<IAnimeResult>>;
	export let top_page: Writable<number>;

	$: loading = false;

	const slideToReset = () => {
		if (document) {
			((document.querySelector("." + swiperClass.TOP) as any)?.swiper as Swiper).slideTo(0);
		}
	};
	const handleNextTop = async () => {
		loading = true;
		top_page.update((val) => val + 1);
		await handleUpdate({ data_var: top, page_var: top_page, url: "?/top" });
		loading = false;

		slideToReset();
	};
	const handlePrevTop = async () => {
		loading = true;
		top_page.update((val) => (val > 1 ? val - 1 : 1));
		await handleUpdate({ data_var: top, page_var: top_page, url: "?/top" });
		loading = false;

		slideToReset();
	};
	onMount(() => {
		var horizontal_swiper = new Swiper("." + swiperClass.TOP, HORIZONTAL_CONFIG);
	});
</script>

<div class="flex h-full flex-col justify-between">
	<div class="flex flex-col">
		<h2 class="mx-8 mb-4 mt-8 text-4xl font-bold text-red-700">Top Animes</h2>
		<Hr hrClass="w-[97%] h-1 bg-orange-800" />
	</div>
	<div class="relative flex h-full flex-col justify-center align-middle">
		<Reels />
		<div class={swiperClass.TOP}>
			<div class="swiper-wrapper">
				{#each $top.results as anime}
					<div
						class="swiper-slide"
						style="display: flex; width: 100%; justify-content: center; align-items: center;"
					>
						<AniCard {anime} />
					</div>
				{/each}
			</div>
		</div>
		<Reels />
	</div>
	<div
		class="relative bottom-8 flex w-screen justify-center gap-2 text-nowrap"
		data-sveltekit-preload-code="eager"
	>
		<Button disabled={$top_page > 1 ? false : true} on:click={() => handlePrevTop()}>
			{#if loading}
				<Spinner class="me-3 w-12" size="5" color="white">Loading...</Spinner>
			{:else}
				Prev Page
			{/if}
		</Button>
		<Button disabled={$top.hasNextPage ? false : true} on:click={() => handleNextTop()}>
			{#if loading}
				<Spinner class="me-3 w-12" size="5" color="white">Loading...</Spinner>
			{:else}
				Next Page
			{/if}</Button
		>
	</div>
</div>
