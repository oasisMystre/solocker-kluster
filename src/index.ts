import "dotenv/config";

import admin from "firebase-admin";

import cors from "@fastify/cors";
import Fastify, { FastifyRequest } from "fastify";

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

  raydiumRoutes(fastify, repository);
  metaplexRoutes(fastify, repository);
  tokenVestingRoutes(fastify, repository);

  await fastify.register(cors, {
    origin: "*",
  });

  await fastify.listen({ host, port });
}

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)
  ),
});

main().catch((err) => {
  fastify.log.error(err);
  process.exit(0);
});
