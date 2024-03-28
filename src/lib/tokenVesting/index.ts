import {
  TOKEN_VESTING_PROGRAM_ID,
  getContractInfoByTokenAddress,
} from "@solocker/vesting";
import { PublicKey } from "@solana/web3.js";

import Repository from "../repository";
import InjectRepository from "../injection";

export class TokenVesting extends InjectRepository {
  constructor(repository: Repository) {
    super(repository);
  }

  async getContractInfoByOwner(wallet: string, programId?: string) {
    programId = programId ?? TOKEN_VESTING_PROGRAM_ID.toBase58();

    const { raydium, connection, token } = this.repository;
    const tokenAccounts = await token.getTokenAccounts(wallet);

    const lpInfos = await raydium.fetchAllPoolInfos(tokenAccounts);
    const contractInfos = await getContractInfoByTokenAddress(
      connection,
      new PublicKey(programId),
      ...lpInfos.map((r) => new PublicKey(r.lpTokenMetadata.mint))
    );

    return lpInfos.map((lpInfo) => {
      const contractInfo = contractInfos.find(
        (contractInfo) =>
          contractInfo?.mintAddress.toBase58() === lpInfo.lpTokenMetadata.mint
      )! as any;

      if (contractInfo) contractInfo.seeds = contractInfo.seeds.toString();

      return {
        lpInfo,
        contractInfo,
      };
    });
  }
}
