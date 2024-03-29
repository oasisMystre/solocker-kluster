import { ParsedAccountData, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

import { LpAuthority } from "./state";
import InjectRepository from "../injection";
import { catchAndReturnNull } from "../../utils";

export default class Token extends InjectRepository {
  async getTokenAccounts(address: string) {
    const wallet = new PublicKey(address);
    const { connection } = this.repository;

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      wallet,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    const token2022Accounts = await connection.getParsedTokenAccountsByOwner(
      wallet,
      {
        programId: TOKEN_2022_PROGRAM_ID,
      }
    );

    const tokenAccountsByOwner = tokenAccounts.value.concat(
      token2022Accounts.value
    );

    return Promise.all(
      tokenAccountsByOwner.map(async (tokenAccount) => {
        const mintAccountInfo = await connection.getParsedAccountInfo(
          new PublicKey(tokenAccount.account.data.parsed.info.mint)
        );
        return { tokenAccount, mintAccountInfo: mintAccountInfo.value };
      })
    );
  }

  async getTokenAccount(mintAddress: string, walletAddress: string) {
    const mint = new PublicKey(mintAddress);
    const wallet = new PublicKey(walletAddress);

    const connection = this.repository.connection;

    /// This can be null if mint don't have a tokenAccount
    const tokenAccounts = await catchAndReturnNull(
      connection.getParsedTokenAccountsByOwner(wallet, {
        mint,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    if (tokenAccounts) {
      const accountInfo = await connection.getParsedAccountInfo(mint);

      return {
        mintAccountInfo: accountInfo,
        tokenAccounts: tokenAccounts.value,
      };
    }

    return null;
  }

  async getAccountInfo(mintAddress: string) {
    const mint = new PublicKey(mintAddress);
    const connection = this.repository.connection;

    /// This can be null if mint don't have a tokenAccount
    const accountInfo = await catchAndReturnNull(
      connection.getParsedAccountInfo(mint)
    );

    return accountInfo && accountInfo.value
      ? [{ pubkey: mint, account: accountInfo.value }]
      : null;
  }

  async getLpTokenAccounts(
    address: string,
    lpAuthority: keyof typeof LpAuthority = "RAYDIUM_V4"
  ) {
    const tokenAccounts = await this.getTokenAccounts(address);
    const authority = LpAuthority[lpAuthority];

    return tokenAccounts
      .filter(
        ({ mintAccountInfo }) =>
          (
            mintAccountInfo!.data as ParsedAccountData
          ).parsed.info.mintAuthority?.toString() === authority
      )
      .map(({ tokenAccount }) => tokenAccount);
  }

  async getNormalTokenAccounts(address: string) {
    const tokenAccounts = await this.getTokenAccounts(address);
    const excludeLpAuthorities = Object.values(LpAuthority);

    return tokenAccounts
      .filter(
        ({ mintAccountInfo }) =>
          !excludeLpAuthorities.includes(
            (
              mintAccountInfo!.data as ParsedAccountData
            ).parsed.info.mintAuthority?.toString()
          )
      )
      .map(({ tokenAccount }) => tokenAccount);
  }
}
