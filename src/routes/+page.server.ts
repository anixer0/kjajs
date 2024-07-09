import { Provider } from "$lib";
import { GogoErr } from "$lib/interfaces/provider.strategy";
import { error } from "@sveltejs/kit";

export async function load() {
	try {
		return await Provider.main();
	} catch (err) {
		if (err instanceof GogoErr) console.log(err.message);

		throw err;
	}
}

export const actions = {
	recent: async ({ request }) => {
		const form = await request.formData();

		if (!form) error(400, "Invalid Page");

		const form_page = form.get("page")?.toString() ?? "1";
		const page = !isNaN(+form_page) ? +form_page : 1;

		const recent_data = await Provider.recent(page);

		if (!recent_data.results || !recent_data.results.length)
			error(503, "Something happened to server");

		return JSON.stringify(recent_data, null, 3);
	},
	top: async ({ request }) => {
		const form = await request.formData();

		if (!form) error(400, "Invalid Page");

		const form_page = form.get("page")?.toString() ?? "1";
		const page = !isNaN(+form_page) ? +form_page : 1;

		const recent_data = await Provider.top(page);

		if (!recent_data.results || !recent_data.results.length)
			error(503, "Something happened to server");

		return JSON.stringify(recent_data, null, 3);
	},
	popular: async ({ request }) => {
		const form = await request.formData();

		if (!form) error(400, "Invalid Page");

		const form_page = form.get("page")?.toString() ?? "1";
		const page = !isNaN(+form_page) ? +form_page : 1;

		const recent_data = await Provider.popular(page);

		if (!recent_data.results || !recent_data.results.length)
			error(503, "Something happened to server");

		return JSON.stringify(recent_data, null, 3);
	},
	movies: async ({ request }) => {
		const form = await request.formData();

		if (!form) error(400, "Invalid Page");

		const form_page = form.get("page")?.toString() ?? "1";
		const page = !isNaN(+form_page) ? +form_page : 1;

		const recent_data = await Provider.movies(page);

		if (!recent_data.results || !recent_data.results.length)
			error(503, "Something happened to server");

		return JSON.stringify(recent_data, null, 3);
	}
};
