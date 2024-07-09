<script lang="ts">
	import { HORIZONTAL_CONFIG, swiperClass } from "$lib/swiper.config.js";
	import { onMount } from "svelte";
	import Swiper from "swiper";
	import AniCard from "../ani-card.svelte";
	import Reels from "$lib/reels.svelte";
	import { Button } from "flowbite-svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";

	export let data;

	$: curPage = data.res.currentPage ?? 1;
	$: query = data.query;
	$: searched = data.res.results;

	const slideToReset = () => {
		if (document) {
			((document.querySelector("." + swiperClass.SEARCH) as any)?.swiper as Swiper).slideTo(0);
		}
	};
	const handleNextSearch = async () => {
		curPage++;
		const url = `${$page.url.pathname}?q=${query}&p=${curPage}`;
		goto(url);

		slideToReset();
	};
	const handlePrevSearch = async () => {
		curPage--;
		const url = `${$page.url.pathname}?q=${query}&p${curPage}`;
		goto(url);

		slideToReset();
	};
	onMount(() => {
		var search_swiper = new Swiper("." + swiperClass.SEARCH, HORIZONTAL_CONFIG);
	});
</script>

<svelte:head>
	<title>Astreamline | Search | {query}</title>
	<meta name="description" content="Searching animes with query of {query}" />
	<meta
		name="keywords"
		content="no ads, Anime, streaming, ad-free, online, watch, series, high definition, no ads, binge-worthy, vibrant characters, captivating stories, entertainment, search, list"
	/>
</svelte:head>

<div class="flex h-full flex-col justify-between">
	<h2 class="mx-8 mt-8 text-4xl font-bold text-red-700">Searching: {query}</h2>

	<div class="relative flex h-full w-svw flex-col justify-center align-middle">
		<Reels />
		<div class={swiperClass.SEARCH}>
			<div class="swiper-wrapper">
				{#each searched as anime}
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

	<div class="relative bottom-8 flex w-screen justify-center gap-2 text-nowrap">
		<Button disabled={curPage > 1 ? false : true} on:click={() => handlePrevSearch()}>
			Prev Page
		</Button>
		<Button disabled={data.res.hasNextPage ? false : true} on:click={() => handleNextSearch()}>
			Next Page
		</Button>
	</div>
</div>
