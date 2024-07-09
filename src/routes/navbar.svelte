<script lang="ts">
	import { Input } from "flowbite-svelte";
	import { ListMusicSolid, HomeSolid, SearchOutline } from "flowbite-svelte-icons";
	import { debounce } from "../utils/debouncer";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { BottomNav, BottomNavItem, Popover } from "flowbite-svelte";

	$: activeUrl = $page.url.pathname;
	$: previousActive = "";

	const debouncer = debounce(300);

	const handleSearch = (e: Event) => {
		debouncer(() => {
			const value = (e.target as HTMLInputElement)?.value;

			return goto("/search?q=" + value, { keepFocus: true });
		});
	};

	const handleFocusSearch = (state: "active" | "deact") => {
		if (state === "active") {
			previousActive = activeUrl;
			activeUrl = "#search";

			return;
		}

		activeUrl = previousActive;
		return;
	};
</script>

<BottomNav
	{activeUrl}
	position="sticky"
	classInner="flex justify-center bottom-0"
	classActive="font-bold text-green-500 hover:text-green-900 dark:hover:text-green-700 dark:text-green-300"
>
	<BottomNavItem data-sveltekit-preload-code="eager" btnName="Home" href="/">
		<HomeSolid />
	</BottomNavItem>
	<BottomNavItem data-sveltekit-preload-code="eager" btnName="Genres" href="/genres">
		<ListMusicSolid />
	</BottomNavItem>
	<BottomNavItem class="relative max-w-sm cursor-none md:block" btnName="Search" href="#search">
		<SearchOutline />
		<Popover>
			<Input
				on:input={handleSearch}
				on:focus={() => handleFocusSearch("active")}
				on:blur={() => handleFocusSearch("deact")}
				id="search-navbar"
				class="ps-5"
				placeholder="Search Animes"
			/>
		</Popover>
	</BottomNavItem>
</BottomNav>
