import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const animes = pgTable(
	"animes",
	{
		id: serial("id").primaryKey(),
		title: varchar("title", { length: 256 }).notNull(),
		anime_id: varchar("anime_id", { length: 256 }).unique().notNull(),
		description: text("description"),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow()
	}
	// (animes) => ({
	// 	ix_anime_id_unique: unique("ix_unique_animeid").on(animes.anime_id),
	// 	ix_animeid_title: index("ix_animeid_title").on(animes.anime_id, animes.title)
	// })
);

export type Anime = typeof animes.$inferSelect;
export type AnimeInsert = typeof animes.$inferInsert;
