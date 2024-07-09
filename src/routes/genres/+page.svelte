<script lang="ts">
	import { Hr } from "flowbite-svelte";
	import GenreButton from "./genre-button.svelte";

	export let data;

	$: genres = data.genres;
</script>

<svelte:head>
	<title>Astreamline | Genres</title>
	<meta name="description" content="All list of anime genres in Astreamline website" />
	<meta
		name="keywords"
		content="no ads, Anime, streaming, ad-free, online, watch, series, high definition, no ads, binge-worthy, vibrant characters, captivating stories, entertainment, genres, list"
	/>
</svelte:head>

<div class="flex max-h-full flex-col">
	<div class="flex flex-col gap-3">
		<h1 class="mx-8 mt-8 text-4xl font-bold text-red-700">All Genres</h1>
		<Hr hrClass="w-[95%] h-1 bg-red-400" />
	</div>

	<div class="relative my-4 flex flex-wrap gap-x-4 gap-y-6 overflow-y-auto px-8 py-4">
		{#each genres as genre}
			<GenreButton {genre} />
		{/each}
	</div>
</div>
e
