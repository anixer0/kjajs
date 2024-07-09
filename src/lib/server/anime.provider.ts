import type { IAnimeInfo, IAnimeResult, ISearch, ISource } from "@consumet/extensions/dist/models";
import { type IProviderStrategy } from "../interfaces/provider.strategy";
import type { IMainPage, IGenreAnime, IStream, IMainQuery } from "../interfaces/provider.interface";
import type Gogoanime from "@consumet/extensions/dist/providers/anime/gogoanime";
import { animeExtractor } from "../../utils/anime-id.extractor";
import { cache } from "../../utils/cache.constant";
import type { ICacheStrategy } from "$lib/interfaces/cache.strategy";
import { MemoryCache } from "./cache/base.instance";

export class AnimeProvider<T extends Gogoanime> implements IProviderStrategy {
	constructor(
		private readonly provider: T,
		private readonly cacheProvider: ICacheStrategy = new MemoryCache()
	) {}

	async genre(genre: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
		const key = cache.GENRES + genre + "/" + page;
		const data = await this.cacheProvider.get<ISearch<IAnimeResult>>(key);

		if (data) return data;

		const fetchedGenre = await this.provider.fetchGenreInfo(genre, page);
		if (!fetchedGenre || !fetchedGenre.results.length) throw new Error("No genre available");

		await this.cacheProvider.set(key, fetchedGenre, 3600);

		return fetchedGenre;
	}
	async recent(page: number = 1): Promise<ISearch<IAnimeResult>> {
		const key = cache.RECENT + page;
		const data = await this.cacheProvider.get<ISearch<IAnimeResult>>(key);

		if (data) return data;

		const recentAni = await this.provider.fetchRecentEpisodes(page);
		if (!recentAni || !recentAni.results.length) throw new Error("No recent animes");

		await this.cacheProvider.set(key, recentAni, 300);

		return recentAni;
	}
	async top(page: number = 1): Promise<ISearch<IAnimeResult>> {
		const key = cache.TOP + page;
		const data = await this.cacheProvider.get<ISearch<IAnimeResult>>(key);

		if (data) return data;

		const topAni = await this.provider.fetchTopAiring(page);
		if (!topAni) throw new Error("No top animes");

		await this.cacheProvider.set(key, topAni, 3600);

		return topAni;
	}
	async popular(page: number = 1): Promise<ISearch<IAnimeResult>> {
		const key = cache.POPULAR + page;
		const data = await this.cacheProvider.get<ISearch<IAnimeResult>>(key);

		if (data) return data;

		const popularAni = await this.provider.fetchPopular(page);
		if (!popularAni || !popularAni.results.length) throw new Error("No popular animes");

		await this.cacheProvider.set(key, popularAni, 3600);

		return popularAni;
	}
	async movies(page: number = 1) {
		const key = cache.MOVIES + page;
		const data = await this.cacheProvider.get<ISearch<IAnimeResult>>(key);

		if (data) return data;

		const moviesAni = await this.provider.fetchRecentMovies(page);
		if (!moviesAni || !moviesAni.results.length) throw new Error("No movies animes");

		await this.cacheProvider.set(key, moviesAni, 3600);

		return moviesAni;
	}
	async detail(animeId: string): Promise<IAnimeInfo> {
		const key = cache.DETAIL + animeId;
		const data = await this.cacheProvider.get<IAnimeInfo>(key);

		if (data) return data;

		const detailAni = await this.provider.fetchAnimeInfo(animeId);
		if (!detailAni) throw new Error("No detail animes");

		await this.cacheProvider.set(key, detailAni, 300);

		return detailAni;
	}
	async search(query: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
		return await this.provider.search(query, page);
	}
	async allGenres(): Promise<IGenreAnime[]> {
		const key = cache.GENRES;
		const data = await this.cacheProvider.get<IGenreAnime[]>(key);

		if (data) return data;

		const genres = await this.provider.fetchGenreList();
		if (!genres || !genres.length) throw new Error("No Genres");

		await this.cacheProvider.set(key, genres, 3600);

		return genres;
	}
	async stream(episodeId: string): Promise<IStream> {
		const extracted = animeExtractor(episodeId);
		let animeId = extracted?.animeId;
		let epsNum = extracted?.epsNum;

		if (!animeId || !epsNum) {
			animeId = await this.provider.fetchAnimeIdFromEpisodeId(episodeId);

			const splittedEps = episodeId.split("-");
			epsNum = +splittedEps[splittedEps.length - 1];
		}

		const key = cache.STREAM + episodeId;
		const cached = await Promise.all([this.cacheProvider.get<ISource>(key), this.detail(animeId)]);
		let source = cached[0];
		const anime = cached[1];

		if (!source) {
			source = await this.provider.fetchEpisodeSources(episodeId);
			await this.cacheProvider.set(key, source, 604800); //1 week
		}

		const stream: IStream = { ...source, anime, curEps: epsNum };
		if (!stream) throw new Error("Stream data invalid");

		const epsIdx = epsNum ? anime.episodes?.findIndex((anime) => anime.number === epsNum) : null;

		if (anime.episodes && epsIdx && epsIdx > 0) {
			stream.next = anime.episodes[epsIdx + 1];
			stream.prev = anime.episodes[epsIdx - 1];
		}

		return stream;
	}

	async main(query?: IMainQuery): Promise<IMainPage> {
		const [recent, top, popular, movies] = await Promise.all([
			this.recent(query?.recent),
			this.top(query?.top),
			this.popular(query?.popular),
			this.movies(query?.movies)
		]);

		return {
			recent,
			top,
			popular,
			movies
		};
	}
}
