<script lang="ts">
	import { ButtonGroup, GradientButton } from "flowbite-svelte";
	import Player from "./Player.svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";

	export let data;

	$: sourcesData = data.sourcesData;
	$: prevUrl = `/stream/${btoa(data.prev?.id ?? $page.params.id)}`;
	$: nextUrl = `/stream/${btoa(data.next?.id ?? $page.params.id)}`;
	$: loading = false;

	const handleNextEps = async () => {
		loading = true;
		if (!data.next?.id) {
			loading = false;
			return;
		}

		await goto(nextUrl, { replaceState: true });
		loading = false;
	};
	const handlePrevEps = async () => {
		loading = true;
		if (!data.prev?.id) {
			loading = false;
			return;
		}

		await goto(prevUrl, { replaceState: true });
		loading = false;
	};
</script>

<svelte:head>
	<title>Streaming Anime - {data.anime.title.toString()} Episode {data.curEps?.toString()}</title>
	<meta name="description" content={data.anime.description} />
	<meta
		name="keywords"
		content={`streaming online, ${data.anime.title.toString().toLowerCase()} episode ${data.curEps?.toString()}, no ads, watch`}
	/>
</svelte:head>

<div class="flex w-full flex-col justify-center gap-4 p-4">
	<div class="w-fit rounded-md border-[3px] bg-primary-700 px-2 py-4 shadow-md md:px-4 md:py-6">
		<h1 class="text-2xl font-semibold text-white">
			{data.anime.title} Episode {data.curEps}
		</h1>
	</div>

	{#key sourcesData}
		<Player {sourcesData} />
	{/key}

	<div class="flex w-full justify-center whitespace-break-spaces text-wrap">
		<ButtonGroup>
			<GradientButton
				disabled={data.prev ? false : true}
				on:click={handlePrevEps}
				outline
				color="tealToLime">{loading ? "loading...." : "Previous Episode"}</GradientButton
			>
			<GradientButton
				disabled={data.next ? false : true}
				on:click={handleNextEps}
				outline
				color="tealToLime">{loading ? "loading...." : "Next Episode"}</GradientButton
			>
		</ButtonGroup>
	</div>
</div>
