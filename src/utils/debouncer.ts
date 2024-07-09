export const debounce = (timeout: number) => {
	let data: unknown;
	let id: NodeJS.Timeout | undefined;

	return <T>(fn: () => T) => {
		if (id) clearTimeout(id);

		const timeout_id = setTimeout(() => {
			const res = fn();

			data = Promise.resolve(res);
		}, timeout);

		id = timeout_id;

		return data as T;
	};
};
