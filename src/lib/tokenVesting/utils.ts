import base58 from "bs58";

export function extractSeedFromTxData(hash: string) {
  let buffer = base58.decode(hash);
  let seed = buffer.slice(1, 33).buffer;
  seed = seed.slice(0, 31);

  return Buffer.from(seed).toString();
}
