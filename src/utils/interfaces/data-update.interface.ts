import type { Writable } from "svelte/store";

export interface IUpdateData<T> {
	data_var: Writable<T>;
	page_var: Writable<number>;
	url: string;
}
