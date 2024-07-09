import type { IDbProviderStrategy, IMutationRes } from "../interfaces/db-providers.strategy";
import DB from "../connection";
import { DrizzleError, SQL, and, eq } from "drizzle-orm";
import { logs, type Log, type LogInsert } from "../models/logs.model";

export class LogDataProvider implements IDbProviderStrategy<Log, LogInsert> {
	private readonly db = DB;

	async findOne(id: string | number): Promise<Log> {
		if (typeof id !== "number") id = +id;
		if (isNaN(id)) throw new DrizzleError({ message: "invalid", cause: "id" });

		const logDatas = await this.db.select().from(logs).where(eq(logs.id, id)).limit(1);
		if (!logDatas.length) throw new DrizzleError({ message: "no log found", cause: "id" });

		return logDatas[0];
	}
	findAll(where?: Partial<LogInsert>): Promise<Log[]> {
		if (where) {
			const whereQuery: SQL<string | number>[] = Object.keys(where).map((key) => {
				const logsCol = logs[key as keyof Log];
				const logsFilter = where[key as keyof Log];

				return eq(logsCol, logsFilter!) as SQL<string | number>;
			});

			return this.db
				.select()
				.from(logs)
				.where(and(...whereQuery));
		}

		return this.db.select().from(logs);
	}
	async createOne(data: LogInsert): Promise<IMutationRes<Log>> {
		if (!data) {
			throw new DrizzleError({ message: "no data" });
		}

		const createdLog = await this.db.insert(logs).values(data).returning();

		if (!createdLog.length) {
			throw new DrizzleError({ message: "failed to insert logs", cause: data });
		}

		return { success: true, data: createdLog[0] };
	}
	async updateOne(id: string | number, data: Partial<LogInsert>): Promise<IMutationRes<Log>> {
		if (!data || !id) throw new DrizzleError({ cause: "no data" });
		if (typeof id !== "number") id = +id;
		if (!isNaN(id)) throw new DrizzleError({ message: "invalid id", cause: "id" });

		const log = await this.db.select().from(logs).where(eq(logs.id, id)).limit(1);

		if (!log.length) {
			throw new DrizzleError({ message: `log id: ${id} is not found`, cause: "id" });
		}

		data = { ...log[0], ...data };

		const updatedLog = await this.db.update(logs).set(data).where(eq(logs.id, id)).returning();

		if (!updatedLog.length)
			throw new DrizzleError({ message: "failed to update log", cause: data });

		return { success: true, data: updatedLog[0] };
	}
	async deleteOne(id: string | number): Promise<IMutationRes<string | number>> {
		if (!id) throw new DrizzleError({ message: "no data" });
		if (typeof id !== "number") id = +id;
		if (isNaN(id)) throw new DrizzleError({ message: "invalid id" });

		const log = await this.db.select().from(logs).where(eq(logs.id, id));
		if (!log.length) throw new DrizzleError({ message: `log with id: ${id} is not found` });

		const deletedLog = await this.db.delete(logs).where(eq(logs.id, log[0].id)).returning();

		if (!deletedLog.length) {
			throw new DrizzleError({ message: "failed to delete log", cause: "id" });
		}

		return {
			success: true,
			data: deletedLog[0].id
		};
	}
	async createOrUpdateBulk(datas: LogInsert[]): Promise<IMutationRes<LogInsert[]>> {
		if (!datas.length) throw new DrizzleError({ message: "no data" });

		return this.db.transaction(async (tx) => {
			const datasInsert = datas.map(async (data) => {
				return (
					await tx
						.insert(logs)
						.values(data)
						.onConflictDoUpdate({ target: logs.id, set: data })
						.returning()
				)[0];
			});

			return { success: true, data: await Promise.all(datasInsert) };
		});
	}
}
