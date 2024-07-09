import { migrate } from "drizzle-orm/postgres-js/migrator";
import DB, { pgClient } from "./connection";

async function initMigrate() {
	const migrationsFolder = __dirname + "/../../../../migrations";
	await migrate(DB, { migrationsFolder });
	console.log("migrate succeed");
	await pgClient.end();
}

initMigrate();
