import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/lib/server/database/models/*.ts",
	out: "./migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.PG_URL ?? "postgresql://postgres:postgres@localhost:5432/astream"
	}
});
