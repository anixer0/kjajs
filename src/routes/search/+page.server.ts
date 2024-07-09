import { Provider } from "$lib";
import { redirect } from "@sveltejs/kit";

export async function load({ url }) {
	const query = url.searchParams.get("q") ?? "";
	if (!query || !query.length) redirect(301, "/");

	const pageQuery = url.searchParams.get("p") ?? "";
	const page = !isNaN(+pageQuery) ? +pageQuery : 1;

	const res = await Provider.search(query, page);

	return { res, query };
}
