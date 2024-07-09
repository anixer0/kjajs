import { Provider } from "$lib";

export async function load({ params, url }) {
	const id = params?.id;
	const pageQuery = url.searchParams.get("p") ?? "1";
	const page = !isNaN(+pageQuery) ? +pageQuery : 1;

	if (!id) throw new Error("No id provided");

	const genres = await Provider.genre(id, page);

	return { genres, title: id };
}
