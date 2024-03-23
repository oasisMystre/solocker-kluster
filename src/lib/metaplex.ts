import { publicKey } from "@metaplex-foundation/umi";
import {
  fetchJsonMetadata,
  safeFetchAllMetadata,
  type JsonMetadata,
  type Metadata,
  safeFetchMetadata,
  MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import InjectRepository from "./injection";
import { PublicKey } from "@solana/web3.js";

export type MetadataWithJsonMetadata = {
  jsonMetadata?: JsonMetadata;
} & Metadata;

export default class Metaplex extends InjectRepository {
  async fetchAllMintMetadata(...addresses: string[]) {
    const umi = this.repository.umi;
    const mints = addresses.map((mint) => publicKey(mint));
    const allMetadata = await safeFetchAllMetadata(umi, mints);

    return Promise.all(
      allMetadata.map(async (metadata: any) => {
        const jsonMetadata = await fetchJsonMetadata(umi, metadata.uri);
        metadata.jsonMetadata = jsonMetadata;
        return metadata as unknown as MetadataWithJsonMetadata;
      })
    );
  }

  async fetchMetadata(address: string) {
    const umi = this.repository.umi;

    const programId = new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID);
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
    if (metadata.uri.trim().length > 0)
      metadata.jsonMetadata = await fetchJsonMetadata(umi, metadata.uri);

    return metadata;
  }
}
