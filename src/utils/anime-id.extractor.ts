import type { IAnimeExtract } from "./interfaces/anime-id.interface";

export const animeExtractor = (epsId: string): IAnimeExtract | null => {
	const match = /^(.*)-episode-(\d+)$/is.exec(epsId);
	if (match) return { animeId: match[1], epsNum: +match[2] };

	return null;
};
