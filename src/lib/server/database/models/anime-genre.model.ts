import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { genres } from "./genre.model";
import { animes } from "./anime.model";

export const anime_genres = pgTable("anime_genres", {
	id: serial("id").primaryKey(),
	genre_id: integer("genre_id")
		.references(() => genres.id, { onUpdate: "cascade" })
		.notNull(),
	anime_id: integer("anime_id")
		.references(() => animes.id, { onUpdate: "cascade" })
		.notNull(),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow()
});

export type AnimeGenre = typeof anime_genres.$inferSelect;
export type AnimeGenreInsert = typeof anime_genres.$inferInsert;
