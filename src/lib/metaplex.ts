import { PublicKey } from "@solana/web3.js";
import { publicKey } from "@metaplex-foundation/umi";
import {
  fetchJsonMetadata,
  safeFetchAllMetadata,
  type JsonMetadata,
  type Metadata,
  safeFetchMetadata,
  MPL_TOKEN_METADATA_PROGRAM_ID,
  fetchAllDigitalAssetByOwner,
} from "@metaplex-foundation/mpl-token-metadata";

import InjectRepository from "./injection";

const programId = new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID);

export type MetadataWithJsonMetadata = {
  jsonMetadata?: JsonMetadata;
} & Metadata;

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
      allMetadata.map(async (metadata: any) => {
        if (metadata.uri.trim().length > 0) {
          const jsonMetadata = await fetchJsonMetadata(umi, metadata.uri);
          metadata.jsonMetadata =
            typeof jsonMetadata === "string"
              ? JSON.parse(jsonMetadata)
              : jsonMetadata;
        } else {
          metadata.jsonMetadata = {
            mint: metadata.mint,
            name: metadata.name,
            image: `https://img.raydium.io/icon/${metadata.mint}.png`,
            symbol: metadata.symbol,
          };
        }

        return metadata as unknown as MetadataWithJsonMetadata;
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
    )) as MetadataWithJsonMetadata;

    if (metadata === null) return null;

    if (metadata.uri.trim().length > 0) {
      const jsonMetadata = await fetchJsonMetadata(umi, metadata.uri);
      metadata.jsonMetadata =
        typeof jsonMetadata === "string"
          ? JSON.parse(jsonMetadata)
          : jsonMetadata;
    }
    return metadata;
  }

  getDigitalAssetsByOwner(owner: string) {
    const { umi } = this.repository;

    return fetchAllDigitalAssetByOwner(umi, publicKey(owner));
  }
}
