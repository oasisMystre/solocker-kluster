import BN from "bn.js";
import { AccountInfo, ParsedAccountData, PublicKey } from "@solana/web3.js";

import InjectRepository from "./injection";
import { LpInfo } from "./shyft/models/lpInfo.model";
import { Account } from "@metaplex-foundation/umi";

export default class Raydium extends InjectRepository {
  async fetchAllPoolInfos(
    tokenAccounts: Awaited<
      ReturnType<typeof this.repository.token.getTokenAccounts>
    >
  ) {
    const lpMints = tokenAccounts.map(
      (tokenAccount) => tokenAccount.account.data.parsed.info.mint as string
    );

    const lpInfos = await this.repository.shyft.queryLpInfo({
      lpMint: { _in: lpMints },
    });

    return Promise.all(
      tokenAccounts
        .map((tokenAccount) => {
          const lpInfo = lpInfos.find(
            (lpInfo) =>
              lpInfo.lpMint === tokenAccount.account.data.parsed.info.mint
          );

          if (lpInfo) return this.fetchPoolInfo(lpInfo, tokenAccount);
        })
        .filter((value) => Boolean(value))
    );
  }

  async fetchPoolInfo(
    lpInfo: LpInfo,
    tokenAccount: {
      pubkey: PublicKey;
      account:
        | AccountInfo<ParsedAccountData>
        | AccountInfo<Buffer | ParsedAccountData>;
    }
  ) {
    const { metaplex, connection } = this.repository;

    const lpTokenMetadata = await metaplex.fetchMetadata(lpInfo.lpMint);

    const baseTokenMetadata = await metaplex.fetchMetadata(lpInfo.baseMint);
    const quoteTokenMetadata = await metaplex.fetchMetadata(lpInfo.quoteMint);

    const baseTokenBalance = await connection.getTokenAccountBalance(
      new PublicKey(lpInfo.baseVault)
    );

    const quoteTokenBalance = await connection.getTokenAccountBalance(
      new PublicKey(lpInfo.quoteVault)
    );

    const denominator = new BN(10).pow(new BN(lpInfo.baseDecimal));
    const tokenData = tokenAccount.account.data;

    return {
      lpTokenMetadata: lpTokenMetadata
        ? lpTokenMetadata
        : {
            mint: lpInfo.lpMint,
            name: "UNKNOWN LP TOKEN",
            symbol: [
              lpInfo.lpMint.substring(0, 4),
              lpInfo.lpMint.substring(28, 32),
            ].join("..."),
          },
      quoteTokenMetadata,
      baseTokenMetadata,
      lpTokenDecimal:
        "parsed" in tokenData
          ? "tokenAmount" in tokenData.parsed.info
            ? tokenData.parsed.info.tokenAmount.decimals
            : tokenData.parsed.info.decimals
          : lpInfo.baseDecimal,
      baseTokenDecimal: lpInfo.baseDecimal,
      quoteTokenDecimal: lpInfo.quoteDecimal,
      baseVaultBalance: baseTokenBalance.value.uiAmount,
      quoteVaultBalance: quoteTokenBalance.value.uiAmount,
      totalLpAmount: new BN(lpInfo.lpReserve).div(denominator).toNumber(),
      addedLpAmount:
        "parsed" in tokenData && "tokenAmount" in tokenData.parsed.info
          ? tokenData.parsed.info.tokenAmount.uiAmount
          : 0,
    };
  }
}
