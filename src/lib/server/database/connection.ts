import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { animes } from "./models/anime.model";
import { users } from "./models/user.model";
import { genres } from "./models/genre.model";
import { logs } from "./models/logs.model";

export const pgClient = postgres(
	process.env.NODE_ENV === "production"
		? process.env.PG_URL!
		: "postgresql://postgres:postgres@localhost:5432/astream",
	{ max: 20 }
);

const DB = drizzle(pgClient, {
	schema: {
		animes,
		users,
		genres,
		logs
	},
	logger: true
});

export default DB;
