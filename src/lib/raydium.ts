import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";

import InjectRepository from "./injection";
import { LpInfo } from "./shyft/models/lpInfo.model";

export default class Raydium extends InjectRepository {
  async loadTokenAccountsPoolInfo(
    tokenAccounts: Awaited<
      ReturnType<typeof this.repository.token.getLpTokenAccounts>
    >
  ) {
    const { shyft, metaplex } = this.repository;

    const lpMints = tokenAccounts.map(
      (tokenAccount) => tokenAccount.account.data.parsed.info.mint as string
    );

    const lpInfos = await shyft.queryLpInfo({
      lpMint: { _in: lpMints },
    });

    const mints = new Set<string>();

    const lpInfoAndTokenAccounts = lpInfos.map((lpInfo) => {
      const tokenAccount = tokenAccounts.find(
        (tokenAccount) =>
          tokenAccount.account.data.parsed.info.mint === lpInfo.lpMint
      )!;

      mints.add(lpInfo.lpMint);
      mints.add(lpInfo.baseMint);
      mints.add(lpInfo.quoteMint);

      return [lpInfo, tokenAccount] as [
        LpInfo,
        Awaited<
          ReturnType<typeof this.repository.token.getLpTokenAccounts>
        >[number]
      ];
    });

    const mintsMetadata = await metaplex.fetchAllMintMetadata(...mints);

    const lpInfoAndTokenAccountsWithMetadata = lpInfoAndTokenAccounts.map(
      ([lpInfo, tokenAccount]) => {
        const lpMintMetadata = mintsMetadata.find(
          (metadata) => metadata.mint.toString() === lpInfo.lpMint
        );

        const baseMintMetadata = mintsMetadata.find(
          (metadata) => metadata.mint.toString() === lpInfo.baseMint
        );

        const quoteMintMetadata = mintsMetadata.find(
          (metadata) => metadata.mint.toString() === lpInfo.quoteMint
        );

        return {
          ...lpInfo,
          lpMintMetadata,
          baseMintMetadata,
          quoteMintMetadata,
          tokenAccount,
        };
      }
    );

    return lpInfoAndTokenAccountsWithMetadata;
  }

  async fetchTokenAccountsLpPoolInfo(
    tokenAccounts: Awaited<
      ReturnType<typeof this.repository.token.getLpTokenAccounts>
    >
  ) {
    const tokenAccountsPoolInfo = await this.loadTokenAccountsPoolInfo(
      tokenAccounts
    );
    return Promise.all(
      tokenAccountsPoolInfo.map((tokenAccountPoolInfo) =>
        this.fetchLpPoolInfo(tokenAccountPoolInfo)
      )
    );
  }

  async fetchLpPoolInfo(
    lpInfo: Awaited<ReturnType<typeof this.loadTokenAccountsPoolInfo>>[number]
  ) {
    // const { connection } = this.repository;

    const lpTokenMetadata = lpInfo.lpMintMetadata;
    const baseTokenMetadata = lpInfo.baseMintMetadata;
    const quoteTokenMetadata = lpInfo.quoteMintMetadata;

    // const baseTokenBalance = await connection.getTokenAccountBalance(
    //   new PublicKey(lpInfo.baseVault)
    // );

    // const quoteTokenBalance = await connection.getTokenAccountBalance(
    //   new PublicKey(lpInfo.quoteVault)
    // );

    const denominator = new BN(10).pow(new BN(lpInfo.baseDecimal));
    const tokenData = lpInfo.tokenAccount.account.data;

    return {
      pubKey: lpInfo.tokenAccount.pubkey,
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
      // baseVaultBalance: baseTokenBalance.value.uiAmount,
      // quoteVaultBalance: quoteTokenBalance.value.uiAmount,
      totalLpAmount: new BN(lpInfo.lpReserve).div(denominator).toNumber(),
      addedLpAmount:
        "parsed" in tokenData && "tokenAmount" in tokenData.parsed.info
          ? tokenData.parsed.info.tokenAmount.uiAmount
          : 0,
    };
  }
}
