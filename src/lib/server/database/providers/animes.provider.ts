import type { IDbProviderStrategy, IMutationRes } from "../interfaces/db-providers.strategy";
import { animes, type Anime, type AnimeInsert } from "../models/anime.model";
import DB from "../connection";
import { DrizzleError, SQL, and, eq } from "drizzle-orm";

export class AniDataProvider implements IDbProviderStrategy<Anime, AnimeInsert> {
	private readonly db = DB;

	async findOne(id: string | number): Promise<Anime> {
		if (typeof id !== "number") id = +id;
		if (isNaN(id)) throw new DrizzleError({ message: "invalid", cause: "id" });

		const animeDatas = await this.db.select().from(animes).where(eq(animes.id, id)).limit(1);
		if (!animeDatas.length) throw new DrizzleError({ message: "no anime found", cause: "id" });

		return animeDatas[0];
	}
	findAll(where?: Partial<AnimeInsert>): Promise<Anime[]> {
		if (where) {
			const whereQuery: SQL<string | number>[] = Object.keys(where).map((key) => {
				const animeCol = animes[key as keyof Anime];
				const animeFilter = where[key as keyof Anime];

				return eq(animeCol, animeFilter!) as SQL<string | number>;
			});

			return this.db
				.select()
				.from(animes)
				.where(and(...whereQuery));
		}

		return this.db.select().from(animes);
	}
	async createOne(data: AnimeInsert): Promise<IMutationRes<Anime>> {
		if (!data) {
			throw new DrizzleError({ message: "no data" });
		}

		const createdAnime = await this.db.insert(animes).values(data).returning();

		if (!createdAnime.length) {
			throw new DrizzleError({ message: "failed to insert animes", cause: data });
		}

		return { success: true, data: createdAnime[0] };
	}
	async updateOne(id: string | number, data: Partial<AnimeInsert>): Promise<IMutationRes<Anime>> {
		if (!data || !id) throw new DrizzleError({ cause: "no data" });
		if (typeof id !== "number") id = +id;
		if (!isNaN(id)) throw new DrizzleError({ message: "invalid id", cause: "id" });

		const anime = await this.db.select().from(animes).where(eq(animes.id, id)).limit(1);

		if (!anime.length) {
			throw new DrizzleError({ message: `anime id: ${id} is not found`, cause: "id" });
		}

		data = { ...anime[0], ...data };

		const updatedAnime = await this.db
			.update(animes)
			.set(data)
			.where(eq(animes.id, id))
			.returning();

		if (!updatedAnime.length)
			throw new DrizzleError({ message: "failed to update anime", cause: data });

		return { success: true, data: updatedAnime[0] };
	}
	async deleteOne(id: string | number): Promise<IMutationRes<string | number>> {
		if (!id) throw new DrizzleError({ message: "no data" });
		if (typeof id !== "number") id = +id;
		if (isNaN(id)) throw new DrizzleError({ message: "invalid id" });

		const anime = await this.db.select().from(animes).where(eq(animes.id, id));
		if (!anime.length) throw new DrizzleError({ message: `anime with id: ${id} is not found` });

		const deletedAnime = await this.db.delete(animes).where(eq(animes.id, anime[0].id)).returning();

		if (!deletedAnime.length) {
			throw new DrizzleError({ message: "failed to delete anime", cause: "id" });
		}

		return {
			success: true,
			data: deletedAnime[0].id
		};
	}
	async createOrUpdateBulk(datas: AnimeInsert[]): Promise<IMutationRes<AnimeInsert[]>> {
		if (!datas.length) throw new DrizzleError({ message: "no data" });

		return this.db.transaction(async (tx) => {
			const datasInsert = datas.map(async (data) => {
				return (
					await tx
						.insert(animes)
						.values(data)
						.onConflictDoUpdate({ target: [animes.id, animes.anime_id], set: data })
						.returning()
				)[0];
			});

			return { success: true, data: await Promise.all(datasInsert) };
		});
	}
	async createOrNothing(data: AnimeInsert): Promise<IMutationRes<Anime>> {
		const anime = await this.db.insert(animes).values(data).onConflictDoNothing().returning();

		return {
			success: true,
			data: anime[0]
		};
	}
	async createOrUpdate(data: AnimeInsert): Promise<IMutationRes<Anime>> {
		const anime = await this.db
			.insert(animes)
			.values(data)
			.onConflictDoUpdate({
				set: data,
				target: animes.anime_id
			})
			.returning();

		return {
			success: true,
			data: anime[0]
		};
	}
}
