import type { ICacheStrategy } from "$lib/interfaces/cache.strategy";
import { Redis } from "ioredis";

export class RedisCache implements ICacheStrategy {
	private host = process.env.REDIS_HOST ?? "localhost";
	private port = process.env.REDIS_PORT ?? "6379";
	private password = process.env.REDIS_PASSWORD;

	private redis: Redis;

	constructor() {
		let port = +this.port;

		if (isNaN(port)) {
			port = 6379;
		}

		const cred = {
			host: this.host,
			port,
			password: this.password
		};

		this.redis = new Redis(cred);
	}

	async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
		if (!key) throw new Error("No key provided");
		if (!value) throw new Error("No value provided");

		await this.redis.set(key, JSON.stringify(value), "EX", ttl);
	}

	async get<T>(key: string): Promise<T | null> {
		const data = await this.redis.get(key);

		if (!data) return null;

		return JSON.parse(data) as T;
	}
}
