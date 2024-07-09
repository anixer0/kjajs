<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { browser } from "$app/environment"; // Import browser environment variable
	import { generateOpts } from "../../../utils/video-player..config";
	import Artplayer from "artplayer";
	import type { IGenerateOpts } from "$lib/interfaces/video.interface";

	export let sourcesData: Omit<IGenerateOpts, "div">;

	let streamDiv: HTMLDivElement;
	let art: Artplayer;

	$: sourcesData;
	$: art;

	onMount(async () => {
		if (browser) {
			const config = generateOpts({ ...sourcesData });
			// Import Artplayer only on the client-side
			Artplayer.MOBILE_CLICK_PLAY = true;
			art = new Artplayer({ ...config });

			art.on("resize", () => {
				art.subtitle.style({
					fontSize: art.height * 0.05 + "px"
				});
			});

			art.on("subtitleUpdate", (text: string) => {
				art.template.$subtitle.innerHTML = text;
			});

			art.on("destroy", () => {
				art.hls.destroy();
			});

			art.on("ready", () => {
				streamDiv.scrollTo({ behavior: "smooth" });
			});
		}
	});

	onDestroy(() => {
		if (art && art.hls) {
			art.destroy(true);
			art.hls.destroy();
		}
	});
</script>

<div
	bind:this={streamDiv}
	class="artplayer-app my-8 rounded-sm bg-blend-screen shadow-sm ring-2 ring-offset-[2.5rem]"
	style="aspect-ratio: 16 / 9;"
/>
