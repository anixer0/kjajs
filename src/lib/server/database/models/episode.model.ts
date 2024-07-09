import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { animes } from "./anime.model";

export const episodes = pgTable(
	"episodes",
	{
		id: serial("id").primaryKey(),
		episode_id: varchar("episode_id", { length: 256 }).unique().notNull(),
		anime_id: integer("anime_id")
			.references(() => animes.id)
			.notNull(),
		episode_number: integer("episode_num").notNull(),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow()
	}
	// (episodes) => ({
	// 	ix_episode_id: index("ix_anime_episodeid").on(episodes.anime_id, episodes.episode_number)
	// })
);

export type Episode = typeof episodes.$inferSelect;
export type EpisodeInsert = typeof episodes.$inferInsert;
