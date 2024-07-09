import type { IDbProviderStrategy, IMutationRes } from "../interfaces/db-providers.strategy";
import DB from "../connection";
import { DrizzleError, SQL, and, eq } from "drizzle-orm";
import { users, type User, type UserInsert } from "../models/user.model";

export class UserDataProvider implements IDbProviderStrategy<User, UserInsert> {
	private readonly db = DB;

	async findOne(id: string | number): Promise<User> {
		if (typeof id !== "number") id = +id;
		if (isNaN(id)) throw new DrizzleError({ message: "invalid", cause: "id" });

		const userDatas = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
		if (!userDatas.length) throw new DrizzleError({ message: "no user found", cause: "id" });

		return userDatas[0];
	}
	findAll(where?: Partial<UserInsert>): Promise<User[]> {
		if (where) {
			const whereQuery: SQL<string | number>[] = Object.keys(where).map((key) => {
				const userCOl = users[key as keyof User];
				const userFilter = where[key as keyof User];

				return eq(userCOl, userFilter!) as SQL<string | number>;
			});

			return this.db
				.select()
				.from(users)
				.where(and(...whereQuery));
		}

		return this.db.select().from(users);
	}
	async createOne(data: UserInsert): Promise<IMutationRes<User>> {
		if (!data) {
			throw new DrizzleError({ message: "no data" });
		}

		const createdUser = await this.db.insert(users).values(data).returning();

		if (!createdUser.length) {
			throw new DrizzleError({ message: "failed to insert user", cause: data });
		}

		return { success: true, data: createdUser[0] };
	}
	async updateOne(id: string | number, data: Partial<UserInsert>): Promise<IMutationRes<User>> {
		if (!data || !id) throw new DrizzleError({ cause: "no data" });
		if (typeof id !== "number") id = +id;
		if (!isNaN(id)) throw new DrizzleError({ message: "invalid id", cause: "id" });

		const user = await this.db.select().from(users).where(eq(users.id, id)).limit(1);

		if (!user.length) {
			throw new DrizzleError({ message: `user id: ${id} is not found`, cause: "id" });
		}

		data = { ...user[0], ...data };

		const updatedUser = await this.db.update(users).set(data).where(eq(users.id, id)).returning();

		if (!updatedUser.length)
			throw new DrizzleError({ message: "failed to update user", cause: data });

		return { success: true, data: updatedUser[0] };
	}
	async deleteOne(id: string | number): Promise<IMutationRes<string | number>> {
		if (!id) throw new DrizzleError({ message: "no data" });
		if (typeof id !== "number") id = +id;
		if (isNaN(id)) throw new DrizzleError({ message: "invalid id" });

		const user = await this.db.select().from(users).where(eq(users.id, id));
		if (!user.length) throw new DrizzleError({ message: `user with id: ${id} is not found` });

		const deletedUser = await this.db.delete(users).where(eq(users.id, user[0].id)).returning();

		if (!deletedUser.length) {
			throw new DrizzleError({ message: "failed to delete user", cause: "id" });
		}

		return {
			success: true,
			data: deletedUser[0].id
		};
	}
	async createOrUpdateBulk(datas: UserInsert[]): Promise<IMutationRes<UserInsert[]>> {
		if (!datas.length) throw new DrizzleError({ message: "no data" });

		return this.db.transaction(async (tx) => {
			const datasInsert = datas.map(async (data) => {
				return (
					await tx
						.insert(users)
						.values(data)
						.onConflictDoUpdate({ target: users.id, set: data })
						.returning()
				)[0];
			});

			return { success: true, data: await Promise.all(datasInsert) };
		});
	}
}
