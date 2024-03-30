import { PublicKey } from "@solana/web3.js";

export const catchAndReturnNull = function <T extends Promise<any>>(
  promise: T
) {
  return new Promise<Awaited<T> | null>(async (resolve) => {
    promise.then((value) => resolve(value)).catch(() => resolve(null));
  });
};

export const serializeBigInt = <T extends object>(value: T) =>
  JSON.parse(
    JSON.stringify(value, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  ) as T;

export const isDeadWallet = (address: PublicKey) =>
  address.equals(new PublicKey("11111111111111111111111111111111"));

export const isURL = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};
