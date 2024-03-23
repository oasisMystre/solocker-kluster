import "dotenv/config";
import admin from "firebase-admin";

import { clusterApiUrl, Connection } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import Repository from "../src/lib/repository";
import { tokenVesting } from "./tokenVesting.test";

admin.initializeApp({
  credential: admin.credential.cert(require("../serviceAccount.json")),
});

async function main() {
  const endpoint = clusterApiUrl("mainnet-beta");
  const umi = createUmi(endpoint);
  const connection = new Connection(endpoint);
  const repository = new Repository(connection, umi);

  await tokenVesting(repository);
}

main().catch(console.error);
