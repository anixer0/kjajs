export interface ICacheStrategy {
	set<T>(key: string, value: T, ttl?: number): void | Promise<void>;
	get<T>(key: string): T | Promise<T | null>;
}
