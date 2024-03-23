import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

import InjectRepository from "../injection";
import { catchAndReturnNull } from "../../utils";

export default class Token extends InjectRepository {
  async getTokenAccounts(address: string) {
    const wallet = new PublicKey(address);

    const tokenAccounts =
      await this.repository.connection.getParsedTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID,
      });
    const token2022Accounts =
      await this.repository.connection.getParsedTokenAccountsByOwner(wallet, {
        programId: TOKEN_2022_PROGRAM_ID,
      });

    return tokenAccounts.value.concat(token2022Accounts.value);
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

    return tokenAccounts ? tokenAccounts.value : null;
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
}
