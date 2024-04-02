import Repository from "../src/lib/repository";
import { serializeBigInt } from "../src/utils";

export default async function raydiumTest(
  repository: Repository,
  wallet: string
) {
  const tokenAccounts = await repository.token.getLpTokenAccounts(wallet);
  const lpInfos = await repository.raydium.fetchTokenAccountsLpPoolInfo(
    tokenAccounts
  );
  console.log(JSON.stringify(serializeBigInt(lpInfos), undefined, 2));
}
