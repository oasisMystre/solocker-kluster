import "dotenv/config";

import { clusterApiUrl, Connection } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import Repository from "../src/lib/repository";
import { tokenVesting } from "./tokenVesting.test";
import { tokenAccountTest } from "./tokenAccount.test";
import tokenLock from "./tokenLock.test";
import { shyftTest } from "./shyft.test";

async function main() {
  const endpoint =
    process.env.ENDPOINT!;
  const umi = createUmi(endpoint);
  const connection = new Connection(endpoint);
  const repository = new Repository(connection, umi);

  // await tokenVesting(repository);
  // await tokenAccountTest(repository);
  // await tokenLock(repository);
  await shyftTest(repository);
}

main().catch(console.error);
