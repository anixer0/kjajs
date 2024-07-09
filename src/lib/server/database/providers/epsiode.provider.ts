import type { IDbProviderStrategy, IMutationRes } from "../interfaces/db-providers.strategy";
import DB from "../connection";
import { DrizzleError, SQL, and, eq } from "drizzle-orm";
import { episodes, type Episode, type EpisodeInsert } from "../models/episode.model";

export class EpsDataProvider implements IDbProviderStrategy<Episode, EpisodeInsert> {
	private readonly db = DB;

	async findOne(id: string | number): Promise<Episode> {
		if (typeof id !== "number") id = +id;
		if (isNaN(id)) throw new DrizzleError({ message: "invalid", cause: "id" });

		const epsiodeDatas = await this.db.select().from(episodes).where(eq(episodes.id, id)).limit(1);
		if (!epsiodeDatas.length) throw new DrizzleError({ message: "no anime found", cause: "id" });

		return epsiodeDatas[0];
	}
	findAll(where?: Partial<EpisodeInsert>): Promise<Episode[]> {
		if (where) {
			const whereQuery: SQL<string | number>[] = Object.keys(where).map((key) => {
				const epsCol = episodes[key as keyof Episode];
				const epsFilter = where[key as keyof Episode];

				return eq(epsCol, epsFilter!) as SQL<string | number>;
			});

			return this.db
				.select()
				.from(episodes)
				.where(and(...whereQuery));
		}

		return this.db.select().from(episodes);
	}
	async createOne(data: EpisodeInsert): Promise<IMutationRes<Episode>> {
		if (!data) {
			throw new DrizzleError({ message: "no data" });
		}

		const createdEpisode = await this.db.insert(episodes).values(data).returning();

		if (!createdEpisode.length) {
			throw new DrizzleError({ message: "failed to insert episodes", cause: data });
		}

		return { success: true, data: createdEpisode[0] };
	}
	async updateOne(
		id: string | number,
		data: Partial<EpisodeInsert>
	): Promise<IMutationRes<Episode>> {
		if (!data || !id) throw new DrizzleError({ cause: "no data" });
		if (typeof id !== "number") id = +id;
		if (!isNaN(id)) throw new DrizzleError({ message: "invalid id", cause: "id" });

		const episode = await this.db.select().from(episodes).where(eq(episodes.id, id)).limit(1);

		if (!episode.length) {
			throw new DrizzleError({ message: `episode id: ${id} is not found`, cause: "id" });
		}

		data = { ...episode[0], ...data };

		const updatedEps = await this.db
			.update(episodes)
			.set(data)
			.where(eq(episodes.id, id))
			.returning();

		if (!updatedEps.length)
			throw new DrizzleError({ message: "failed to update anime", cause: data });

		return { success: true, data: updatedEps[0] };
	}
	async deleteOne(id: string | number): Promise<IMutationRes<string | number>> {
		if (!id) throw new DrizzleError({ message: "no data" });
		if (typeof id !== "number") id = +id;
		if (isNaN(id)) throw new DrizzleError({ message: "invalid id" });

		const episode = await this.db.select().from(episodes).where(eq(episodes.id, id));
		if (!episode.length) throw new DrizzleError({ message: `episode with id: ${id} is not found` });

		const deletedEps = await this.db
			.delete(episodes)
			.where(eq(episodes.id, episode[0].id))
			.returning();

		if (!deletedEps.length) {
			throw new DrizzleError({ message: "failed to delete episode", cause: "id" });
		}

		return {
			success: true,
			data: deletedEps[0].id
		};
	}
	async createOrUpdateBulk(datas: EpisodeInsert[]): Promise<IMutationRes<EpisodeInsert[]>> {
		if (!datas.length) throw new DrizzleError({ message: "no data" });

		return this.db.transaction(async (tx) => {
			const datasInsert = datas.map(async (data) => {
				return (
					await tx
						.insert(episodes)
						.values(data)
						.onConflictDoUpdate({ target: episodes.episode_id, set: data })
						.returning()
				)[0];
			});

			return { success: true, data: await Promise.all(datasInsert) };
		});
	}
	async createOrNothing(data: EpisodeInsert): Promise<IMutationRes<EpisodeInsert>> {
		const anime = await this.db
			.insert(episodes)
			.values(data)
			.onConflictDoNothing({
				target: episodes.episode_id
			})
			.returning();

		return {
			success: true,
			data: anime[0]
		};
	}
	async createOrUpdate(data: EpisodeInsert): Promise<IMutationRes<EpisodeInsert>> {
		const anime = await this.db
			.insert(episodes)
			.values(data)
			.onConflictDoUpdate({
				target: episodes.episode_id,
				set: data
			})
			.returning();

		return {
			success: true,
			data: anime[0]
		};
	}
}
