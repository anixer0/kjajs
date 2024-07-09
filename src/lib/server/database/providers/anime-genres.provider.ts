import type { IDbProviderStrategy, IMutationRes } from "../interfaces/db-providers.strategy";
import DB from "../connection";
import { DrizzleError, SQL, and, eq } from "drizzle-orm";
import { anime_genres, type AnimeGenre, type AnimeGenreInsert } from "../models/anime-genre.model";

export class AniGenreDataProvider implements IDbProviderStrategy<AnimeGenre, AnimeGenreInsert> {
	private readonly db = DB;

	async findOne(id: string | number): Promise<AnimeGenre> {
		if (typeof id !== "number") id = +id;
		if (isNaN(id)) throw new DrizzleError({ message: "invalid id", cause: "id" });

		const animeDatas = await this.db
			.select()
			.from(anime_genres)
			.where(eq(anime_genres.id, id))
			.limit(1);
		if (!animeDatas.length)
			throw new DrizzleError({ message: "no anime_genres found", cause: "id" });

		return animeDatas[0];
	}
	findAll(where?: Partial<AnimeGenreInsert>): Promise<AnimeGenre[]> {
		if (where) {
			const whereQuery: SQL<string | number>[] = Object.keys(where).map((key) => {
				const aniGenCol = anime_genres[key as keyof AnimeGenre];
				const aniGenFilter = where[key as keyof AnimeGenre];

				return eq(aniGenCol, aniGenFilter!) as SQL<string | number>;
			});

			return this.db
				.select()
				.from(anime_genres)
				.where(and(...whereQuery));
		}

		return this.db.select().from(anime_genres);
	}
	async createOne(data: AnimeGenreInsert): Promise<IMutationRes<AnimeGenre>> {
		if (!data) {
			throw new DrizzleError({ message: "no data" });
		}

		const createdAnimeGenre = await this.db.insert(anime_genres).values(data).returning();

		if (!createdAnimeGenre.length) {
			throw new DrizzleError({ message: "failed to insert anime_genres", cause: data });
		}

		return { success: true, data: createdAnimeGenre[0] };
	}
	async updateOne(
		id: string | number,
		data: Partial<AnimeGenreInsert>
	): Promise<IMutationRes<AnimeGenre>> {
		if (!data || !id) throw new DrizzleError({ cause: "no data" });
		if (typeof id !== "number") id = +id;
		if (!isNaN(id)) throw new DrizzleError({ message: "invalid id", cause: "id" });

		const anime_genre = await this.db
			.select()
			.from(anime_genres)
			.where(eq(anime_genres.id, id))
			.limit(1);

		if (!anime_genre.length) {
			throw new DrizzleError({ message: `anime_genre id: ${id} is not found`, cause: "id" });
		}

		data = { ...anime_genre[0], ...data };

		const updatedAnimeGenre = await this.db
			.update(anime_genres)
			.set(data)
			.where(eq(anime_genres.id, id))
			.returning();

		if (!updatedAnimeGenre.length)
			throw new DrizzleError({ message: "failed to update anime_genre", cause: data });

		return { success: true, data: updatedAnimeGenre[0] };
	}
	async deleteOne(id: string | number): Promise<IMutationRes<string | number>> {
		if (!id) throw new DrizzleError({ message: "no data" });
		if (typeof id !== "number") id = +id;
		if (isNaN(id)) throw new DrizzleError({ message: "invalid id" });

		const anime_genre = await this.db.select().from(anime_genres).where(eq(anime_genres.id, id));
		if (!anime_genre.length)
			throw new DrizzleError({ message: `anime_genre with id: ${id} is not found` });

		const deletedAnimeGenre = await this.db
			.delete(anime_genres)
			.where(eq(anime_genres.id, anime_genre[0].id))
			.returning();

		if (!deletedAnimeGenre.length) {
			throw new DrizzleError({ message: "failed to delete anime_genre", cause: "id" });
		}

		return {
			success: true,
			data: deletedAnimeGenre[0].id
		};
	}
	async createOrUpdateBulk(datas: AnimeGenreInsert[]): Promise<IMutationRes<AnimeGenreInsert[]>> {
		if (!datas.length) throw new DrizzleError({ message: "no data" });

		return this.db.transaction(async (tx) => {
			const datasInsert = datas.map(async (data) => {
				return (
					await tx
						.insert(anime_genres)
						.values(data)
						.onConflictDoUpdate({ target: anime_genres.id, set: data })
						.returning()
				)[0];
			});

			return { success: true, data: await Promise.all(datasInsert) };
		});
	}
}
