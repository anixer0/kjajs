import type { ICacheStrategy } from "$lib/interfaces/cache.strategy";

export class MemoryCache implements ICacheStrategy {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(private readonly cache: Record<string, any> = {}) {}

	set<T>(key: string, value: T): void {
		if (!key) throw new Error("No key provided");
		if (!value) throw new Error("No value provided");

		this.cache[key] = value;
	}

	get<T>(key: string): T {
		const data: T = this.cache[key];

		if (!data) throw new Error("key is not existed");

		return data;
	}
}
