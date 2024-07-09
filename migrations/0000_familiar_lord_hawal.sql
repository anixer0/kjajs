CREATE TABLE IF NOT EXISTS "anime_genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"genre_id" integer NOT NULL,
	"anime_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "animes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(256) NOT NULL,
	"anime_id" varchar(256) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "animes_anime_id_unique" UNIQUE("anime_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_id" varchar(256) NOT NULL,
	"anime_id" integer NOT NULL,
	"episode_num" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "episodes_episode_id_unique" UNIQUE("episode_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"genre" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "genres_genre_unique" UNIQUE("genre")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_id" integer NOT NULL,
	"user_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(256) NOT NULL,
	"password" varchar(4098) NOT NULL,
	"email" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anime_genres" ADD CONSTRAINT "anime_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anime_genres" ADD CONSTRAINT "anime_genres_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "episodes" ADD CONSTRAINT "episodes_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs" ADD CONSTRAINT "logs_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs" ADD CONSTRAINT "logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_log_animeid" ON "logs" USING btree ("episode_id");