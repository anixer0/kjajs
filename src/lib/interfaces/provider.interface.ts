import type {
	IAnimeEpisode,
	IAnimeInfo,
	IAnimeResult,
	ISearch,
	ISource
} from "@consumet/extensions";

export interface IStream extends ISource {
	anime: IAnimeInfo;
	curEps: number | null;
	prev?: IAnimeEpisode;
	next?: IAnimeEpisode;
}

export interface IMainPage {
	recent: ISearch<IAnimeResult>;
	top: ISearch<IAnimeResult>;
	popular: ISearch<IAnimeResult>;
	movies: ISearch<IAnimeResult>;
}

export interface IPopularAnime {
	title: string;
	url: string;
}

export interface IGenreAnime {
	title?: string;
	id?: string;
}

export interface IMainQuery {
	recent: number;
	top: number;
	popular: number;
	movies: number;
}
