import { PublicKey } from "@solana/web3.js";
import { publicKey, Umi } from "@metaplex-foundation/umi";
import {
  fetchJsonMetadata,
  safeFetchAllMetadata,
  type JsonMetadata,
  type Metadata,
  safeFetchMetadata,
  MPL_TOKEN_METADATA_PROGRAM_ID
} from "@metaplex-foundation/mpl-token-metadata";

import InjectRepository from "./injection";
import { catchAndReturnNull, isURL } from "../utils";

const programId = new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID);

export type MetadataWithJsonMetadata = {
  jsonMetadata?: JsonMetadata;
} & Metadata;

export const getDefaultJsonMetadata = (metadata: Metadata) => {
  return {
    mint: metadata.mint,
    name: metadata.name,
    symbol: metadata.symbol,
    image: `https://img.raydium.io/icon/${metadata.mint}.png`,
  };
};

export async function safeFetchJsonMetadata(umi: Umi, metadata: Metadata) {
  if (isURL(metadata.uri)) {
    const jsonMetadata = await catchAndReturnNull(
      fetchJsonMetadata(umi, metadata.uri)
    );

    if (jsonMetadata)
      return typeof jsonMetadata === "string"
        ? JSON.parse(jsonMetadata)
        : jsonMetadata;
  }

  return getDefaultJsonMetadata(metadata);
}

export default class Metaplex extends InjectRepository {
  async fetchAllMintMetadata(...addresses: string[]) {
    const umi = this.repository.umi;
    const mints = addresses.map((mint) => {
      const [pda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          programId.toBuffer(),
          new PublicKey(mint).toBuffer(),
        ],
        programId
      );

      return publicKey(pda);
    });

    const allMetadata = await safeFetchAllMetadata(umi, mints);

    return Promise.all(
      allMetadata.map(async (metadata: MetadataWithJsonMetadata) => {
        metadata.jsonMetadata = await safeFetchJsonMetadata(umi, metadata);
        return metadata;
      })
    );
  }

  async fetchMetadata(address: string) {
    const umi = this.repository.umi;

    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        programId.toBuffer(),
        new PublicKey(address).toBuffer(),
      ],
      programId
    );

    const metadata = (await safeFetchMetadata(
      umi,
      publicKey(pda.toBase58())
    )) as MetadataWithJsonMetadata | null;

    if (metadata === null) return null;

    metadata.jsonMetadata = await safeFetchJsonMetadata(umi, metadata);

    return metadata;
  }
}
