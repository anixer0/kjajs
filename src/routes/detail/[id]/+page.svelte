<script lang="ts">
	import { Card, Hr, GradientButton, Badge } from "flowbite-svelte";
	import { titleShorten } from "../../../utils/title.shortener";

	export let data;

	$: episodes = data.episodes?.reverse() ?? [];
	$: genres = data.genres ?? [];
</script>

<svelte:head>
	<title>Astreamline | {data.title}</title>
	<meta name="description" content={`Watch ${data.title}: ${data.description}`} />
	<meta
		name="keywords"
		content={`${data.title.toString()}, ${data.genres?.join(", ")}, ${data.rating}, no ads, Anime, streaming, ad-free, online, watch, series, high definition, no ads, binge-worthy, vibrant characters, captivating stories, entertainment`}
	/>
</svelte:head>

<div
	class="flex w-screen justify-center space-y-4 overflow-y-auto px-2 py-4 align-middle md:px-4 md:py-8"
>
	<Card img={data.cover ?? data.image} class="h-fit w-full" horizontal size="none">
		<h1 class="mb-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
			{data.title}
		</h1>
		<h2>{data.status}</h2>
		<div class="flex flex-wrap gap-1">
			{#each genres as genre}
				<a href="/genres/{genre.toLowerCase().replaceAll(' ', '-')}">
					<Badge border color="green">{genre}</Badge>
				</a>
			{/each}
		</div>
		<Hr />
		<div>
			<h3 class="mb-3 py-4 text-xl font-bold md:py-8">Description</h3>
			<p class="mb-3 font-normal leading-tight text-gray-700 dark:text-gray-400">
				{data.description}
			</p>
		</div>
		<Hr />
		<div class="grid max-h-[35svh] grid-cols-3 gap-x-2 gap-y-4">
			{#each episodes as eps}
				<a href={"/stream/" + btoa(eps.id)}>
					<GradientButton class="w-full whitespace-break-spaces"
						>{titleShorten(data.title.toString())} - {eps.number}</GradientButton
					>
				</a>
			{/each}
		</div>
	</Card>
</div>
