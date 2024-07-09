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

	export let popular: Writable<ISearch<IAnimeResult>>;
	export let popular_page: Writable<number>;

	$: loading = false;

	const slideToReset = () => {
		if (document) {
			((document.querySelector("." + swiperClass.POPULAR) as any)?.swiper as Swiper).slideTo(0);
		}
	};
	const handleNextPopular = async () => {
		loading = true;
		popular_page.update((val) => val + 1);
		await handleUpdate({ data_var: popular, page_var: popular_page, url: "?/popular" });
		loading = false;

		slideToReset();
	};
	const handlePrevPopular = async () => {
		loading = true;
		popular_page.update((val) => (val > 1 ? val - 1 : 1));
		await handleUpdate({ data_var: popular, page_var: popular_page, url: "?/popular" });
		loading = false;

		slideToReset();
	};

	onMount(() => {
		var horizontal_swiper = new Swiper("." + swiperClass.POPULAR, HORIZONTAL_CONFIG);
	});
</script>

<div class="flex h-full flex-col justify-between">
	<div class="flex flex-col">
		<h2 class="mx-8 mb-4 mt-8 text-4xl font-bold text-red-700">Popular Animes</h2>
		<Hr hrClass="w-[97%] h-1 bg-orange-800" />
	</div>

	<div class="relative flex h-full flex-col justify-center align-middle">
		<Reels />
		<div class={swiperClass.POPULAR}>
			<div class="swiper-wrapper">
				{#each $popular.results as anime}
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
		<Button disabled={$popular_page > 1 ? false : true} on:click={() => handlePrevPopular()}>
			{#if loading}
				<Spinner class="me-3 w-12" size="5" color="white">Loading...</Spinner>
			{:else}
				Prev Page
			{/if}
		</Button>
		<Button disabled={$popular.hasNextPage ? false : true} on:click={() => handleNextPopular()}>
			{#if loading}
				<Spinner class="me-3 w-12" size="5" color="white">Loading...</Spinner>
			{:else}
				Next Page
			{/if}</Button
		>
	</div>
</div>
