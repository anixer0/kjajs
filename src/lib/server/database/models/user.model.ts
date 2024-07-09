import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable(
	"users",
	{
		id: serial("id").primaryKey(),
		username: varchar("username", { length: 256 }).notNull(),
		password: varchar("password", { length: 4098 }).notNull(),
		email: varchar("email", { length: 256 }).notNull(),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow()
	}
	// (users) => ({ ix_email_username: index("ix_email_username").on(users.email, users.username) })
);

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
