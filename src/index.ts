import "dotenv/config";

import cors from "@fastify/cors";
import redis from "@fastify/redis";
import cache from "@fastify/caching";
import Fastify, { FastifyRequest } from "fastify";

/// @ts-ignore
import abstractCache from "abstract-cache";

import { Connection } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import Repository from "./lib/repository";
import { raydiumRoutes } from "./routes/raydium.route";
import { metaplexRoutes } from "./routes/metaplex.route";
import { tokenVestingRoutes } from "./routes/tokenVesting.route";

export type RequestWithRepository = {
  repository: Repository;
} & FastifyRequest;

const port: any = process.env.PORT ?? 8000;
const host: any = "RENDER" in process.env ? "0.0.0.0" : "localhost";

function createRepository() {
  const endpoint = process.env.ENDPOINT as string;
  const umi = createUmi(endpoint);
  const connection = new Connection(endpoint);
  return new Repository(connection, umi);
}

const fastify = Fastify({
  logger: true,
  ignoreTrailingSlash: true,
});

async function main() {
  const repository = createRepository();
  const abCache = abstractCache({
    useAwait: false,
    driver: {
      name: "abstract-cache-redis",
      options: { client: repository.redis.client },
    },
  });

  raydiumRoutes(fastify, repository);
  metaplexRoutes(fastify, repository);
  tokenVestingRoutes(fastify, repository);

  await fastify
    .register(cors, {
      origin: "*",
    })
    .register(redis, { client: repository.redis.client })
    .register(cache, { cache: abCache });

  await fastify.listen({ host, port });
}

main().catch((err) => {
  fastify.log.error(err);
  process.exit(0);
});
