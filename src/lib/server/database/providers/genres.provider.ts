import type { IDbProviderStrategy, IMutationRes } from "../interfaces/db-providers.strategy";
import DB from "../connection";
import { DrizzleError, SQL, and, eq } from "drizzle-orm";
import { genres, type Genre, type GenreInsert } from "../models/genre.model";

export class GenreDataProvider implements IDbProviderStrategy<Genre, GenreInsert> {
	private readonly db = DB;

	async findOne(id: string | number): Promise<Genre> {
		if (typeof id !== "number") id = +id;
		if (isNaN(id)) throw new DrizzleError({ message: "invalid", cause: "id" });

		const genreDatas = await this.db.select().from(genres).where(eq(genres.id, id)).limit(1);
		if (!genreDatas.length) throw new DrizzleError({ message: "no genre found", cause: "id" });

		return genreDatas[0];
	}
	findAll(where?: Partial<GenreInsert>): Promise<Genre[]> {
		if (where) {
			const whereQuery: SQL<string | number>[] = Object.keys(where).map((key) => {
				const genreCol = genres[key as keyof Genre];
				const genreFilter = where[key as keyof Genre];

				return eq(genreCol, genreFilter!) as SQL<string | number>;
			});

			return this.db
				.select()
				.from(genres)
				.where(and(...whereQuery));
		}

		return this.db.select().from(genres);
	}
	async createOne(data: GenreInsert): Promise<IMutationRes<Genre>> {
		if (!data) {
			throw new DrizzleError({ message: "no data" });
		}

		const createdGenre = await this.db.insert(genres).values(data).returning();

		if (!createdGenre.length) {
			throw new DrizzleError({ message: "failed to insert genres", cause: data });
		}

		return { success: true, data: createdGenre[0] };
	}
	async updateOne(id: string | number, data: Partial<GenreInsert>): Promise<IMutationRes<Genre>> {
		if (!data || !id) throw new DrizzleError({ cause: "no data" });
		if (typeof id !== "number") id = +id;
		if (!isNaN(id)) throw new DrizzleError({ message: "invalid id", cause: "id" });

		const genre = await this.db.select().from(genres).where(eq(genres.id, id)).limit(1);

		if (!genre.length) {
			throw new DrizzleError({ message: `genre id: ${id} is not found`, cause: "id" });
		}

		data = { ...genre[0], ...data };

		const updatedGenre = await this.db
			.update(genres)
			.set(data)
			.where(eq(genres.id, id))
			.returning();

		if (!updatedGenre.length)
			throw new DrizzleError({ message: "failed to update genre", cause: data });

		return { success: true, data: updatedGenre[0] };
	}
	async deleteOne(id: string | number): Promise<IMutationRes<string | number>> {
		if (!id) throw new DrizzleError({ message: "no data" });
		if (typeof id !== "number") id = +id;
		if (isNaN(id)) throw new DrizzleError({ message: "invalid id" });

		const genre = await this.db.select().from(genres).where(eq(genres.id, id));
		if (!genre.length) throw new DrizzleError({ message: `genre with id: ${id} is not found` });

		const deletedGenre = await this.db.delete(genres).where(eq(genres.id, genre[0].id)).returning();

		if (!deletedGenre.length) {
			throw new DrizzleError({ message: "failed to delete genre", cause: "id" });
		}

		return {
			success: true,
			data: deletedGenre[0].id
		};
	}
	async createOrUpdateBulk(datas: GenreInsert[]): Promise<IMutationRes<GenreInsert[]>> {
		if (!datas.length) throw new DrizzleError({ message: "no data" });

		return this.db.transaction(async (tx) => {
			const datasInsert = datas.map(async (data) => {
				return (
					await tx
						.insert(genres)
						.values(data)
						.onConflictDoUpdate({ target: genres.genre, set: data })
						.returning()
				)[0];
			});

			return { success: true, data: await Promise.all(datasInsert) };
		});
	}
	async createOrNothingBulk(datas: GenreInsert[]): Promise<IMutationRes<GenreInsert[]>> {
		if (!datas.length) throw new DrizzleError({ message: "no data" });

		return this.db.transaction(async (tx) => {
			const datasInsert = datas.map(async (data) => {
				return (await tx.insert(genres).values(data).onConflictDoNothing().returning())[0];
			});

			return { success: true, data: await Promise.all(datasInsert) };
		});
	}
}
