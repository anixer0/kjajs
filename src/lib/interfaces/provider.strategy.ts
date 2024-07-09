import type { IAnimeInfo, ISearch } from "@consumet/extensions";
import type { IAnimeResult } from "@consumet/extensions/dist/models";
import type { IGenreAnime, IMainPage, IMainQuery, IStream } from "./provider.interface";

export interface IProviderStrategy {
	main(query?: IMainQuery): Promise<IMainPage>;
	recent(page?: number): Promise<ISearch<IAnimeResult>>;
	top(page?: number): Promise<ISearch<IAnimeResult>>;
	popular(page?: number): Promise<ISearch<IAnimeResult>>;
	movies(page?: number): Promise<ISearch<IAnimeResult>>;
	detail(animeId: string, page?: number): Promise<IAnimeInfo>;
	search(query: string, page?: number): Promise<ISearch<IAnimeResult>>;
	allGenres(): Promise<IGenreAnime[]>;
	genre(genre: string, page?: number): Promise<ISearch<IAnimeResult>>;
	stream(episodeId: string): Promise<IStream>;
}

export class GogoErr {
	constructor(public readonly message: string) {}
}
