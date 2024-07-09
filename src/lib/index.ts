// place files you want to import through the `$lib` alias in this folder.
import { AnimeProvider } from "./server/anime.provider";
import { ConsumetGogo } from "./server/consumet.gogo";
import type { IProviderStrategy } from "./interfaces/provider.strategy";
import { RedisCache } from "./server/cache/redis.instance";
import { DbService } from "./server/database/db.service";

export const Provider: IProviderStrategy = Object.freeze(
	new AnimeProvider(new ConsumetGogo(), new RedisCache())
);
export const DbProvider = Object.freeze(new DbService());
