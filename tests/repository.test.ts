import "dotenv/config";
import {
  AccountInfo,
  clusterApiUrl,
  Connection,
  ParsedAccountData,
  PublicKey,
} from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import Repository from "../src/lib/repository";
import { serializeBigInt } from "../src/utils";
import { Account } from "@metaplex-foundation/umi";

async function main() {
  const endpoint = clusterApiUrl("mainnet-beta");
  const umi = createUmi(endpoint);
  const connection = new Connection(endpoint);
  const repository = new Repository(connection, umi);

  // const tokenAccounts = await repository.token.getTokenAccounts(
  //   "E9Sq8hSnH4zSuScu53gykLEFCqrVU9DD1i6FjD4Et5Mf",
  // );

  // repository.raydium
  //   .fetchAllPoolInfos(tokenAccounts)
  //   .then((data) => (data ? console.log(data) : null))
  //   .catch(console.error);
  const mint = new PublicKey("ELGZATuAb4CTxMNCV45cbH13oRt5jW7Cdbi6wJAX8J3b");
  const tokenAccount = await repository.token.getAccountInfo(mint.toBase58());
  const [lpInfo] = await repository.shyft.queryLpInfo({
    lpMint: { _eq: mint.toBase58() },
  });
  console.log(JSON.stringify(tokenAccount))
  repository.raydium
    .fetchPoolInfo(lpInfo, tokenAccount![0])
    .then(console.log);
}

main().catch(console.error);
