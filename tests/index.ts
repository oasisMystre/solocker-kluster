import "dotenv/config";
import admin from "firebase-admin";

import { clusterApiUrl, Connection } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import Repository from "../src/lib/repository";
import { tokenVesting } from "./tokenVesting.test";
import { tokenAccountTest } from "./tokenAccount.test";

admin.initializeApp({
  credential: admin.credential.cert(require("../serviceAccount.json")),
});

async function main() {
  const endpoint =
    "https://mainnet.helius-rpc.com/?api-key=7aa42f94-9e2f-4963-bd0a-1b4bb01c9985";
  const umi = createUmi(endpoint);
  const connection = new Connection(endpoint);
  const repository = new Repository(connection, umi);

  // await tokenVesting(repository);
  await tokenAccountTest(repository);
}

main().catch(console.error);
