import { load } from "cheerio";
import {
	ANIME,
	MediaFormat,
	MediaStatus,
	StreamingServers,
	SubOrSub,
	type IAnimeInfo,
	type IAnimeResult,
	type IEpisodeServer,
	type ISearch,
	type ISource
} from "@consumet/extensions";
import { GogoCDN, StreamSB } from "@consumet/extensions/dist/extractors";
import { USER_AGENT } from "@consumet/extensions/dist/utils";
import type { IError } from "../../interfaces/error.interface";
import type { CheerioAPI } from "cheerio";
// import { animeExtractor } from "../../utils/anime-id.extractor";

export class ConsumetGogo extends ANIME.Gogoanime {
	constructor() {
		super();
	}

	protected override baseUrl = "https://gogoanime3.co" as const;
	override readonly name = "Gogoanime";
	protected override logo =
		"https://play-lh.googleusercontent.com/MaGEiAEhNHAJXcXKzqTNgxqRmhuKB1rCUgb15UrN_mWUNRnLpO5T1qja64oRasO7mn0";
	protected override classPath = "ANIME.Gogoanime";

	/**
	 *
	 * @param query search query string
	 * @param page page number (default 1) (optional)
	 */
	override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
		const searchResult: ISearch<IAnimeResult> = {
			currentPage: page,
			hasNextPage: false,
			results: []
		};
		try {
			const res = await this.client.get(
				`${this.baseUrl}/filter.html?keyword=${encodeURIComponent(query)}&page=${page}`
			);

			const $ = load(res.data);

			searchResult.hasNextPage =
				$("div.anime_name.new_series > div > div > ul > li.selected").next().length > 0;

			$("div.last_episodes > ul > li").each((i, el) => {
				searchResult.results.push({
					// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
					id: $(el)?.find("p.name > a")?.attr("href")?.split("/")[2]!,
					title: $(el).find("p.name > a").attr("title")!,
					url: `${this.baseUrl}/${$(el).find("p.name > a").attr("href")}`,
					image: $(el).find("div > a > img").attr("src"),
					releaseDate: $(el).find("p.released").text().trim(),
					subOrDub: $(el).find("p.name > a").text().toLowerCase().includes("dub")
						? SubOrSub.DUB
						: SubOrSub.SUB
				});
			});

			return searchResult;
		} catch (err) {
			throw new Error((err as Error).message);
		}
	};

	/**
	 *
	 * @param id anime id
	 */
	override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
		if (!id.includes("gogoanime")) id = `${this.baseUrl}/category/${id}`;

		const animeInfo: IAnimeInfo = {
			id: "",
			title: "",
			url: "",
			genres: [],
			totalEpisodes: 0
		};
		try {
			const res = await this.client.get(id);

			const $ = load(res.data);

			animeInfo.id = new URL(id).pathname.split("/")[2];
			animeInfo.title = $(
				"section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > h1"
			)
				.text()
				.trim();
			animeInfo.url = id;
			animeInfo.image = $("div.anime_info_body_bg > img").attr("src");
			animeInfo.releaseDate = $("div.anime_info_body_bg > p:nth-child(8)")
				.text()
				.trim()
				.split("Released: ")[1];
			animeInfo.description = $("div.anime_info_body_bg > div:nth-child(6)")
				.text()
				.trim()
				.replace("Plot Summary: ", "");

			animeInfo.subOrDub = animeInfo.title.toLowerCase().includes("dub")
				? SubOrSub.DUB
				: SubOrSub.SUB;

			animeInfo.type = $("div.anime_info_body_bg > p:nth-child(4) > a")
				.text()
				.trim()
				.toUpperCase() as MediaFormat;

			animeInfo.status = MediaStatus.UNKNOWN;

			switch ($("div.anime_info_body_bg > p:nth-child(9) > a").text().trim()) {
				case "Ongoing":
					animeInfo.status = MediaStatus.ONGOING;
					break;
				case "Completed":
					animeInfo.status = MediaStatus.COMPLETED;
					break;
				case "Upcoming":
					animeInfo.status = MediaStatus.NOT_YET_AIRED;
					break;
				default:
					animeInfo.status = MediaStatus.UNKNOWN;
					break;
			}
			animeInfo.otherName = $("div.anime_info_body_bg > p:nth-child(10)")
				.text()
				.replace("Other name: ", "")
				.replace(/;/g, ",");

			$("div.anime_info_body_bg > p:nth-child(7) > a").each((i, el) => {
				animeInfo.genres?.push($(el).attr("title")!.toString());
			});

			const ep_start = $("#episode_page > li").first().find("a").attr("ep_start");
			const ep_end = $("#episode_page > li").last().find("a").attr("ep_end");
			const movie_id = $("#movie_id").attr("value");
			const alias = $("#alias_anime").attr("value");

			const html = await this.client.get(
				`${"https://ajax.gogocdn.net/ajax"}/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`
			);
			const $$ = load(html.data);

			animeInfo.episodes = [];
			$$("#episode_related > li").each((i, el) => {
				if (el) {
					animeInfo.episodes?.push({
						id: $(el).find("a").attr("href")?.split("/")[1] ?? "",
						number: parseFloat($(el).find(`div.name`).text().replace("EP ", "")),
						url: `${this.baseUrl}/${$(el).find(`a`).attr("href")?.trim()}`
					});
				}
			});
			animeInfo.episodes = animeInfo.episodes.reverse();

			animeInfo.totalEpisodes = parseInt(ep_end ?? "0");

			return animeInfo;
		} catch (err) {
			throw new Error(`failed to fetch anime info: ${err}`);
		}
	};

	/**
	 *
	 * @param episodeId episode id
	 * @param server server type (default 'GogoCDN') (optional)
	 */
	override fetchEpisodeSources = async (
		episodeId: string,
		server: StreamingServers = StreamingServers.VidStreaming
	): Promise<ISource> => {
		try {
			const servers = await this.fetchEpisodeServers(episodeId);

			episodeId =
				servers.find((el) => {
					const name = el.name.toLowerCase().replace(" ", "");

					return name === server;
				})?.url ?? "";

			if (!episodeId) throw new Error("Server URL not found");

			const serverUrl = new URL(episodeId);
			switch (server) {
				case StreamingServers.GogoCDN:
					return {
						headers: { Referer: serverUrl.href },
						sources: await new GogoCDN(this.proxyConfig, this.adapter).extract(serverUrl),
						download: `https://gogohd.net/download${serverUrl.search}`
					};
				case StreamingServers.StreamSB:
					return {
						headers: {
							Referer: serverUrl.href,
							watchsb: "streamsb",
							"User-Agent": USER_AGENT
						},
						sources: await new StreamSB(this.proxyConfig, this.adapter).extract(serverUrl),
						download: `https://gogohd.net/download${serverUrl.search}`
					};
				default:
					return {
						headers: { Referer: serverUrl.href },
						sources: await new GogoCDN(this.proxyConfig, this.adapter).extract(serverUrl),
						download: `https://gogohd.net/download${serverUrl.search}`
					};
			}
		} catch (err) {
			throw new Error("Episode not found.");
		}
	};

	/**
	 *
	 * @param episodeId episode link or episode id
	 */
	override fetchEpisodeServers = async (episodeId: string): Promise<IEpisodeServer[]> => {
		try {
			if (!episodeId.startsWith(this.baseUrl)) episodeId = `${this.baseUrl}/${episodeId}`;

			const res = await this.client.get(episodeId);

			const $ = load(res.data);

			const servers: IEpisodeServer[] = [];

			$("div.anime_video_body > div.anime_muti_link > ul > li").each((i, el) => {
				let url = $(el).find("a").attr("data-video");
				if (!url?.startsWith("http")) url = `https:${url}`;

				servers.push({
					name: $(el).find("a").text().replace("Choose this server", "").trim(),
					url: url
				});
			});

			if (!servers.length) {
				servers.push(this.getDefault($));
			}

			return servers;
		} catch (err) {
			throw new Error("Episode not found.");
		}
	};

	/**
	 *
	 * @param data fetched cheerio API
	 * @returns default episode server with name as vidstreaming
	 */
	getDefault(data: CheerioAPI): IEpisodeServer {
		const url = data("#playerframe").attr("src");
		if (!url) throw new Error("Episode not found.");

		return { name: StreamingServers.VidStreaming, url };
	}

	/**
	 *
	 * @param episodeId episode link or episode id
	 */
	fetchAnimeIdFromEpisodeId = async (episodeId: string): Promise<string> => {
		try {
			if (!episodeId.startsWith(this.baseUrl)) episodeId = `${this.baseUrl}/${episodeId}`;

			const res = await this.client.get(episodeId);

			const $ = load(res.data);

			return (
				$(
					"#wrapper_bg > section > section.content_left > div:nth-child(1) > div.anime_video_body > div.anime_video_body_cate > div.anime-info > a"
				).attr("href") as string
			).split("/")[2];
		} catch (err) {
			throw new Error("Episode not found.");
		}
	};
	/**
	 * @param page page number (optional)
	 * @param type type of media. (optional) (default `1`) `1`: Japanese with subtitles, `2`: english/dub with no subtitles, `3`: chinese with english subtitles
	 */
	fetchRecentEpisodes = async (
		page: number = 1,
		type: number = 1
	): Promise<ISearch<IAnimeResult>> => {
		try {
			const res = await this.client.get(
				`${"https://ajax.gogocdn.net/ajax"}/page-recent-release.html?page=${page}&type=${type}`
			);

			const $ = load(res.data);

			const recentEpisodes: IAnimeResult[] = [];

			$("div.last_episodes.loaddub > ul > li").each((i, el): void => {
				if (el) {
					const id = $(el).find("a").attr("href")?.split("/")[1].split("-episode")[0] ?? "";
					const episodeId = $(el).find("a").attr("href")?.split("/")[1] ?? "";
					const episodeNumber = parseFloat($(el).find("p.episode").text().replace("Episode ", ""));
					const title = $(el).find("p.name > a").attr("title")!;
					const image = $(el).find("div > a > img").attr("src");
					const url = `${this.baseUrl}/${$(el).find("a").attr("href")?.trim()}`;

					const data = {
						id,
						episodeId,
						episodeNumber,
						title,
						image,
						url
					};

					recentEpisodes.push(data);
				}
			});

			const hasNextPage = !$("div.anime_name_pagination.intro > div > ul > li")
				.last()
				.hasClass("selected");

			return {
				currentPage: page,
				hasNextPage: hasNextPage,
				results: recentEpisodes
			};
		} catch (err) {
			throw new Error((err as IError)?.message ?? "Something went wrong. Please try again later.");
		}
	};

	fetchGenreInfo = async (genre: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
		try {
			const res = await this.client.get(`${this.baseUrl}/genre/${genre}?page=${page}`);

			const $ = load(res.data);

			const genreInfo: IAnimeResult[] = [];

			$("div.last_episodes > ul > li").each((i, elem) => {
				genreInfo.push({
					id: $(elem).find("p.name > a").attr("href")?.split("/")[2] as string,
					title: $(elem).find("p.name > a").attr("title") as string,
					image: $(elem).find("div > a > img").attr("src"),
					released: $(elem).find("p.released").text().replace("Released: ", "").trim(),
					url: this.baseUrl + "/" + $(elem).find("p.name > a").attr("href")
				});
			});

			const paginatorDom = $("div.anime_name_pagination > div > ul > li");
			const hasNextPage = paginatorDom.length > 0 && !paginatorDom.last().hasClass("selected");
			return {
				currentPage: page,
				hasNextPage: hasNextPage,
				results: genreInfo
			};
		} catch (err) {
			throw new Error((err as IError)?.message ?? "Something went wrong. Please try again later.");
		}
	};

	fetchTopAiring = async (page: number = 1): Promise<ISearch<IAnimeResult>> => {
		try {
			const res = await this.client.get(
				`${"https://ajax.gogocdn.net/ajax"}/page-recent-release-ongoing.html?page=${page}`
			);

			const $ = load(res.data);

			const topAiring: IAnimeResult[] = [];

			$("div.added_series_body.popular > ul > li").each((i, el) => {
				if (el) {
					topAiring.push({
						id: $(el).find("a:nth-child(1)").attr("href")?.split("/")[2] ?? "",
						title: $(el).find("a:nth-child(1)").attr("title")!,
						image: $(el)
							.find("a:nth-child(1) > div")
							.attr("style")
							?.match("(https?://.*.(?:png|jpg))")![0],
						url: `${this.baseUrl}${$(el).find("a:nth-child(1)").attr("href")}`,
						genres: $(el)
							.find("p.genres > a")
							.map((i, el) => $(el).attr("title"))
							.get()
					});
				}
			});

			const hasNextPage = !$("div.anime_name.comedy > div > div > ul > li")
				.last()
				.hasClass("selected");

			return {
				currentPage: page,
				hasNextPage: hasNextPage,
				results: topAiring
			};
		} catch (err) {
			throw new Error((err as IError)?.message ?? "Something went wrong. Please try again later.");
		}
	};

	fetchRecentMovies = async (page: number = 1): Promise<ISearch<IAnimeResult>> => {
		try {
			const res = await this.client.get(`${this.baseUrl}/anime-movies.html?aph&page=${page}`);

			const $ = load(res.data);

			const recentMovies: IAnimeResult[] = [];

			$("div.last_episodes > ul > li").each((i, el) => {
				const a = $(el).find("p.name > a");
				const pRelease = $(el).find("p.released");
				const pName = $(el).find("p.name > a");

				recentMovies.push({
					id: a.attr("href")?.replace(`/category/`, "") ?? "",
					title: pName.attr("title")!,
					releaseDate: pRelease.text().replace("Released: ", "").trim(),
					image: $(el).find("div > a > img").attr("src"),
					url: `${this.baseUrl}${a.attr("href")}`
				});
			});

			const hasNextPage = !$("div.anime_name.anime_movies > div > div > ul > li")
				.last()
				.hasClass("selected");

			return {
				currentPage: page,
				hasNextPage: hasNextPage,
				results: recentMovies
			};
		} catch (err) {
			throw new Error((err as IError)?.message ?? "Something went wrong. Please try again later.");
		}
	};

	fetchPopular = async (page: number = 1): Promise<ISearch<IAnimeResult>> => {
		try {
			const res = await this.client.get(`${this.baseUrl}/popular.html?page=${page}`);

			const $ = load(res.data);

			const recentMovies: IAnimeResult[] = [];

			$("div.last_episodes > ul > li").each((i, el) => {
				const a = $(el).find("p.name > a");
				const pRelease = $(el).find("p.released");
				const pName = $(el).find("p.name > a");

				recentMovies.push({
					id: a.attr("href")?.replace(`/category/`, "") ?? "",
					title: pName.attr("title")!,
					releaseDate: pRelease.text().replace("Released: ", "").trim(),
					image: $(el).find("div > a > img").attr("src"),
					url: `${this.baseUrl}${a.attr("href")}`
				});
			});

			const hasNextPage = !$("div.anime_name.anime_movies > div > div > ul > li")
				.last()
				.hasClass("selected");

			return {
				currentPage: page,
				hasNextPage: hasNextPage,
				results: recentMovies
			};
		} catch (err) {
			throw new Error((err as IError)?.message ?? "Something went wrong. Please try again later.");
		}
	};

	fetchGenreList = async (): Promise<{ id: string | undefined; title: string | undefined }[]> => {
		const genres: { id: string | undefined; title: string | undefined }[] = [];
		let res = null;
		try {
			res = await this.client.get(`${this.baseUrl}/home.html`);
		} catch (err) {
			try {
				res = await this.client.get(`${this.baseUrl}/`);
			} catch (error) {
				throw new Error(
					(err as IError)?.message ?? "Something went wrong. Please try again later."
				);
			}
		}
		try {
			const $ = load(res.data);
			$("nav.menu_series.genre.right > ul > li").each((_index, element) => {
				const genre = $(element).find("a");
				genres.push(
					{
						id: genre.attr("href")?.replace("/genre/", ""),
						title: genre.attr("title")
					}!
				);
			});
			return genres;
		} catch (err) {
			throw new Error((err as IError)?.message ?? "Something went wrong. Please try again later.");
		}
	};

	fetchAnimeList = async (page: number = 1): Promise<ISearch<IAnimeResult>> => {
		const animeList: IAnimeResult[] = [];
		let res = null;
		try {
			res = await this.client.get(`${this.baseUrl}/anime-list.html?page=${page}`);
			const $ = load(res.data);
			$(".anime_list_body .listing li").each((_index, element) => {
				const genres: string[] = [];
				const entryBody = $("p.type", $(element).attr("title")!);
				const genresEl = entryBody.first();
				genresEl.find("a").each((_idx, genreAnchor) => {
					genres.push($(genreAnchor).attr("title")!);
				});

				const releaseDate = $(entryBody.get(1)).text();

				const img = $("div", $(element).attr("title")!);
				const a = $(element).find("a");
				animeList.push({
					id: a.attr("href")?.replace(`/category/`, "") ?? "",
					title: a.text(),
					image: $(img).find("img").attr("src"),
					url: `${this.baseUrl}${a.attr("href")}`,
					genres,
					releaseDate
				});
			});
			const hasNextPage = !$("div.anime_name.anime_list > div > div > ul > li")
				.last()
				.hasClass("selected");
			return {
				currentPage: page,
				hasNextPage: hasNextPage,
				results: animeList
			};
		} catch (err) {
			throw new Error((err as IError)?.message ?? "Something went wrong. Please try again later.");
		}
	};
}
