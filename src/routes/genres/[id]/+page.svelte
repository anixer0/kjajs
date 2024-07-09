<script lang="ts">
	import { Button } from "flowbite-svelte";
	import { onMount } from "svelte";
	import Swiper from "swiper";
	import Reels from "$lib/reels.svelte";
	import { HORIZONTAL_CONFIG, swiperClass } from "$lib/swiper.config";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import AniCard from "../../ani-card.svelte";
	import { capitalizeTitle } from "../../../utils/capitalize.title";

	export let data;

	$: genres = data.genres;
	$: title = capitalizeTitle(data.title);
	$: genre_page = 1;
	$: curpage = $page.url.pathname;

	const slideToReset = () => {
		if (document) {
			((document.querySelector("." + swiperClass.GENRE) as any)?.swiper as Swiper).slideTo(0);
		}
	};

	const handleNextRecent = async () => {
		if (!genres.hasNextPage) {
			return;
		}
		genre_page++;
		goto(curpage + `?p=${genre_page}`);
		slideToReset();
	};
	const handlePrevRecent = async () => {
		if (genre_page < 2) {
			return;
		}
		genre_page--;
		goto(curpage + `?p=${genre_page}`);
		slideToReset();
	};

	onMount(() => {
		var horizontal_swiper = new Swiper("." + swiperClass.GENRE, HORIZONTAL_CONFIG);
	});
</script>

<svelte:head>
	<title>Astreamline | Genre | {title}</title>
	<meta name="description" content="All anime list from genre {title}" />
	<meta name="keywords" content="{title}, genre, " />
</svelte:head>

<div class="flex h-full w-svw flex-col justify-between">
	<h2 class="mx-8 mt-8 text-4xl font-bold text-red-700">Genre {title}</h2>

	<div class="relative flex h-fit flex-col">
		<Reels />
		<div class={swiperClass.GENRE}>
			<div class="swiper-wrapper">
				{#each genres.results as anime}
					<div class="swiper-slide">
						<AniCard {anime} />
					</div>
				{/each}
			</div>
		</div>
		<Reels />
	</div>
	<div class="relative bottom-8 flex w-screen justify-center gap-2 text-nowrap">
		<Button disabled={genre_page > 1 ? false : true} on:click={() => handlePrevRecent()}>
			Prev Page
		</Button>
		<Button disabled={genres.hasNextPage ? false : true} on:click={() => handleNextRecent()}>
			Next Page
		</Button>
	</div>
</div>
