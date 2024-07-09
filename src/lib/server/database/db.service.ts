import type { IAnimeInfo } from "@consumet/extensions";
import { AniDataProvider } from "./providers/animes.provider";
import { AniGenreDataProvider } from "./providers/anime-genres.provider";
import { GenreDataProvider } from "./providers/genres.provider";
import { LogDataProvider } from "./providers/logs.provider";
import type { Anime } from "./models/anime.model";
import { EpsDataProvider } from "./providers/epsiode.provider";

/**
 * @description bad service. refactor later. for now, just go for speed
 */
export class DbService {
	constructor(
		private readonly animeProvider = new AniDataProvider(),
		private readonly animeGenreProvider = new AniGenreDataProvider(),
		private readonly genreProvider = new GenreDataProvider(),
		private readonly logProvider = new LogDataProvider(),
		private readonly episodeProvider = new EpsDataProvider()
	) {}

	/**
	 *
	 * @param anime anime to fill db with
	 * @tag warning on no db transactions
	 */
	async addAnime(anime: IAnimeInfo) {
		const aniProm = this.animeProvider.createOrUpdate({
			title: anime.title as string,
			description: anime.description,
			anime_id: anime.id
		});
		const genreProm = this.genreProvider.createOrUpdateBulk(
			anime.genres?.map((el) => ({
				genre: el
			})) ?? []
		);

		const [animes, genres] = await Promise.all([aniProm, genreProm]);
		await this.addEpisodes(anime, animes.data);

		const aniGenreProm = genres.data.map((genre) => {
			return this.animeGenreProvider.createOne({
				genre_id: genre.id!,
				anime_id: animes.data.id!
			});
		});

		await Promise.all(aniGenreProm);

		return animes;
	}

	/**
	 *
	 * @param anime
	 * @tag warning on no db transactions
	 */
	async addLog(eps_id: string, anime: IAnimeInfo) {
		let dbEps = await this.episodeProvider.findAll({ episode_id: eps_id });

		if (!dbEps.length) {
			const animeData = await this.addAnime(anime);
			if (!animeData) return;

			dbEps = await this.episodeProvider.findAll({ episode_id: eps_id });
		}

		const logData = await this.logProvider.createOne({ episode_id: dbEps[0].id });

		return { log: logData, eps: dbEps[0] };
	}

	/**
	 *
	 * @tag warning on no db transactions
	 * @param animes fetched anime data
	 * @param dbAnime saved anime data
	 */
	async addEpisodes(animes: IAnimeInfo, dbAnime: Anime) {
		if (!animes.episodes?.length || !dbAnime) return;

		const epsProm = animes.episodes.map((eps) =>
			this.episodeProvider.createOrUpdate({
				episode_id: eps.id,
				episode_number: eps.number,
				anime_id: dbAnime.id
			})
		);

		await Promise.all(epsProm);
	}
}
