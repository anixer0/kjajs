import { Provider } from "$lib";

export function load() {
	return Provider.allGenres().then((genres) => ({ genres }));
}
