export interface IMutationRes<T> {
	success: boolean;
	data: T;
}

export interface IDbProviderStrategy<T, K> {
	findOne(id: string | number, where?: Partial<K>): Promise<T>;
	findAll(where?: Partial<K> | undefined): Promise<T[]>;
	createOne(data: K): Promise<IMutationRes<T>>;
	updateOne(id: string | number, data: Partial<K>): Promise<IMutationRes<T>>;
	deleteOne(id: string | number): Promise<IMutationRes<string | number>>;
	createOrUpdateBulk?(datas: K[]): Promise<IMutationRes<K[]>>;
	deleteBulk?(ids: string[] | number[]): Promise<IMutationRes<string[] | number[]>>;
	createOrNothing?(data: K): Promise<IMutationRes<K>>;
	createOrNothingBulk?(data: K[]): Promise<IMutationRes<K[]>>;
}
