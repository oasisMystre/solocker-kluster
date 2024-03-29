import base58 from "bs58";
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  create,
  generateRandomSeed,
  Numberu64,
  Schedule,
  unlock,
} from "@solocker/vesting";

import Repository from "../src/lib/repository";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

function loadWallet() {
  return Keypair.fromSecretKey(
    base58.decode(
      "5qWasCur7QztesTwMnyNFNQPaMcgGXRQkJ6aGn27gg4Hwt4onnwemcVfZM2zjQMm2rQhyVDFoydfV6nQefVpGVYh"
    )
  );
}

export const TOKEN_VESTING_PROGRAM_ID = new PublicKey(
  "888UZeqfZHU8oMmLJdcEgGGYRWwWKSG8Jx1DU83EDxCx"
);

export default async function tokenLock(repository: Repository) {
  const wallet = loadWallet();
  const seed = generateRandomSeed();
  const mint = new PublicKey("HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr");

  const senderAta = getAssociatedTokenAddressSync(mint, wallet.publicKey);
console.log(seed)

    // const instructions = await create(
    //   repository.connection,
    //   TOKEN_VESTING_PROGRAM_ID,
    //   Buffer.from(seed),
    //   wallet.publicKey,
    //   wallet.publicKey,
    //  senderAta,
    //   senderAta,
    //   new PublicKey("HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr"),
    //   [
    //     Schedule.new(
    //       new Numberu64(Math.round(Date.now() / 1000) + 2 * 60),
    //       new Numberu64(0.5 * Math.pow(10, 6))
    //     ),
    //   ]
    // );

  const instructions = await unlock(
    repository.connection,
    TOKEN_VESTING_PROGRAM_ID,
    Buffer.from("4717331768400466640386444062827885496678185520348278193136282413"),
    mint
  );
  const transaction = new Transaction().add(...instructions);
  const tx = await sendAndConfirmTransaction(
    repository.connection,
    transaction,
    [wallet]
  );

  console.log("Tx: ", tx);
}
