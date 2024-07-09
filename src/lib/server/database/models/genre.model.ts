import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const genres = pgTable("genres", {
	id: serial("id").primaryKey(),
	genre: varchar("genre", { length: 64 }).unique().notNull(),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow()
});

export type Genre = typeof genres.$inferSelect;
export type GenreInsert = typeof genres.$inferInsert;
