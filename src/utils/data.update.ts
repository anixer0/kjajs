import { error } from "@sveltejs/kit";
import type { IUpdateData } from "./interfaces/data-update.interface";

export async function handleUpdate<T>({ data_var, page_var, url }: IUpdateData<T>) {
	const form = new FormData();

	page_var.update((val) => {
		form.append("page", val + "");

		return val;
	});

	const res = await fetch(url, {
		method: "POST",
		body: form
	});
	if (!res.ok) error(400, "Invalid page");

	const { data } = await res.json();
	const [recent_data] = JSON.parse(data);

	data_var.update(() => JSON.parse(recent_data));
}
