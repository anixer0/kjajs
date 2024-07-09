import { pgTable, serial, integer, index, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.model";
import { episodes } from "./episode.model";

export const logs = pgTable(
	"logs",
	{
		id: serial("id").primaryKey(),
		episode_id: integer("episode_id")
			.references(() => episodes.id, { onDelete: "cascade", onUpdate: "cascade" })
			.notNull(),
		user_id: integer("user_id").references(() => users.id, { onUpdate: "cascade" }),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow()
	},
	(logs) => ({
		ix_anime: index("ix_log_animeid").on(logs.episode_id)
	})
);

export type Log = typeof logs.$inferSelect;
export type LogInsert = typeof logs.$inferInsert;
