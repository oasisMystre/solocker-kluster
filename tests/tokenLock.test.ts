import base58 from "bs58";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  unlock,
  generateRandomSeed,
  getContractInfoByTokenAddress,
  TOKEN_VESTING_PROGRAM_ID,
} from "@solocker/vesting";

import Repository from "../src/lib/repository";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

function loadWallet() {
  return Keypair.fromSecretKey(base58.decode(process.env.WALLET!));
}

export default async function tokenLock(repository: Repository) {
  const wallet = loadWallet();
  const seed = generateRandomSeed();
  const mint = new PublicKey("HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr");

  const senderAta = getAssociatedTokenAddressSync(mint, wallet.publicKey);

  const info = await getContractInfoByTokenAddress(
    repository.connection,
    TOKEN_VESTING_PROGRAM_ID,
    new PublicKey("C8jsBa48Ms9Ga6RM8TeZG2wt1fpkcVWvfrKW2gnXjJqB"),
    new PublicKey("42mdw3F7dzagzBTDGUb2dS2qAZzz6iz9SXF4gciN6Yo9")
  );

  console.log(info);

  // const t = await repository.token.getNormalTokenAccounts(wallet.publicKey.toBase58());
  // console.log(t.map(r => r.pubkey.toBase58()))
}
