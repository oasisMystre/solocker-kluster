import { Connection, PublicKey } from "@solana/web3.js";

export default async function loadNativeToken(
  connection: Connection,
  walletAddress: string
) {
  const mint = new PublicKey("So11111111111111111111111111111111111111111");
  const wallet = new PublicKey(walletAddress);
  const balance = await connection.getBalance(wallet);
  const decimals = 6;
  const amount = balance / Math.pow(10, decimals);

  return {
    mint,
    name: "Solana",
    symbol: "SOL",
    publicKey: wallet.toBase58(),
    jsonMetadata: {
      name: "Solana",
      image:
        "https://img.raydium.io/icon/So11111111111111111111111111111111111111112.png",
      symbol: "SOL",
    },
    token: {
      isNative: true,
      mint: mint.toBase58(),
      owner: wallet.toBase58(),
      state: "initialized",
      tokenAmount: {
        decimals,
        amount: balance,
        uiAmount: amount,
        uiAmountString: amount.toString(),
      },
    },
  };
}
