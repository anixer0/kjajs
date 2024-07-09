<script lang="ts">
	import type { IAnimeResult } from "@consumet/extensions";
	import { Card, GradientButton } from "flowbite-svelte";
	import { titleShorten } from "../utils/title.shortener";

	export let anime: IAnimeResult;

	$: animeTitle = `${anime.title.toString()} - ${anime.episodeNumber}`;
	$: watchUrl = `stream/${btoa(anime.id + "-episode-" + anime.episodeNumber)}`;
	$: detailUrl = "/detail/" + anime.id;
</script>

<Card
	padding="none"
	size="xs"
	class="flex h-[60svh] justify-between rounded-md bg-secondary-200 md:h-[47svh]"
	data-sveltekit-preload-code="eager"
>
	<div class="flex flex-col justify-center gap-3 px-5 py-2 align-middle">
		<a href={detailUrl}>
			<div
				class="relative flex h-[37svh] w-auto rounded-sm bg-cover bg-center md:h-[25svh]"
				style="background-image: url('{anime?.cover ?? anime.image}')"
			/>
		</a>
		<a href={detailUrl}>
			<h4
				class="whitespace-break-spaces pb-1 text-center text-xl font-semibold tracking-tight text-gray-900"
			>
				{titleShorten(animeTitle)}
			</h4>
		</a>
	</div>

	<div class="mx-auto mb-4 w-[80%]">
		<GradientButton
			class="mt-1 flex items-center justify-center text-lg duration-500 ease-in-out"
			outline
			color="pinkToOrange"
			href={watchUrl}>Watch Now</GradientButton
		>
	</div>
</Card>
