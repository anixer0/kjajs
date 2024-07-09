import { DbProvider, Provider } from "$lib/index";

export async function load({ params }) {
	const id = params?.id;

	if (!id) throw new Error("No id provided");

	const anime = await Provider.detail(id);

	await DbProvider.addAnime(anime);

	return anime;
}
