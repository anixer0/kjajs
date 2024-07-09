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

	export let movies: Writable<ISearch<IAnimeResult>>;
	export let movies_page: Writable<number>;

	$: loading = false;

	const slideToReset = () => {
		if (document) {
			((document.querySelector("." + swiperClass.MOVIES) as any)?.swiper as Swiper).slideTo(0);
		}
	};
	const handleNextMovies = async () => {
		loading = true;
		movies_page.update((val) => val + 1);
		await handleUpdate({ data_var: movies, page_var: movies_page, url: "?/movies" });
		loading = false;

		slideToReset();
	};
	const handlePrevMovies = async () => {
		loading = true;
		movies_page.update((val) => (val > 1 ? val - 1 : 1));
		await handleUpdate({ data_var: movies, page_var: movies_page, url: "?/movies" });
		loading = false;

		slideToReset();
	};
	onMount(() => {
		var horizontal_swiper = new Swiper("." + swiperClass.MOVIES, HORIZONTAL_CONFIG);
	});
</script>

<div class="flex h-full flex-col justify-between">
	<div class="flex flex-col">
		<h2 class="mx-8 mb-4 mt-8 text-4xl font-bold text-red-700">Movie Animes</h2>
		<Hr hrClass="w-[97%] h-1 bg-orange-800" />
	</div>

	<div class="relative flex h-full flex-col justify-center align-middle">
		<Reels />
		<div class={swiperClass.MOVIES}>
			<div class="swiper-wrapper">
				{#each $movies.results as anime}
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
		<Button disabled={$movies_page > 1 ? false : true} on:click={() => handlePrevMovies()}>
			{#if loading}
				<Spinner class="me-3 w-12" size="5" color="white">Loading...</Spinner>
			{:else}
				Prev Page
			{/if}
		</Button>
		<Button disabled={$movies.hasNextPage ? false : true} on:click={() => handleNextMovies()}>
			{#if loading}
				<Spinner class="me-3 w-12" size="5" color="white">Loading...</Spinner>
			{:else}
				Next Page
			{/if}</Button
		>
	</div>
</div>
