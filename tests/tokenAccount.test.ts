import "dotenv/config";

import Repository from "../src/lib/repository";
import { PublicKey } from "@solana/web3.js";
import { catchAndReturnNull, serializeBigInt } from "../src/utils";

export async function tokenAccountTest(repository: Repository) {
  const tokenAccounts = await repository.token.getNormalTokenAccounts(
    "E9Sq8hSnH4zSuScu53gykLEFCqrVU9DD1i6FjD4Et5Mf"
  );

  const mints = tokenAccounts.map((tokenAccount) =>
    tokenAccount.account.data.parsed.info.mint.toString()
  );

  // const digitalAssets = await Promise.all(
  //   mints.map(async (mint) => {
  //     const metadata = await catchAndReturnNull(
  //       repository.metaplex.fetchMetadata(mint)
  //     );
  //     return metadata ? metadata : {};
  //   })
  // );

  // digitalAssets = digitalAssets.reverse()

  // const digitalAssets = await repository.metaplex.fetchMetadata("6eAsVEvmi63yMceG6rbFXtLrNoMUTAXzc9LsFb2zsp7P");
  // console.log(digitalAssets)
  // const info = await repository.connection.getParsedAccountInfo(
  //   new PublicKey("ELGZATuAb4CTxMNCV45cbH13oRt5jW7Cdbi6wJAX8J3b")
  // );
  // console.log(digitalAssets.length);
  // if(digitalAssets)
  const digitalAssets = await repository.metaplex.fetchAllMintMetadata(
    ...mints
  );
  console.log(JSON.stringify(serializeBigInt(digitalAssets), undefined, 2));
}
